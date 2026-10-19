# MZNJBL/ — Static Website Prototype

A zero-build, database-free, responsive, multi-page creative studio website. Open using a local HTTP server (for example `python3 -m http.server 8000` from this directory). Do not double-click pages as `file://` does not support the intended root-relative routes.

## Pages
- `/` — Landing page, portfolio invitation, interactive lab, services, process, contact.
- `/about.html` — Chronological archive with category filters and two writing styles.
- `/projects.html` — Project index.
- `/projects/studio.html` — Self-initiated case study.
- `/privacy.html` — Draft, **not legal clearance**.

## v2.0 status
- Brand renamed to **MZNJBL/** throughout the pages and metadata. Name clearance is not complete.
- Origin record explains MZN + JBL, the late father tribute, and the user's approved business-name-check jokes.
- Confirmed WhatsApp and business email are linked from the homepage.
- Sanitized retail-focused résumé is available under `/assets/`; it excludes personal phone number, personal email and location.
- Contact form is **NOT live**. `config.formEndpoint` remains empty until a real provider is connected and delivery tested. Do not tell clients that form inquiries are sent.
- Privacy page remains a draft until form service and privacy practices are confirmed.
- Validate layouts and animation in a real browser before public launch; no browser test claim is made here.

## Publishing
No framework or package install required. Upload the directory contents to a static host. Cloudflare Pages Direct Upload is one option. A custom domain is optional (a provider subdomain is generally available). Because content uses root-absolute asset routes, host at the domain root. This is a ready-to-preview site, not a completed business launch.

## Design direction
MZNJBL/ = **Design philosophy: Justified. Unconventional. Built. Launched.** The brand name MZNJBL is derived from Mohamizan (MZN) and Jubli (JBL), the founder's late father. Creative personality: industrial, fluid, deadpan. Client communications: straightforward, professional.


## v2.0 rename release
- Updated brand, footer, page titles and founder origin copy.
- Updated About archive version indicator and asset query strings.
- Added public résumé PDF and WhatsApp contact.

## Contact form (v2.1)

FormSubmit AJAX endpoint is configured for jubli.hello01@gmail.com. The first successful test submission triggers an activation message to that inbox. **The owner must open that email and activate the form before treating it as live.** Check spam too. Then submit a second test and confirm receipt and Reply-To behavior.

Name and email remain required to allow replies; message has no minimum or maximum character-count restriction, and the redundant contact-consent checkbox has been removed. No API keys or paid backend required. FormSubmit is a third-party processor; keep privacy notice accurate.
