const MAX_ATTEMPTS = 3;
const RATE_LIMIT = 5;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

async function visitorKey(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const salt = env.CONTACT_TOKEN || "local-development-only";
  const bytes = new TextEncoder().encode(salt + ":" + ip);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function checkRateLimit(request, env) {
  const key = await visitorKey(request, env);
  const windowStart = Math.floor(Date.now() / 3600000) * 3600;

  const result = await env.DB.prepare(`
    INSERT INTO contact_rate_limits
      (visitor_key, window_start, request_count)
    VALUES (?, ?, 1)
    ON CONFLICT(visitor_key, window_start)
    DO UPDATE SET request_count = request_count + 1
    RETURNING request_count
  `).bind(key, windowStart).first();

  return result.request_count <= RATE_LIMIT;
}

async function sendNotification(env, inquiry) {
  if (!env.APPS_SCRIPT_URL || !env.CONTACT_TOKEN) {
    return;
  }

  // Claim one delivery attempt before contacting Gmail.
  const claim = await env.DB.prepare(`
    UPDATE inquiries
    SET notification_attempts = notification_attempts + 1,
        notification_status = 'failed'
    WHERE id = ?
      AND notification_status IN ('pending', 'failed')
      AND notification_attempts < ?
    RETURNING notification_attempts
  `).bind(inquiry.id, MAX_ATTEMPTS).first();

  if (!claim) return;

  try {
    const response = await fetch(env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        ...inquiry,
        token: env.CONTACT_TOKEN
      }),
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      throw new Error("Notification HTTP error");
    }

    const result = await response.json();

    if (result.success !== true) {
      throw new Error("Notification service returned failure");
    }

    await env.DB.prepare(`
      UPDATE inquiries
      SET notification_status = 'sent',
          notified_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND notification_status = 'failed'
        AND notification_attempts = ?
    `).bind(inquiry.id, claim.notification_attempts).run();

  } catch (error) {
    console.error("Gmail notification failed:", String(error));
    // The inquiry remains stored, ready for another attempt.
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/waitlist") {
      if (request.method !== "POST")
        return json({ error: "Method not allowed" }, 405);

      const origin = request.headers.get("Origin");
      if (origin && origin !== url.origin)
        return json({ error: "Invalid origin" }, 403);

      try {
        if (!request.headers.get("Content-Type")?.includes("application/json"))
          return json({ error: "JSON required" }, 415);

        const raw = await request.text();
        if (raw.length > 2048)
          return json({ error: "Too large" }, 413);

        const data = JSON.parse(raw);
        if (!data || typeof data !== "object" || Array.isArray(data))
          return json({ error: "Invalid request" }, 400);

        if (data.website) return json({ success: true });

        const email = typeof data.email === "string"
          ? data.email.trim().toLowerCase() : "";

        if (email.length > 254 ||
            !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))
          return json({ error: "Invalid email" }, 400);

        if (!(await checkRateLimit(request, env)))
          return json({ error: "Too many requests" }, 429);

        await env.DB.prepare(
          "INSERT OR IGNORE INTO supply_waitlist (email) VALUES (?)"
        ).bind(email).run();

        return json({ success: true });
      } catch (error) {
        console.error("Waitlist error:", error);
        return json({ error: "Registration unavailable" }, 500);
      }
    }


    if (url.pathname !== "/api/contact") {
      return json({ error: "Not found." }, 404);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405);
    }

    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) {
      return json({ error: "Invalid origin." }, 403);
    }

    try {
      if (!request.headers.get("Content-Type")
        ?.includes("application/json")) {
        return json({ error: "JSON required." }, 415);
      }

      const raw = await request.text();

      if (raw.length > 10000) {
        return json({ error: "Submission too large." }, 413);
      }

      const data = JSON.parse(raw);

      if (!data || typeof data !== "object" ||
          Array.isArray(data)) {
        return json({ error: "Invalid submission." }, 400);
      }

      if (data.website) {
        return json({ success: true });
      }

      const name =
        typeof data.name === "string" ? data.name.trim() : "";
      const email =
        typeof data.email === "string" ? data.email.trim() : "";
      const project =
        typeof data.project_type === "string"
          ? data.project_type.trim() : "";
      const message =
        typeof data.message === "string" ? data.message.trim() : "";

      if (
        name.length < 2 || name.length > 100 ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        project.length < 2 || project.length > 100 ||
        message.length < 5 || message.length > 5000
      ) {
        return json({
          error: "Please check your form details."
        }, 400);
      }

      if (!(await checkRateLimit(request, env))) {
        return json({
          error: "Too many submissions. Please try later."
        }, 429);
      }

      const result = await env.DB.prepare(`
        INSERT INTO inquiries
          (name, email, project_type, message)
        VALUES (?, ?, ?, ?)
      `).bind(name, email, project, message).run();

      const inquiry = {
        id: result.meta.last_row_id,
        name,
        email,
        project_type: project,
        message
      };

      ctx.waitUntil(sendNotification(env, inquiry));

      return json({ success: true });

    } catch (error) {
      console.error("Contact API failed:", String(error));
      return json({
        error: "Unable to save inquiry. Please try again."
      }, 500);
    }
  },

  async scheduled(controller, env) {
    if (!env.APPS_SCRIPT_URL || !env.CONTACT_TOKEN) {
      console.error("Notification secrets missing");
      return;
    }

    const rows = await env.DB.prepare(`
      SELECT id, name, email, project_type, message
      FROM inquiries
      WHERE notification_status IN ('pending', 'failed')
        AND notification_attempts < ?
      ORDER BY created_at ASC
      LIMIT 10
    `).bind(MAX_ATTEMPTS).all();

    for (const inquiry of rows.results) {
      await sendNotification(env, inquiry);
    }

    // Remove expired rate-limit records.
    const cutoff = Math.floor(Date.now() / 1000) - 172800;

    await env.DB.prepare(`
      DELETE FROM contact_rate_limits
      WHERE window_start < ?
    `).bind(cutoff).run();
  }
};
