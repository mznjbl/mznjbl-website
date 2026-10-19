(()=>{'use strict';
 const config={studioEmail:'jubli.hello01@gmail.com',whatsappNumber:'60199321533',formEndpoint:'https://formsubmit.co/ajax/1c97974bee4454ccb1b0ee545b349b0e'}; // Set only verified public contact details before launch.
 document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
 const menuButton=document.querySelector('.menu-button'),menu=document.querySelector('.menu-overlay');
 function closeMenu(){if(!menuButton||!menu)return;menu.classList.remove('open');menu.inert=true;menuButton.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');}
 menuButton?.addEventListener('click',()=>{const active=menu.classList.toggle('open');menu.inert=!active;menuButton.setAttribute('aria-expanded',String(active));document.body.classList.toggle('menu-open',active);if(active)menu.querySelector('a')?.focus();});
 menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 document.documentElement.dataset.jublVersion='2.0.0';
 
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
 const glow=document.querySelector('.cursor-glow');if(glow&&!reduced&&matchMedia('(pointer:fine)').matches){window.addEventListener('pointermove',e=>{glow.style.opacity='1';glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';},{passive:true});}
 if(document.body.dataset.page==='home'){
   const preview=document.getElementById('forgePreview'),display=document.getElementById('labDisplay'),headline=document.getElementById('forgeHeadline'),title=document.getElementById('forgeTitle'),range=document.getElementById('shapeRange'),out=document.getElementById('shapeOutput'),metric=document.getElementById('shapeMetric'),status=document.getElementById('forgeStatus');
   const palettes={acid:'#d7ff35',orange:'#ff8458',blue:'#8bcaff'};let currentAccent='acid',currentLayout='bold';
   function setEnergy(n){preview?.style.setProperty('--energy',String(Number(n)/100));if(out)out.textContent=n+'%';if(metric)metric.textContent='ENERGY_'+String(n).padStart(3,'0');}
   function setAccent(name){currentAccent=name;preview?.style.setProperty('--forge-accent',palettes[name]);document.querySelectorAll('[data-accent]').forEach(b=>{const on=b.dataset.accent===name;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});}
   function setLayout(name){currentLayout=name;if(preview)preview.dataset.layout=name;document.querySelectorAll('[data-layout]').forEach(b=>{const on=b.dataset.layout===name;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});}
   headline?.addEventListener('input',()=>{if(title)title.textContent=headline.value.trim()||'YOUR IDEA GOES HERE.';if(status)status.textContent='LIVE PREVIEW UPDATED // '+headline.value.length+' CHARACTERS';});
   range?.addEventListener('input',()=>setEnergy(range.value));setEnergy(range?.value||54);
   document.querySelectorAll('[data-accent]').forEach(b=>b.addEventListener('click',()=>setAccent(b.dataset.accent)));
   document.querySelectorAll('[data-layout]').forEach(b=>b.addEventListener('click',()=>setLayout(b.dataset.layout)));
   display?.addEventListener('pointermove',e=>{if(reduced||!preview)return;const r=preview.getBoundingClientRect();const x=Math.min(100,Math.max(0,(e.clientX-r.left)/r.width*100)),y=Math.min(100,Math.max(0,(e.clientY-r.top)/r.height*100));preview.style.setProperty('--mx',x+'%');preview.style.setProperty('--my',y+'%');});
   const phrases=['MAKE SOME NOISE.','YOUR BUSINESS, BUT LOUDER.','ORDINARY IS OPTIONAL.','WE BUILD THE WEIRD.','NOT BUILT FROM A TEMPLATE.'];
   document.getElementById('randomize')?.addEventListener('click',()=>{const text=phrases[Math.floor(Math.random()*phrases.length)];headline.value=text;title.textContent=text;const names=Object.keys(palettes);setAccent(names[Math.floor(Math.random()*names.length)]);const layouts=['bold','editorial','minimal'];setLayout(layouts[Math.floor(Math.random()*layouts.length)]);range.value=String(Math.floor(Math.random()*76)+25);setEnergy(range.value);status.textContent='DESIGN MUTATION COMPLETE. NO WARRANTIES WERE HARMED.';});
   let launchTimeout,flashTimeout;
   function refreshPreview(){if(reduced||!preview)return;preview.classList.remove('preview-flash');void preview.offsetWidth;preview.classList.add('preview-flash');clearTimeout(flashTimeout);flashTimeout=setTimeout(()=>preview.classList.remove('preview-flash'),780);}
   document.getElementById('launchForge')?.addEventListener('click',()=>{if(!preview)return;clearTimeout(launchTimeout);preview.classList.remove('is-launching');void preview.offsetWidth;preview.classList.add('is-launching');status.textContent='DEPLOYMENT SIMULATION STARTED // NO SERVER NEEDED';launchTimeout=setTimeout(()=>{preview.classList.remove('is-launching');status.textContent='PREVIEW LIVE. APPROVAL FROM THE INTERNET: PENDING.';},reduced?50:1450);});
   document.getElementById('copyForge')?.addEventListener('click',async()=>{const css=`/* MZNJBL/ LAB EXPORT — starter design tokens */\n:root { --accent: ${palettes[currentAccent]}; --motion-energy: ${range.value}; --layout: ${currentLayout}; }\n.hero-title { color: var(--accent); }`;try{await navigator.clipboard.writeText(css);status.textContent='CSS TOKENS COPIED. GO MAKE SOMETHING.';}catch{status.textContent='CLIPBOARD UNAVAILABLE. USE HTTPS OR LOCALHOST.';}});
 }
 if(document.body.dataset.page==='about'){
  const filterButtons=[...document.querySelectorAll('[data-filter]')];const entries=[...document.querySelectorAll('.archive-entry')];let activeFilter='all';
  filterButtons.forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;filterButtons.forEach(x=>{const current=x===b;x.classList.toggle('active',current);x.setAttribute('aria-pressed',String(current));});entries.forEach(e=>e.hidden=activeFilter!=='all'&&e.dataset.category!==activeFilter);}));
  const modeButtons=[...document.querySelectorAll('[data-mode]')];modeButtons.forEach(b=>b.addEventListener('click',()=>{const mode=b.dataset.mode;modeButtons.forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});document.querySelectorAll('[data-playful][data-professional]').forEach(e=>e.textContent=e.dataset[mode==='professional'?'professional':'playful']);}));
 }
 document.querySelectorAll('[data-contact-email]').forEach(a=>{if(config.studioEmail){a.href='mailto:'+config.studioEmail;a.textContent='EMAIL: '+config.studioEmail.toUpperCase()+' ↗';}});
 document.querySelectorAll('[data-contact-whatsapp]').forEach(a=>{if(config.whatsappNumber){a.href='https://wa.me/'+config.whatsappNumber.replace(/\D/g,'')+'?text='+encodeURIComponent("Hello MZNJBL/, I'd like to discuss a website project.");a.textContent='WHATSAPP: START CONVERSATION ↗';a.target='_blank';a.rel='noopener noreferrer';}});
 const form=document.getElementById('contactForm'),status=document.getElementById('formStatus');
 form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(!form.reportValidity()) return;
  if(form.elements._honey?.value) return;
  const submit=form.querySelector('button[type=submit]');
  submit.disabled=true;
  status.style.color='#535b4b';
  status.textContent='SENDING YOUR INQUIRY...';
  try {
   const data=Object.fromEntries(new FormData(form).entries());
   const response=await fetch(config.formEndpoint,{
    method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify(data)
   });
   const result=await response.json();
   if(!response.ok || result.success===false || result.success==='false') throw new Error('FormSubmit rejected this submission');
   form.reset();
   status.textContent="MESSAGE TRANSMITTED. We'll get back to you soon, human. If you don't hear from us, feel free to reach out via WhatsApp.";
   status.style.color='#28502c';
  } catch(err) {
   status.textContent='SUBMISSION NOT CONFIRMED. Please use the direct email or WhatsApp link instead.';
   status.style.color='#7a3c24';
  } finally {submit.disabled=false;}
 });
})();
