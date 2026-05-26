/* La Ribera Audiovisual — CMS público v3.1 */
(function(){
  'use strict';
  const CONTENT_ROW_ID = 'main';
  const DEFAULT_CONTENT = window.RIBERA_CONTENT || { site:{}, seo:{}, services:[], workflow:{steps:[]}, heroCarousel:[], portfolioWorks:[] };
  const state = { content: normalizeContent(DEFAULT_CONTENT), modalIndex: 0, modalWork: null, carouselTimer: null, trackedPageView:false };

  function cfg(){ return window.RIBERA_SUPABASE || {}; }
  function configured(){ const c=cfg(); return !!(c.url && c.anonKey && !String(c.url).includes('TU-PROYECTO') && !String(c.anonKey).includes('TU_ANON')); }
  function client(){ if(!configured() || !window.supabase) return null; if(!window.__RIBERA_SB) window.__RIBERA_SB=window.supabase.createClient(cfg().url,cfg().anonKey); return window.__RIBERA_SB; }
  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function attr(v){ return esc(v).replace(/`/g,'&#96;'); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function publishedWorks(c=state.content){ return arr(c.portfolioWorks).filter(w => (w.status || 'published') === 'published'); }
  function visibleServices(c=state.content){ return arr(c.services).filter(s => s.visible !== false); }

  function defaultServices(){ return [
    {id:'srv-01',title:'PRODUCCIÓN PUBLICITARIA',description:'Avisos, spots y piezas de campaña con dirección creativa integral. De la idea a la pantalla.',tag:'Campaña · Spot · Aviso',icon:'play',visible:true,mediaUrl:'',type:'image',alt:'Producción publicitaria — La Ribera Audiovisual'},
    {id:'srv-02',title:'VIDEOCLIP',description:'Producción de videoclips para artistas y bandas. Concepto visual, dirección, locación y post-producción.',tag:'Artistas · Bandas · Música',icon:'video',visible:true,mediaUrl:'',type:'image',alt:'Videoclip — La Ribera Audiovisual'},
    {id:'srv-03',title:'IDENTIDAD EN VIDEO',description:'Construcción narrativa de la identidad de marca a través del lenguaje audiovisual.',tag:'Reel · Institucional · Marca',icon:'film',visible:true,mediaUrl:'',type:'image',alt:'Identidad en video — La Ribera Audiovisual'},
    {id:'srv-04',title:'CONTENIDO DIGITAL',description:'Piezas para redes, plataformas y canales propios. Pensadas para durar y para circular.',tag:'Redes · Plataformas · Digital',icon:'grid',visible:true,mediaUrl:'',type:'image',alt:'Contenido digital — La Ribera Audiovisual'},
    {id:'srv-05',title:'MARCA PERSONAL',description:'Visibilizamos quién sos. Para profesionales, artistas, creadores y fundadores.',tag:'Personal · Artistas · Profesionales',icon:'person',visible:true,mediaUrl:'',type:'image',alt:'Marca personal — La Ribera Audiovisual'}
  ]; }
  function ensureDefaultServices(list){
    const defs=defaultServices(); const current=Array.isArray(list)?list:[];
    if(current.length>=defs.length) return current;
    const used=new Set();
    const merged=defs.map(d=>{ const found=current.find(x=>x && x.id===d.id); if(found){ used.add(found.id); return Object.assign({}, d, found); } return d; });
    current.forEach(x=>{ if(x && !used.has(x.id) && !defs.some(d=>d.id===x.id)) merged.push(x); });
    return merged;
  }
  function defaultWorkflow(){ return {
    sectionLabel:'Cómo trabajamos',
    title:'DE LA IDEA\nA LA PIEZA FINAL',
    lead:'Un proceso claro para que la producción no dependa de improvisación. En La Ribera ordenamos la idea, producimos con criterio y entregamos material listo para usar.',
    steps:[
      {id:'wf-01',title:'BRIEF',description:'Definimos objetivo, público, tono, referencias y piezas necesarias antes de producir.'},
      {id:'wf-02',title:'PROPUESTA CREATIVA',description:'Bajamos concepto, estética, formato, locaciones y plan de producción.'},
      {id:'wf-03',title:'PRODUCCIÓN',description:'Rodaje, fotografía o generación de contenido con dirección visual y control operativo.'},
      {id:'wf-04',title:'POSTPRODUCCIÓN',description:'Edición, color, retoque, sonido y adaptación a los formatos requeridos.'},
      {id:'wf-05',title:'ENTREGA',description:'Material final optimizado para redes, web, campaña, prensa o uso interno.'}
    ]
  }; }

  function normalizeContent(raw){
    const c = raw && typeof raw === 'object' ? JSON.parse(JSON.stringify(raw)) : {};
    c.site = Object.assign({
      heroEyebrow:'Buenos Aires · Producción Audiovisual · Est. 2022',
      heroTitleLine1:'LA RIBERA', heroTitleAccent:'AUDIO', heroTitleLine3:'VISUAL',
      heroSlogan:'Pone el ojo.',
      heroDescription:'Resolución creativa de tu identidad. Concepto, producción y entrega con propósito.',
      portfolioIntro:'Video, fotografía, retratos y contenido de producto. Cada proyecto con su historia.',
      instagramUrl:'https://www.instagram.com/laribera.audiovisual/',
      whatsappDisplay:'+54 9 11 3226-5225', whatsappWa:'5491132265225',
      whatsappText:'Hola La Ribera Audiovisual, me interesa hablar sobre un proyecto',
      email:'hola@laribera.audiovisual.com',
      aboutParagraphs:[
        'Somos una productora de contenidos audiovisuales fundada con una convicción: la imagen tiene que decir algo verdadero sobre quien la emite.',
        'Trabajamos con marcas, empresas y personas que quieren comunicar con precisión. Sin ruido. Sin relleno. Con identidad.',
        'La Ribera es el espacio donde la imagen y la identidad se encuentran. Donde lo que sos se convierte en lo que se ve.'
      ],
      manifestoQuote:'La imagen que no dice nada sobre quien la emite es ruido. Nosotros hacemos señal.',
      manifestoAttr:'— La Ribera Audiovisual · Buenos Aires'
    }, c.site || {});
    c.seo = Object.assign({
      title:'La Ribera Audiovisual — Producción audiovisual en Buenos Aires',
      description:'Productora audiovisual en Buenos Aires. Video, fotografía, campañas, contenido digital, retratos y foto producto.',
      image:'logo-ribera.png',
      keywords:'productora audiovisual, fotografía, video, Buenos Aires, videoclip, foto producto'
    }, c.seo || {});
    c.photography = Object.assign({
      sectionTitle:'LA IMAGEN\nQUIETA',
      paragraphs:[
        'No todo necesita moverse para impactar. En La Ribera trabajamos la fotografía con la misma intención y criterio que el video: cada encuadre construye identidad.',
        'Foto fija, retratos y contenido de producto con dirección de arte, luz trabajada y un ojo entrenado para comunicar.'
      ],
      quote:'UNA BUENA FOTO\nDICE LO QUE MIL\nPALABRAS NO PUEDEN.',
      cite:'— La Ribera Audiovisual',
      cards:[
        {id:'photo-01',label:'Especialidad 01',title:'FOTO FIJA',description:'Producción fotográfica para campañas, eventos, backstage y contenido editorial. Cada toma tiene intención. Cada luz, un porqué.',tags:['Campañas','Editorial','Backstage','Eventos'],mediaUrl:'',type:'image',alt:'Foto fija — La Ribera Audiovisual',visible:true},
        {id:'photo-02',label:'Especialidad 02',title:'RETRATOS',description:'Sesiones de retrato para profesionales, artistas, músicos y creadores. Construimos tu imagen con propósito: para que quien te vea entienda quién sos.',tags:['Profesionales','Artistas','Músicos','Prensa'],mediaUrl:'',type:'image',alt:'Retratos — La Ribera Audiovisual',visible:true},
        {id:'photo-03',label:'Especialidad 03',title:'FOTO PRODUCTO',description:'Fotografía de producto para e-commerce, catálogos y comunicación de marca. Luz, composición y post: hacemos que tu producto entre por los ojos.',tags:['E-commerce','Catálogo','Pack shots','Lifestyle'],mediaUrl:'',type:'image',alt:'Foto producto — La Ribera Audiovisual',visible:true}
      ]
    }, c.photography || {});
    c.photography.cards = arr(c.photography.cards);
    c.services = ensureDefaultServices(c.services);
    c.workflow = Object.assign(defaultWorkflow(), c.workflow || {});
    c.workflow.steps = arr(c.workflow.steps).length ? arr(c.workflow.steps) : defaultWorkflow().steps;
    c.heroCarousel = arr(c.heroCarousel);
    c.portfolioWorks = arr(c.portfolioWorks).map((w,i)=>Object.assign({status:'published',featured:i<5,media:[]},w));
    return c;
  }

  function mergeContent(remote){
    const base = normalizeContent(DEFAULT_CONTENT);
    if(!remote || typeof remote !== 'object') return base;
    const c = normalizeContent(remote);
    return Object.assign(base, c, {
      site:Object.assign({}, base.site, c.site || {}),
      seo:Object.assign({}, base.seo, c.seo || {}),
      services:ensureDefaultServices(Array.isArray(remote.services) ? remote.services : base.services),
      workflow:remote.workflow && typeof remote.workflow === 'object' ? Object.assign({}, base.workflow, remote.workflow, {steps:Array.isArray(remote.workflow.steps)?remote.workflow.steps:base.workflow.steps}) : base.workflow,
      photography:remote.photography && typeof remote.photography === 'object' ? Object.assign({}, base.photography, remote.photography, {cards:Array.isArray(remote.photography.cards)?remote.photography.cards:base.photography.cards}) : base.photography,
      heroCarousel:Array.isArray(remote.heroCarousel) ? remote.heroCarousel : base.heroCarousel,
      portfolioWorks:Array.isArray(remote.portfolioWorks) ? remote.portfolioWorks : base.portfolioWorks
    });
  }
  async function loadContent(){
    const sb = client();
    if(!sb) return normalizeContent(DEFAULT_CONTENT);
    try{
      const { data, error } = await sb.from('site_content').select('content').eq('id', CONTENT_ROW_ID).maybeSingle();
      if(error) throw error;
      return mergeContent(data && data.content ? data.content : DEFAULT_CONTENT);
    }catch(err){
      console.warn('[Ribera] Supabase no respondió; usando contenido local.', err.message || err);
      return normalizeContent(DEFAULT_CONTENT);
    }
  }

  function setMeta(name, value, attrName='name'){
    if(!value) return;
    let el = document.head.querySelector(`meta[${attrName}="${name}"]`);
    if(!el){ el=document.createElement('meta'); el.setAttribute(attrName,name); document.head.appendChild(el); }
    el.setAttribute('content', value);
  }
  function applySEO(c){
    const seo=c.seo||{}, s=c.site||{};
    document.title = seo.title || document.title;
    setMeta('description', seo.description || s.heroDescription);
    setMeta('keywords', seo.keywords || '');
    setMeta('og:title', seo.title || document.title, 'property');
    setMeta('og:description', seo.description || s.heroDescription, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:image', seo.image || 'logo-ribera.png', 'property');
    setMeta('twitter:card','summary_large_image');
  }
  function applySiteText(c){
    const s = c.site || {};
    const q = sel=>document.querySelector(sel);
    if(q('.hero-eyebrow')) q('.hero-eyebrow').textContent = s.heroEyebrow;
    if(q('.hero-title')) q('.hero-title').innerHTML = `${esc(s.heroTitleLine1)}<br><span class="acc">${esc(s.heroTitleAccent)}</span><br>${esc(s.heroTitleLine3)}`;
    if(q('.hero-slogan')) q('.hero-slogan').textContent = s.heroSlogan;
    if(q('.hero-desc')) q('.hero-desc').textContent = s.heroDescription;
    if(q('.port-hero-sub')) q('.port-hero-sub').textContent = s.portfolioIntro;
    const about = q('.about-text');
    if(about && Array.isArray(s.aboutParagraphs)) about.innerHTML = s.aboutParagraphs.filter(Boolean).map(p=>`<p>${esc(p).replace(/\b(imagen|identidad|verdadero|se encuentran)\b/gi,'<strong>$1</strong>')}</p>`).join('');
    const manifest = q('.manifesto-quote');
    if(manifest && s.manifestoQuote){
      const text = esc(s.manifestoQuote);
      manifest.innerHTML = text.replace(/ruido\.?/i,'<em>ruido.</em><br>').replace(/señal\.?/i,'señal.');
    }
    if(q('.manifesto-attr')) q('.manifesto-attr').textContent = s.manifestoAttr || '— La Ribera Audiovisual · Buenos Aires';
  }
  function applyContact(c){
    const s = c.site || {};
    const ig = s.instagramUrl || 'https://www.instagram.com/laribera.audiovisual/';
    const wa = String(s.whatsappWa || '5491132265225').replace(/\D/g,'');
    const waText = encodeURIComponent(s.whatsappText || 'Hola La Ribera Audiovisual, me interesa hablar sobre un proyecto');
    const email = s.email || 'hola@laribera.audiovisual.com';
    document.querySelectorAll('a[href*="instagram.com"]').forEach(a=>{ a.href=ig; a.rel='noopener noreferrer'; a.addEventListener('click',()=>trackEvent('instagram_click',{href:ig}),{once:false}); });
    document.querySelectorAll('a[href*="wa.me"]').forEach(a=>{ a.href=`https://wa.me/${wa}${a.classList.contains('wa-float') ? '?text='+waText : ''}`; a.rel='noopener noreferrer'; a.addEventListener('click',()=>trackEvent('whatsapp_click',{source:a.className||'link'}),{once:false}); });
    document.querySelectorAll('.contact-detail-value').forEach(el=>{
      const t=el.textContent || '';
      if(t.includes('@')) el.textContent = email;
      if(t.includes('11') || t.includes('3226') || t.includes('0000')) el.textContent = s.whatsappDisplay || '+54 9 11 3226-5225';
    });
    document.querySelectorAll('.contact-social-btn').forEach(a=>{
      if(a.href.includes('instagram.com')){
        const svg = a.querySelector('svg')?.outerHTML || '';
        a.innerHTML = svg + ' @laribera.audiovisual';
      }
    });
  }

  function iconSvg(key){
    const stroke='#D00000';
    const map={
      play:`<circle cx="20" cy="20" r="16" stroke="${stroke}" stroke-width="1.5" fill="none"/><polygon points="16,13 28,20 16,27" fill="${stroke}"/>`,
      video:`<rect x="3" y="10" width="24" height="20" rx="1.5" stroke="${stroke}" stroke-width="1.5" fill="none"/><path d="M27 16 L37 12 L37 28 L27 24 Z" stroke="${stroke}" stroke-width="1.5" fill="none"/>`,
      film:`<rect x="4" y="8" width="32" height="24" rx="1" stroke="${stroke}" stroke-width="1.5" fill="none"/><line x1="14" y1="8" x2="14" y2="32" stroke="${stroke}" stroke-width="1.5"/><circle cx="9" cy="20" r="2.5" fill="${stroke}"/>`,
      grid:`<rect x="6" y="6" width="12" height="12" stroke="${stroke}" stroke-width="1.5" fill="none"/><rect x="22" y="6" width="12" height="12" stroke="${stroke}" stroke-width="1.5" fill="none"/><rect x="6" y="22" width="12" height="12" stroke="${stroke}" stroke-width="1.5" fill="none"/><rect x="22" y="22" width="12" height="12" stroke="${stroke}" stroke-width="1.5" fill="none"/>`,
      person:`<circle cx="20" cy="14" r="7" stroke="${stroke}" stroke-width="1.5" fill="none"/><path d="M6 36 C6 28 34 28 34 36" stroke="${stroke}" stroke-width="1.5" fill="none"/>`,
      camera:`<rect x="6" y="12" width="28" height="20" rx="2" stroke="${stroke}" stroke-width="1.5" fill="none"/><circle cx="20" cy="22" r="6" stroke="${stroke}" stroke-width="1.5" fill="none"/><path d="M14 12l2-5h8l2 5" stroke="${stroke}" stroke-width="1.5" fill="none"/>`
    };
    return `<svg viewBox="0 0 40 40" fill="none">${map[key] || map.play}</svg>`;
  }
  function renderServices(c){
    const grid=document.querySelector('.services-grid'); if(!grid) return;
    const services=visibleServices(c);
    if(!services.length) return;
    grid.innerHTML=services.map((s,i)=>{
      const num=String(i+1).padStart(2,'0');
      const media=mediaMarkup({type:s.type||'image',url:s.mediaUrl||s.url,title:s.title,alt:s.alt||s.title},{opacity:'.72',autoplay:true});
      return `<div class="service-card reveal visible rd${(i%4)+1}">
        <div class="service-visual" data-num="${num}">${media}</div>
        <div class="service-index">${num}</div>
        <div class="service-content">
          ${s.tag?`<div class="service-tag">${esc(s.tag)}</div>`:''}
          <div class="service-icon">${iconSvg(s.icon)}</div>
          <div class="service-title">${esc(s.title||'SERVICIO')}</div>
          <div class="service-desc">${esc(s.description||'')}</div>
        </div>
      </div>`;
    }).join('');
  }
  function renderWorkflow(c){
    const section=document.getElementById('proceso'); if(!section) return;
    const w=Object.assign(defaultWorkflow(), c.workflow || {});
    const label=section.querySelector('.section-label'); if(label) label.textContent=w.sectionLabel || 'Cómo trabajamos';
    const title=section.querySelector('.workflow-head h2'); if(title) title.innerHTML=br(w.title || 'DE LA IDEA\nA LA PIEZA FINAL');
    const lead=section.querySelector('.workflow-head p'); if(lead) lead.textContent=w.lead || '';
    const grid=section.querySelector('.workflow-grid'); if(!grid) return;
    const steps=arr(w.steps).filter(Boolean);
    if(!steps.length) return;
    grid.innerHTML=steps.map((st,i)=>`<div class="workflow-step reveal visible rd${(i%4)+1}"><div class="workflow-num">${String(i+1).padStart(2,'0')}</div><div class="workflow-title">${esc(st.title||'PASO')}</div><div class="workflow-desc">${esc(st.description||'')}</div></div>`).join('');
  }
  function br(v){ return esc(v||'').split(/\n|<br\s*\/?\s*>/i).join('<br>'); }
  function renderPhotography(c){
    const section=document.getElementById('fotografia'); if(!section) return;
    const p=c.photography || {};
    const title=section.querySelector('.fotografia-intro-text h2'); if(title) title.innerHTML=br(p.sectionTitle || 'LA IMAGEN\nQUIETA');
    const intro=section.querySelector('.fotografia-intro-text');
    if(intro){
      intro.querySelectorAll('p').forEach(x=>x.remove());
      arr(p.paragraphs).filter(Boolean).forEach((txt,i)=>{ const par=document.createElement('p'); par.textContent=txt; if(i>0) par.style.marginTop='.75rem'; intro.appendChild(par); });
    }
    const quote=section.querySelector('.fotografia-intro-quote blockquote');
    if(quote && p.quote){
      const lines=esc(p.quote).split(/\n/); const last=lines.pop() || ''; quote.innerHTML = lines.join('<br>') + (lines.length?'<br>':'') + last.replace(/(NO PUEDEN\.?|NO PUEDEN)$/i,'<em style="color:var(--accent)">$1</em>');
    }
    const cite=section.querySelector('.fotografia-intro-quote cite'); if(cite) cite.textContent=p.cite || '— La Ribera Audiovisual';
    const grid=section.querySelector('.foto-grid'); if(!grid) return;
    const cards=arr(p.cards).filter(x=>x && x.visible!==false);
    if(!cards.length) return;
    grid.innerHTML=cards.map((card,i)=>{
      const media=mediaMarkup({type:card.type||'image',url:card.mediaUrl||card.url,title:card.title,alt:card.alt||card.title},{opacity:'.86',autoplay:true});
      return `<div class="foto-card reveal visible rd${(i%4)+1}">
        <div class="foto-card-visual"><div class="foto-card-visual-bg">${media}</div>${media?'':`<div class="foto-placeholder-icon"><svg viewBox="0 0 64 64" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="16" width="48" height="36" rx="2" stroke-width="1.2"/><circle cx="32" cy="34" r="10" stroke-width="1.2"/><circle cx="32" cy="34" r="4" stroke-width="1.2"/></svg></div>`}</div>
        <div class="foto-card-info"><div class="foto-card-label">${esc(card.label||('Especialidad '+String(i+1).padStart(2,'0')))}</div><div class="foto-card-title">${esc(card.title||'FOTOGRAFÍA')}</div><div class="foto-card-desc">${esc(card.description||'')}</div><div class="foto-card-items">${arr(card.tags).map(t=>`<span class="foto-item-tag">${esc(t)}</span>`).join('')}</div></div>
      </div>`;
    }).join('');
  }
  function firstMedia(w){ const media=arr(w.media).filter(m=>m&&m.url); if(media.length) return media[0]; if(w.mediaUrl) return {type:w.type||'image', url:w.mediaUrl, title:w.title, alt:w.alt||w.title}; return null; }
  function embedUrl(url,type){
    const u=String(url||'');
    if(type==='youtube' || /youtu\.be|youtube\.com/.test(u)){
      let id='';
      try{ const parsed=new URL(u); id=parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1) : (parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop()); }catch(e){}
      return id ? `https://www.youtube.com/embed/${id}` : u;
    }
    if(type==='vimeo' || /vimeo\.com/.test(u)){
      const id=(u.match(/vimeo\.com\/(?:video\/)?(\d+)/)||[])[1]; return id ? `https://player.vimeo.com/video/${id}` : u;
    }
    return u;
  }
  function isExternalVideo(m){ const t=(m&&m.type)||''; return ['youtube','vimeo','embed'].includes(t); }
  function mediaMarkup(media, opts={}){
    const m = media && (media.url || media.mediaUrl) ? media : (media ? firstMedia(media) : null);
    if(!m || !(m.url||m.mediaUrl)) return '';
    const url = m.url || m.mediaUrl;
    const type = m.type || 'image';
    const opacity = opts.opacity || '.82';
    const eager = opts.eager ? 'eager' : 'lazy';
    const alt = attr(m.alt || m.title || 'La Ribera Audiovisual');
    if(type === 'video') return `<video src="${attr(url)}" ${opts.autoplay?'autoplay ':''}muted loop playsinline preload="metadata" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${opacity};"></video>`;
    if(isExternalVideo(m)) return `<div class="external-video-thumb" style="position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(145deg,#171717,#080808);opacity:${opacity};"><span>VIDEO</span></div>`;
    return `<img src="${attr(url)}" alt="${alt}" loading="${eager}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${opacity};"/>`;
  }
  function renderHero(c){
    const wrap = document.getElementById('hero-carousel'); if(!wrap) return;
    const slides = arr(c.heroCarousel).filter(s=>s && (s.mediaUrl || s.url || s.title));
    if(!slides.length) return;
    wrap.innerHTML = `<div class="hero-carousel">${slides.map((s,i)=>`
      <div class="hero-slide ${i===0?'active':''}">
        <div class="hero-slide-bg">${mediaMarkup({type:s.type||'image',url:s.mediaUrl||s.url,title:s.title,alt:s.alt},{opacity:'.62',eager:i===0,autoplay:true}) || `<span class="slide-ph">${esc((s.title||('FOTO '+String(i+1).padStart(2,'0'))).toUpperCase())}<br>${esc(s.subtitle||'Cargá esta imagen desde el editor')}</span>`}</div>
      </div>`).join('')}</div>
      <div class="carousel-counter"><span id="current-slide">01</span> / <span id="total-slides">${String(slides.length).padStart(2,'0')}</span></div>
      <div class="carousel-indicators" id="indicators"></div>`;
    startCarousel();
  }
  function homeWorks(c){ const works=publishedWorks(c); const featured=works.filter(w=>w.featured); return (featured.length?featured:works).slice(0,5); }
  function renderHomePortfolio(c){
    const grid=document.querySelector('#portfolio .portfolio-grid'); if(!grid) return;
    const works=homeWorks(c);
    grid.innerHTML = works.map((w,i)=>`
      <div class="portfolio-item" data-work-id="${attr(w.id)}">
        <div class="portfolio-item-bg" data-num="${String(i+1).padStart(2,'0')}" style="background:#1a1a1a">${mediaMarkup(firstMedia(w),{opacity:'.78'})}</div>
        <div class="portfolio-index">${String(i+1).padStart(2,'0')}</div>
        <div class="portfolio-overlay"><div><div class="portfolio-cat">${esc(w.categoryLabel||w.category||'Portfolio')}</div><div class="portfolio-title">${esc(w.title||'Proyecto')}</div></div></div>
      </div>`).join('') + `<div class="portfolio-more" data-go-portfolio="true"><div class="portfolio-more-inner"><span>VER TODO</span><span class="portfolio-arrow">→</span></div></div>`;
    grid.querySelectorAll('[data-work-id]').forEach(card=>card.addEventListener('click',()=>openWork(card.dataset.workId)));
    grid.querySelector('[data-go-portfolio]')?.addEventListener('click',()=>{ trackEvent('portfolio_all_click',{}); window.location.href='portfolio.html'; });
  }
  function renderPortfolioPage(c){
    const grid=document.getElementById('port-grid'); if(!grid) return;
    const works=publishedWorks(c);
    grid.innerHTML = works.map((w,i)=>`
      <article class="port-work reveal visible" data-cat="${attr(w.category||'digital')}" data-work-id="${attr(w.id)}">
        <div class="port-work-visual">
          <div class="port-work-visual-bg">${mediaMarkup(firstMedia(w),{opacity:'.86'})}</div>
          <div class="port-work-index">${String(i+1).padStart(2,'0')}</div>
          ${(((firstMedia(w)||{}).type||w.type)==='video'||isExternalVideo(firstMedia(w)||w))?'<div class="port-play"></div>':''}
        </div>
        <div class="port-work-info">
          <div class="port-work-meta"><span class="port-work-cat">${esc(w.categoryLabel||w.category||'Trabajo')}</span><span class="port-work-year">${esc(w.year||'')}</span></div>
          <div class="port-work-title">${esc(w.title||'PROYECTO')}</div>
          <div class="port-work-client">Cliente: ${esc(w.client||'Confidencial')}</div>
          <div class="port-work-desc">${esc(w.description||'')}</div>
          <div class="port-work-tags">${arr(w.tags).map(t=>`<span class="port-work-tag">${esc(t)}</span>`).join('')}</div>
        </div>
      </article>`).join('') + `<div class="port-empty" id="port-empty"><p>NO HAY TRABAJOS EN ESTA CATEGORÍA AÚN.</p></div>`;
    grid.querySelectorAll('[data-work-id]').forEach(card=>card.addEventListener('click',()=>openWork(card.dataset.workId)));
    grid.querySelectorAll('video').forEach(v=>{ const card=v.closest('.port-work'); card?.addEventListener('mouseenter',()=>v.play().catch(()=>{})); card?.addEventListener('mouseleave',()=>{v.pause();v.currentTime=0;}); });
    bindFilters();
    const params=new URLSearchParams(location.search); if(params.get('work')) setTimeout(()=>openWork(params.get('work')),350);
  }
  function bindFilters(){
    const btns=document.querySelectorAll('.filter-btn'); const countEl=document.getElementById('visible-count'); const emptyEl=document.getElementById('port-empty');
    function apply(filter){ const works=document.querySelectorAll('.port-work'); let visible=0; works.forEach(w=>{ const match=filter==='all'||w.dataset.cat===filter; w.classList.toggle('hidden',!match); if(match) visible++; }); if(countEl) countEl.textContent=visible; if(emptyEl) emptyEl.classList.toggle('show', visible===0); }
    btns.forEach(btn=>{ btn.onclick=()=>{ btns.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); apply(btn.dataset.filter || 'all'); trackEvent('portfolio_filter',{filter:btn.dataset.filter || 'all'}); }; });
    apply(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
  }

  function ensurePublicStyles(){
    if(document.getElementById('ribera-v2-styles')) return;
    const css=`
      .cursor{z-index:2147483647!important}
      .work-modal,.work-modal *{cursor:none}
      .external-video-thumb span{font-family:var(--font-mono,var(--fm));font-size:11px;letter-spacing:.18em;color:var(--accent);border:1px solid var(--accent);border-radius:50%;width:74px;height:74px;display:grid;place-items:center;background:rgba(0,0,0,.25)}
      .work-modal{position:fixed;inset:0;z-index:10000;display:none;color:var(--white)}.work-modal.open{display:block}.work-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.84);backdrop-filter:blur(10px)}
      .work-modal-panel{position:absolute;inset:4vh 4vw;background:var(--black);border:1px solid var(--gray-800,var(--g800));display:grid;grid-template-columns:minmax(0,1.55fr) minmax(290px,.8fr);box-shadow:0 20px 80px rgba(0,0,0,.6);overflow:hidden}.work-modal-close{position:absolute;right:14px;top:10px;z-index:3;background:transparent;border:0;color:var(--white);font-size:34px;line-height:1;cursor:none}.work-modal-media{background:#050505;min-height:0;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}.work-modal-media img,.work-modal-media video,.work-modal-media iframe{width:100%;height:100%;object-fit:contain;display:block;background:#050505;border:0}.work-modal-side{padding:2rem;overflow:auto;border-left:1px solid var(--gray-800,var(--g800))}.work-modal-kicker{font-family:var(--font-mono,var(--fm));font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:.5rem}.work-modal-side h2{font-family:var(--font-display,var(--fd));font-size:clamp(32px,4vw,56px);line-height:.95;letter-spacing:.04em;margin-bottom:1rem;color:var(--white)}.work-modal-client{font-family:var(--font-mono,var(--fm));font-size:11px;color:var(--gray-600,var(--g600));letter-spacing:.06em;margin-bottom:1rem}.work-modal-desc,.work-modal-case{font-size:14px;color:var(--gray-400,var(--g400));line-height:1.75;margin-bottom:1rem}.work-modal-case{border-left:2px solid var(--accent);padding-left:1rem;color:var(--gray-200,var(--g200))}.work-modal-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:1.25rem}.work-modal-tags span{font-family:var(--font-mono,var(--fm));font-size:10px;letter-spacing:.08em;padding:4px 8px;background:var(--gray-800,var(--g800));color:var(--gray-400,var(--g400))}.work-modal-controls{display:flex;align-items:center;gap:12px;margin:1.25rem 0;font-family:var(--font-mono,var(--fm));font-size:11px;color:var(--gray-400,var(--g400))}.work-modal-controls button{border:1px solid var(--gray-700,var(--g700));background:transparent;color:var(--white);width:34px;height:34px;cursor:none}.work-modal-thumbs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.work-modal-thumbs button{aspect-ratio:1;background:var(--gray-900,var(--g900));border:1px solid var(--gray-800,var(--g800));padding:0;overflow:hidden;cursor:none;color:var(--gray-400,var(--g400));font-family:var(--font-mono,var(--fm));font-size:9px;letter-spacing:.08em}.work-modal-thumbs button.active{border-color:var(--accent)}.work-modal-thumbs img{width:100%;height:100%;object-fit:cover;display:block}.work-modal-placeholder{font-family:var(--font-display,var(--fd));font-size:22px;letter-spacing:.12em;color:var(--gray-700,var(--g700));text-align:center}.work-modal-cta{display:inline-flex;margin-top:1.2rem;background:var(--accent);color:#fff;padding:12px 18px;font-family:var(--font-mono,var(--fm));font-size:11px;letter-spacing:.1em;text-transform:uppercase}.work-modal-cta:hover{background:var(--accent-dim)}
      @media(max-width:800px){.work-modal-panel{inset:2vh 2vw;grid-template-columns:1fr;grid-template-rows:52vh auto}.work-modal-side{border-left:0;border-top:1px solid var(--gray-800,var(--g800));padding:1.25rem}.work-modal-thumbs{grid-template-columns:repeat(5,1fr)}}`;
    const st=document.createElement('style'); st.id='ribera-v2-styles'; st.textContent=css; document.head.appendChild(st);
  }
  function ensureModal(){
    if(document.getElementById('work-modal')) return;
    document.body.insertAdjacentHTML('beforeend', `<div id="work-modal" class="work-modal" aria-hidden="true">
      <div class="work-modal-backdrop" data-close-modal></div><div class="work-modal-panel" role="dialog" aria-modal="true"><button class="work-modal-close" data-close-modal>×</button><div class="work-modal-media" id="modal-media"></div><div class="work-modal-side"><div class="work-modal-kicker" id="modal-kicker"></div><h2 id="modal-title"></h2><p class="work-modal-client" id="modal-client"></p><p class="work-modal-desc" id="modal-desc"></p><p class="work-modal-case" id="modal-case"></p><div class="work-modal-tags" id="modal-tags"></div><div class="work-modal-controls"><button id="modal-prev">←</button><span id="modal-count"></span><button id="modal-next">→</button></div><div class="work-modal-thumbs" id="modal-thumbs"></div><a class="work-modal-cta" id="modal-cta" target="_blank" rel="noopener noreferrer">Quiero algo parecido</a></div></div></div>`);
    document.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
    document.getElementById('modal-prev')?.addEventListener('click',()=>shiftModal(-1));
    document.getElementById('modal-next')?.addEventListener('click',()=>shiftModal(1));
    document.addEventListener('keydown',e=>{ if(document.getElementById('work-modal')?.classList.contains('open')){ if(e.key==='Escape') closeModal(); if(e.key==='ArrowLeft') shiftModal(-1); if(e.key==='ArrowRight') shiftModal(1); } });
  }
  function galleryFor(w){ const media=arr(w.media).filter(m=>m&&m.url); if(media.length) return media; const cover=firstMedia(w); return cover ? [cover] : []; }
  function openWork(id){
    const w=publishedWorks().find(x=>String(x.id)===String(id)); if(!w) return;
    ensureModal(); state.modalWork=w; state.modalIndex=0;
    document.getElementById('modal-kicker').textContent = `${w.categoryLabel||w.category||'Trabajo'} ${w.year?'· '+w.year:''}`;
    document.getElementById('modal-title').textContent = w.title || 'PROYECTO';
    document.getElementById('modal-client').textContent = w.client ? 'Cliente: '+w.client : '';
    document.getElementById('modal-desc').textContent = w.description || '';
    const caseEl=document.getElementById('modal-case'); caseEl.textContent = w.caseIntro || ''; caseEl.style.display = w.caseIntro ? 'block' : 'none';
    const tags=[...arr(w.tags), ...arr(w.services)].filter(Boolean);
    document.getElementById('modal-tags').innerHTML = tags.map(t=>`<span>${esc(t)}</span>`).join('');
    const s=state.content.site||{}; const wa=String(s.whatsappWa||'5491132265225').replace(/\D/g,''); const text=encodeURIComponent(`Hola La Ribera, vi el proyecto ${w.title||''} y me interesa hacer algo parecido.`); const cta=document.getElementById('modal-cta'); cta.href=`https://wa.me/${wa}?text=${text}`; cta.onclick=()=>trackEvent('whatsapp_click',{source:'portfolio_modal',work_id:w.id,title:w.title});
    renderModalMedia(); document.getElementById('work-modal').classList.add('open'); document.body.style.overflow='hidden'; const cur=document.querySelector('.cursor'); if(cur) document.body.appendChild(cur); trackEvent('portfolio_open',{work_id:w.id,title:w.title,category:w.category});
  }
  function renderModalMedia(){
    const w=state.modalWork; if(!w) return; const gallery=galleryFor(w); const media=gallery[state.modalIndex] || null; const mediaEl=document.getElementById('modal-media');
    if(!media){ mediaEl.innerHTML='<div class="work-modal-placeholder">SIN MEDIA CARGADA</div>'; return; }
    const type=media.type||'image'; const url=media.url;
    if(type==='video') mediaEl.innerHTML=`<video src="${attr(url)}" controls playsinline autoplay></video>`;
    else if(isExternalVideo(media)) mediaEl.innerHTML=`<iframe src="${attr(embedUrl(url,type))}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    else mediaEl.innerHTML=`<img src="${attr(url)}" alt="${attr(media.alt||media.title||w.title||'Trabajo')}"/>`;
    document.getElementById('modal-count').textContent=`${state.modalIndex+1} / ${gallery.length}`;
    document.getElementById('modal-thumbs').innerHTML=gallery.map((m,i)=>`<button class="${i===state.modalIndex?'active':''}" data-i="${i}">${(m.type||'image')==='image'?`<img src="${attr(m.url)}" alt="">`:'<span>VIDEO</span>'}</button>`).join('');
    document.querySelectorAll('#modal-thumbs button').forEach(b=>b.addEventListener('click',()=>{state.modalIndex=Number(b.dataset.i)||0;renderModalMedia();}));
  }
  function shiftModal(dir){ const g=galleryFor(state.modalWork||{}); if(!g.length) return; state.modalIndex=(state.modalIndex+dir+g.length)%g.length; renderModalMedia(); }
  function closeModal(){ const m=document.getElementById('work-modal'); if(!m) return; m.classList.remove('open'); document.body.style.overflow=''; document.getElementById('modal-media').innerHTML=''; }

  function startCarousel(){
    const wrap=document.getElementById('hero-carousel'); if(!wrap || wrap.style.display==='none') return;
    const slides=wrap.querySelectorAll('.hero-slide'); const indEl=document.getElementById('indicators'); const curEl=document.getElementById('current-slide');
    if(!slides.length || !indEl) return;
    clearInterval(state.carouselTimer); indEl.innerHTML=''; let cur=0;
    slides.forEach((_,i)=>{ const d=document.createElement('div'); d.className='carousel-dot'+(i===0?' active':''); d.addEventListener('click',()=>go(i)); indEl.appendChild(d); });
    function go(n){ slides[cur]?.classList.remove('active'); indEl.querySelectorAll('.carousel-dot')[cur]?.classList.remove('active'); cur=n; slides[cur]?.classList.add('active'); indEl.querySelectorAll('.carousel-dot')[cur]?.classList.add('active'); if(curEl) curEl.textContent=String(cur+1).padStart(2,'0'); clearInterval(state.carouselTimer); state.carouselTimer=setInterval(()=>go((cur+1)%slides.length),5000); }
    state.carouselTimer=setInterval(()=>go((cur+1)%slides.length),5000);
  }

  function trackEvent(event_type,payload={}){
    const sb=client();
    try{
      const key='ribera_analytics_local'; const list=JSON.parse(localStorage.getItem(key)||'[]'); list.push({event_type,payload,page:location.pathname,created_at:new Date().toISOString()}); localStorage.setItem(key,JSON.stringify(list.slice(-250)));
    }catch(e){}
    if(!sb) return;
    sb.from('site_events').insert({ event_type, payload, page:location.pathname }).then(()=>{},()=>{});
  }

  function installBasics(){
    const dot=document.getElementById('cursor-dot'), ring=document.getElementById('cursor-ring');
    if(dot&&ring){ let mx=0,my=0,rx=0,ry=0; document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px';}); (function ac(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(ac);})(); }
    const navbar=document.getElementById('navbar'), prog=document.getElementById('progress');
    if(navbar||prog) window.addEventListener('scroll',()=>{ if(navbar) navbar.classList.toggle('scrolled',window.scrollY>60); if(prog){ const h=document.documentElement.scrollHeight-window.innerHeight; prog.style.width=(h>0?window.scrollY/h*100:0)+'%'; } },{passive:true});
    const ham=document.getElementById('hamburger'), mob=document.getElementById('mobile-menu');
    if(ham&&mob){ ham.addEventListener('click',()=>{ham.classList.toggle('open');mob.classList.toggle('open');}); document.querySelectorAll('.mobile-link').forEach(a=>a.addEventListener('click',()=>{ham.classList.remove('open');mob.classList.remove('open');})); }
    const obs = 'IntersectionObserver' in window ? new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:.1}) : null;
    document.querySelectorAll('.reveal').forEach(r=>obs ? obs.observe(r) : r.classList.add('visible'));
    document.querySelectorAll('a[href^="#"]').forEach(a=>{ a.addEventListener('click',e=>{ const t=document.querySelector(a.getAttribute('href')); if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});} }); });
    const form=document.getElementById('contact-form');
    if(form){ form.addEventListener('submit',function(e){ e.preventDefault(); const n=document.getElementById('nombre').value.trim(); const em=document.getElementById('email').value.trim(); const s=document.getElementById('servicio').value; const m=document.getElementById('mensaje').value.trim(); const tel=document.getElementById('telefono').value.trim(); if(!n||!em||!s||!m){alert('Por favor completá los campos obligatorios (*).');return;} const sub=encodeURIComponent('Consulta La Ribera Audiovisual — '+s); const body=encodeURIComponent('Nombre: '+n+'\nEmail: '+em+'\nWhatsApp: '+tel+'\nServicio: '+s+'\n\nMensaje:\n'+m); const email=(state.content.site||{}).email || 'hola@laribera.audiovisual.com'; trackEvent('contact_form_submit',{service:s}); window.location.href='mailto:'+email+'?subject='+sub+'&body='+body; this.style.display='none'; document.getElementById('form-success')?.classList.add('show'); }); }
  }
  function installAdminTrigger(){ let clicks=0, timer=null; const triggers=[...document.querySelectorAll('.nav-logo,.footer-logo,.port-logo,.port-footer-logo')]; triggers.forEach(el=>{ el.classList.add('admin-trigger-logo'); el.addEventListener('click',e=>{ e.preventDefault(); clicks++; clearTimeout(timer); timer=setTimeout(()=>{clicks=0},2200); if(clicks>=5){ window.location.href='admin.html'; } }); }); }
  async function init(){
    ensurePublicStyles(); installBasics(); installAdminTrigger();
    state.content = await loadContent();
    applySEO(state.content); applySiteText(state.content); applyContact(state.content); renderServices(state.content); renderWorkflow(state.content); renderPhotography(state.content); renderHero(state.content); renderHomePortfolio(state.content); renderPortfolioPage(state.content); startCarousel();
    if(!state.trackedPageView){ state.trackedPageView=true; trackEvent('page_view',{title:document.title}); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
