/* Ribera Audiovisual — motor público + Supabase */
(function(){
  const CONTENT_ROW_ID = 'main';
  const DEFAULT_CONTENT = window.RIBERA_CONTENT || { site:{}, heroCarousel:[], portfolioWorks:[] };
  const state = { content: DEFAULT_CONTENT, modalIndex: 0, modalWork: null, carouselTimer: null };

  function cfg(){ return window.RIBERA_SUPABASE || {}; }
  function configured(){ const c=cfg(); return !!(c.url && c.anonKey && !String(c.url).includes('TU-PROYECTO') && !String(c.anonKey).includes('TU_ANON')); }
  function client(){ if(!configured() || !window.supabase) return null; if(!window.__RIBERA_SB) window.__RIBERA_SB=window.supabase.createClient(cfg().url,cfg().anonKey); return window.__RIBERA_SB; }
  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function attr(v){ return esc(v).replace(/`/g,'&#96;'); }
  function firstMedia(w){ const arr=Array.isArray(w.media)?w.media.filter(m=>m&&m.url):[]; if(arr.length) return arr[0]; if(w.mediaUrl) return {type:w.type||'image', url:w.mediaUrl, title:w.title, alt:w.alt||w.title}; return null; }
  function mediaMarkup(media, opts={}){
    const m = media && (media.url || media.mediaUrl) ? media : (media ? firstMedia(media) : null);
    if(!m || !(m.url||m.mediaUrl)) return '';
    const url = m.url || m.mediaUrl;
    const type = m.type || 'image';
    const opacity = opts.opacity || '.82';
    const eager = opts.eager ? 'eager' : 'lazy';
    const alt = attr(m.alt || m.title || 'Ribera Audiovisual');
    if(type === 'video'){
      return `<video src="${attr(url)}" ${opts.autoplay?'autoplay ':''}muted loop playsinline preload="metadata" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${opacity};"></video>`;
    }
    return `<img src="${attr(url)}" alt="${alt}" loading="${eager}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${opacity};"/>`;
  }
  function mergeContent(remote){
    if(!remote || typeof remote !== 'object') return DEFAULT_CONTENT;
    const merged = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
    merged.site = Object.assign({}, merged.site||{}, remote.site||{});
    merged.heroCarousel = Array.isArray(remote.heroCarousel) ? remote.heroCarousel : (merged.heroCarousel||[]);
    merged.portfolioWorks = Array.isArray(remote.portfolioWorks) ? remote.portfolioWorks : (merged.portfolioWorks||[]);
    merged.homePortfolio = Array.isArray(remote.homePortfolio) ? remote.homePortfolio : (merged.homePortfolio||[]);
    return merged;
  }
  async function loadContent(){
    const sb = client();
    if(!sb) return DEFAULT_CONTENT;
    try{
      const { data, error } = await sb.from('site_content').select('content').eq('id', CONTENT_ROW_ID).maybeSingle();
      if(error) throw error;
      return mergeContent(data && data.content ? data.content : DEFAULT_CONTENT);
    }catch(err){
      console.warn('[Ribera] Supabase no respondió; usando contenido local.', err.message || err);
      return DEFAULT_CONTENT;
    }
  }
  function applySiteText(c){
    const s = c.site || {};
    const q = (sel)=>document.querySelector(sel);
    if(q('.hero-eyebrow')) q('.hero-eyebrow').textContent = s.heroEyebrow || 'Buenos Aires · Producción Audiovisual · Est. 2022';
    if(q('.hero-title')) q('.hero-title').innerHTML = `${esc(s.heroTitleLine1||'RIBERA')}<br><span class="acc">${esc(s.heroTitleAccent||'AUDIO')}</span><br>${esc(s.heroTitleLine3||'VISUAL')}`;
    if(q('.hero-slogan')) q('.hero-slogan').textContent = s.heroSlogan || 'Pone el ojo.';
    if(q('.hero-desc')) q('.hero-desc').textContent = s.heroDescription || 'Resolución creativa de tu identidad. Concepto, producción y entrega con propósito.';
    if(q('.port-hero-sub')) q('.port-hero-sub').textContent = s.portfolioIntro || 'Video, fotografía, retratos y contenido de producto. Cada proyecto con su historia.';
  }
  function applyContact(c){
    const s = c.site || {};
    const ig = s.instagramUrl || 'https://www.instagram.com/laribera.audiovisual/';
    const wa = String(s.whatsappWa || '5491132265225').replace(/\D/g,'');
    const waText = encodeURIComponent(s.whatsappText || 'Hola Ribera Audiovisual, me interesa hablar sobre un proyecto');
    const email = s.email || 'hola@riberaudiovisual.com';
    document.querySelectorAll('a[href*="instagram.com"]').forEach(a=>{ a.href=ig; a.rel='noopener noreferrer'; });
    document.querySelectorAll('a[href*="wa.me"]').forEach(a=>{ a.href=`https://wa.me/${wa}${a.classList.contains('wa-float') ? '?text='+waText : ''}`; a.rel='noopener noreferrer'; });
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
  function renderHero(c){
    const wrap = document.getElementById('hero-carousel');
    if(!wrap) return;
    const slides = (c.heroCarousel || []).filter(Boolean);
    if(!slides.length) return;
    wrap.innerHTML = `<div class="hero-carousel">${slides.map((s,i)=>`
      <div class="hero-slide ${i===0?'active':''}">
        <div class="hero-slide-bg">${mediaMarkup({type:s.type||'image',url:s.mediaUrl,title:s.title,alt:s.alt},{opacity:'.62',eager:i===0,autoplay:true}) || `<span class="slide-ph">${esc((s.title||('FOTO '+String(i+1).padStart(2,'0'))).toUpperCase())}<br>${esc(s.subtitle||'Cargá esta imagen desde el editor')}</span>`}</div>
      </div>`).join('')}</div>
      <div class="carousel-counter"><span id="current-slide">01</span> / <span id="total-slides">${String(slides.length).padStart(2,'0')}</span></div>
      <div class="carousel-indicators" id="indicators"></div>`;
    startCarousel();
  }
  function homeWorks(c){
    const works = c.portfolioWorks || [];
    const featured = works.filter(w=>w.featured);
    return (featured.length?featured:works).slice(0,5);
  }
  function renderHomePortfolio(c){
    const grid=document.querySelector('#portfolio .portfolio-grid');
    if(!grid) return;
    const works=homeWorks(c);
    grid.innerHTML = works.map((w,i)=>`
      <div class="portfolio-item" data-work-id="${attr(w.id)}">
        <div class="portfolio-item-bg" data-num="${String(i+1).padStart(2,'0')}" style="background:#1a1a1a">${mediaMarkup(firstMedia(w),{opacity:'.78'})}</div>
        <div class="portfolio-index">${String(i+1).padStart(2,'0')}</div>
        <div class="portfolio-overlay"><div><div class="portfolio-cat">${esc(w.categoryLabel||w.category||'Portfolio')}</div><div class="portfolio-title">${esc(w.title||'Proyecto')}</div></div></div>
      </div>`).join('') + `<div class="portfolio-more" data-go-portfolio="true"><div class="portfolio-more-inner"><span>VER TODO</span><span class="portfolio-arrow">→</span></div></div>`;
    grid.querySelectorAll('[data-work-id]').forEach(card=>card.addEventListener('click',()=>openWork(card.dataset.workId)));
    grid.querySelector('[data-go-portfolio]')?.addEventListener('click',()=>{ window.location.href='portfolio.html'; });
  }
  function renderPortfolioPage(c){
    const grid=document.getElementById('port-grid');
    if(!grid) return;
    const works=(c.portfolioWorks||[]).filter(Boolean);
    grid.innerHTML = works.map((w,i)=>`
      <article class="port-work reveal visible" data-cat="${attr(w.category||'digital')}" data-work-id="${attr(w.id)}">
        <div class="port-work-visual">
          <div class="port-work-visual-bg">${mediaMarkup(firstMedia(w),{opacity:'.86'})}</div>
          <div class="port-work-index">${String(i+1).padStart(2,'0')}</div>
          ${((firstMedia(w)||{}).type||w.type)==='video'?'<div class="port-play"></div>':''}
        </div>
        <div class="port-work-info">
          <div class="port-work-meta"><span class="port-work-cat">${esc(w.categoryLabel||w.category||'Trabajo')}</span><span class="port-work-year">${esc(w.year||'')}</span></div>
          <div class="port-work-title">${esc(w.title||'PROYECTO')}</div>
          <div class="port-work-client">Cliente: ${esc(w.client||'Confidencial')}</div>
          <div class="port-work-desc">${esc(w.description||'')}</div>
          <div class="port-work-tags">${(w.tags||[]).map(t=>`<span class="port-work-tag">${esc(t)}</span>`).join('')}</div>
        </div>
      </article>`).join('') + `<div class="port-empty" id="port-empty"><p>NO HAY TRABAJOS EN ESTA CATEGORÍA AÚN.</p></div>`;
    grid.querySelectorAll('[data-work-id]').forEach(card=>card.addEventListener('click',()=>openWork(card.dataset.workId)));
    grid.querySelectorAll('video').forEach(v=>{
      const card=v.closest('.port-work');
      card?.addEventListener('mouseenter',()=>v.play().catch(()=>{}));
      card?.addEventListener('mouseleave',()=>{v.pause();v.currentTime=0;});
    });
    bindFilters();
  }
  function bindFilters(){
    const btns=document.querySelectorAll('.filter-btn');
    const countEl=document.getElementById('visible-count');
    const emptyEl=document.getElementById('port-empty');
    function apply(filter){
      const works=document.querySelectorAll('.port-work');
      let visible=0;
      works.forEach(w=>{ const match=filter==='all'||w.dataset.cat===filter; w.classList.toggle('hidden',!match); if(match) visible++; });
      if(countEl) countEl.textContent=visible;
      if(emptyEl) emptyEl.classList.toggle('show', visible===0);
    }
    btns.forEach(btn=>{
      btn.onclick=()=>{ btns.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); apply(btn.dataset.filter || 'all'); };
    });
    apply(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
  }
  function ensureModal(){
    if(document.getElementById('work-modal')) return;
    const html = `<div id="work-modal" class="work-modal" aria-hidden="true">
      <div class="work-modal-backdrop" data-close-modal></div>
      <div class="work-modal-panel" role="dialog" aria-modal="true">
        <button class="work-modal-close" data-close-modal>×</button>
        <div class="work-modal-media" id="modal-media"></div>
        <div class="work-modal-side">
          <div class="work-modal-kicker" id="modal-kicker"></div>
          <h2 id="modal-title"></h2>
          <p class="work-modal-client" id="modal-client"></p>
          <p class="work-modal-desc" id="modal-desc"></p>
          <div class="work-modal-tags" id="modal-tags"></div>
          <div class="work-modal-controls"><button id="modal-prev">←</button><span id="modal-count"></span><button id="modal-next">→</button></div>
          <div class="work-modal-thumbs" id="modal-thumbs"></div>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    document.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
    document.getElementById('modal-prev')?.addEventListener('click',()=>shiftModal(-1));
    document.getElementById('modal-next')?.addEventListener('click',()=>shiftModal(1));
    document.addEventListener('keydown',e=>{ if(document.getElementById('work-modal')?.classList.contains('open')){ if(e.key==='Escape') closeModal(); if(e.key==='ArrowLeft') shiftModal(-1); if(e.key==='ArrowRight') shiftModal(1); } });
  }
  function galleryFor(w){
    const arr = Array.isArray(w.media) ? w.media.filter(m=>m&&m.url) : [];
    if(arr.length) return arr;
    const cover=firstMedia(w); return cover ? [cover] : [];
  }
  function openWork(id){
    const w=(state.content.portfolioWorks||[]).find(x=>String(x.id)===String(id));
    if(!w) return;
    ensureModal(); state.modalWork=w; state.modalIndex=0;
    document.getElementById('modal-kicker').textContent = `${w.categoryLabel||w.category||'Trabajo'} ${w.year?'· '+w.year:''}`;
    document.getElementById('modal-title').textContent = w.title || 'PROYECTO';
    document.getElementById('modal-client').textContent = w.client ? 'Cliente: '+w.client : '';
    document.getElementById('modal-desc').textContent = w.description || '';
    document.getElementById('modal-tags').innerHTML = (w.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('');
    renderModalMedia();
    document.getElementById('work-modal').classList.add('open');
    document.body.style.overflow='hidden';
  }
  function renderModalMedia(){
    const w=state.modalWork; if(!w) return;
    const gallery=galleryFor(w); const media=gallery[state.modalIndex] || null;
    const mediaEl=document.getElementById('modal-media');
    if(!media){ mediaEl.innerHTML='<div class="work-modal-placeholder">SIN MEDIA CARGADA</div>'; return; }
    if((media.type||'image')==='video') mediaEl.innerHTML=`<video src="${attr(media.url)}" controls playsinline autoplay></video>`;
    else mediaEl.innerHTML=`<img src="${attr(media.url)}" alt="${attr(media.alt||media.title||w.title||'Trabajo')}"/>`;
    document.getElementById('modal-count').textContent=`${state.modalIndex+1} / ${gallery.length}`;
    document.getElementById('modal-thumbs').innerHTML=gallery.map((m,i)=>`<button class="${i===state.modalIndex?'active':''}" data-i="${i}">${(m.type||'image')==='video'?'<span>VIDEO</span>':`<img src="${attr(m.url)}" alt="">`}</button>`).join('');
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
    function go(n){
      slides[cur]?.classList.remove('active'); indEl.querySelectorAll('.carousel-dot')[cur]?.classList.remove('active');
      cur=n; slides[cur]?.classList.add('active'); indEl.querySelectorAll('.carousel-dot')[cur]?.classList.add('active');
      if(curEl) curEl.textContent=String(cur+1).padStart(2,'0');
      clearInterval(state.carouselTimer); state.carouselTimer=setInterval(()=>go((cur+1)%slides.length),5000);
    }
    state.carouselTimer=setInterval(()=>go((cur+1)%slides.length),5000);
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
    if(form){ form.addEventListener('submit',function(e){ e.preventDefault(); const n=document.getElementById('nombre').value.trim(); const em=document.getElementById('email').value.trim(); const s=document.getElementById('servicio').value; const m=document.getElementById('mensaje').value.trim(); const tel=document.getElementById('telefono').value.trim(); if(!n||!em||!s||!m){alert('Por favor completá los campos obligatorios (*).');return;} const sub=encodeURIComponent('Consulta Ribera Audiovisual — '+s); const body=encodeURIComponent('Nombre: '+n+'\nEmail: '+em+'\nWhatsApp: '+tel+'\nServicio: '+s+'\n\nMensaje:\n'+m); const email=(state.content.site||{}).email || 'hola@riberaudiovisual.com'; window.location.href='mailto:'+email+'?subject='+sub+'&body='+body; this.style.display='none'; document.getElementById('form-success')?.classList.add('show'); }); }
  }
  function installAdminTrigger(){
    let clicks=0, timer=null;
    const triggers=[...document.querySelectorAll('.nav-logo,.footer-logo,.port-logo,.port-footer-logo')];
    triggers.forEach(el=>{ el.classList.add('admin-trigger-logo'); el.addEventListener('click',e=>{ e.preventDefault(); clicks++; clearTimeout(timer); timer=setTimeout(()=>{clicks=0},2200); if(clicks>=5){ window.location.href='admin.html'; } }); });
  }
  async function init(){
    installBasics(); installAdminTrigger();
    state.content = await loadContent();
    applySiteText(state.content); applyContact(state.content); renderHero(state.content); renderHomePortfolio(state.content); renderPortfolioPage(state.content); startCarousel();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
