/* Shani Traders — shared site code */
(function () {
  'use strict';
  const S = window.SHOP || {};
  const CATS = window.CATEGORIES || [];

  /* ---------- Language ---------- */
  const DICT = window.LANG || { en: {}, hi: {} };
  const LKEY_LANG = 'st_lang';
  function pickLang() {
    if (document.body.dataset.page === 'admin') return 'en';
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'hi') { try { localStorage.setItem(LKEY_LANG, q); } catch (e) { } return q; }
    try { const v = localStorage.getItem(LKEY_LANG); if (v === 'en' || v === 'hi') return v; } catch (e) { }
    if (S.defaultLang === 'hi' || S.defaultLang === 'en') return S.defaultLang;
    return /^hi\b/i.test(navigator.language || '') ? 'hi' : 'en';
  }
  const lang = pickLang();
  const HI = lang === 'hi';
  document.documentElement.lang = lang;
  function t(key, vars) {
    let s = (DICT[lang] && DICT[lang][key]) ?? (DICT.en && DICT.en[key]) ?? key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] !== undefined ? vars[k] : m);
    return s;
  }
  const shopName = () => HI && S.nameHi ? S.nameHi : S.name;
  const loc = (o, k) => (HI && o && o[k + 'Hi']) ? o[k + 'Hi'] : (o ? o[k] : '');
  const unitT = u => HI ? ((window.UNITS_HI || {})[String(u || '').toLowerCase()] || u) : u;
  function setLang(l) {
    try { localStorage.setItem(LKEY_LANG, l); } catch (e) { }
    const u = new URL(location.href); u.searchParams.delete('lang'); location.replace(u.toString());
  }
  /* Fill static text marked with data-t (text), data-t-ph (placeholder), data-t-aria (label) */
  function applyT(root = document) {
    root.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
    root.querySelectorAll('[data-t-ph]').forEach(el => { el.placeholder = t(el.dataset.tPh); });
    root.querySelectorAll('[data-t-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.tAria)); });
    const tk = document.body.dataset.title; if (tk) document.title = t(tk);
  }

  const ICONS = {
    cement: '<path d="M13 9h22l3 7v23a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3V16z"/><path d="M10 16h28"/><path d="M17 25h14M17 31h10"/>',
    steel: '<path d="M7 36 36 7M13 41 41 13"/><path d="M12 31l3 3M17 26l3 3M22 21l3 3M27 16l3 3M18 36l3 3M23 31l3 3M28 26l3 3M33 21l3 3"/>',
    bricks: '<rect x="6" y="11" width="36" height="26" rx="1"/><path d="M6 19.7h36M6 28.3h36M18 11v8.7M30 11v8.7M12 19.7v8.6M24 19.7v8.6M36 19.7v8.6M18 28.3V37M30 28.3V37"/>',
    plumbing: '<path d="M8 17h20a7 7 0 0 1 7 7v5"/><path d="M8 13v8"/><path d="M19 17v-6M15 11h8"/><path d="M35 34v1M31 40h8"/>',
    electrical: '<path d="M24 6a12 12 0 0 0-7 21.7V32h14v-4.3A12 12 0 0 0 24 6z"/><path d="M18 37h12M20 42h8"/><path d="M25 13l-4 7h6l-4 7"/>',
    tiles: '<rect x="7" y="7" width="15" height="15" rx="1"/><rect x="26" y="7" width="15" height="15" rx="1"/><rect x="7" y="26" width="15" height="15" rx="1"/><rect x="26" y="26" width="15" height="15" rx="1"/>',
    paints: '<rect x="7" y="7" width="27" height="11" rx="2"/><path d="M34 12.5h5v9H22v6"/><rect x="19" y="27.5" width="6" height="14" rx="1"/>',
    tools: '<path d="M18 10h16l5 5-5 5H18z"/><path d="M26 20v22"/><path d="M18 10v10"/>',
    wa: '<path fill="currentColor" stroke="none" d="M24 5.5A18.4 18.4 0 0 0 8.2 33.3L5.6 42.5l9.4-2.5A18.4 18.4 0 1 0 24 5.5zm0 33.6c-2.8 0-5.6-.8-8-2.2l-.6-.3-5.6 1.5 1.5-5.4-.4-.6A15.2 15.2 0 1 1 24 39.1zm8.4-11.4c-.5-.2-2.7-1.3-3.1-1.5-.4-.2-.7-.2-1 .2l-1.4 1.8c-.3.3-.5.3-1 .1-.5-.2-1.9-.7-3.7-2.3a13.6 13.6 0 0 1-2.5-3.1c-.3-.5 0-.7.2-.9l.7-.8.5-.8c.2-.3 0-.6 0-.8l-1.4-3.4c-.4-.9-.7-.8-1-.8h-.9c-.3 0-.8.1-1.2.6-.4.4-1.6 1.6-1.6 3.9s1.7 4.5 1.9 4.8c.2.3 3.3 5 8 7 1.1.5 2 .8 2.7 1 1.1.4 2.2.3 3 .2.9-.1 2.7-1.1 3.1-2.2.4-1.1.4-2 .3-2.2-.1-.2-.4-.3-.9-.6z"/>',
    list: '<path d="M16 12h24M16 24h24M16 36h24"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="24" r="1.5"/><circle cx="9" cy="36" r="1.5"/>',
    menu: '<path d="M8 14h32M8 24h32M8 34h32"/>',
    search: '<circle cx="21" cy="21" r="12"/><path d="M30 30l10 10"/>'
  };
  const svg = (name, extra = '') =>
    `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICONS[name] || ICONS.tools}</svg>`;
  const icon = name => `<span class="ico" aria-hidden="true">${svg(name)}</span>`;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = n => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const params = new URLSearchParams(location.search);

  function bool(v, d) {
    if (v === true || v === false) return v;
    if (v === null || v === undefined || v === '') return d;
    return ['TRUE', '1', 'YES', 'Y'].includes(String(v).trim().toUpperCase());
  }
  function num(v) {
    if (v === '' || v === null || v === undefined) return '';
    const n = Number(String(v).replace(/[^\d.]/g, ''));
    return isFinite(n) && n > 0 ? n : '';
  }
  function norm(p) {
    return {
      id: String(p.id ?? '').trim(), name: String(p.name ?? '').trim(), nameHi: String(p.nameHi ?? '').trim(),
      descriptionHi: String(p.descriptionHi ?? '').trim(), category: String(p.category ?? '').trim(),
      brand: String(p.brand ?? '').trim(), unit: String(p.unit ?? '').trim(), price: num(p.price), mrp: num(p.mrp),
      description: String(p.description ?? '').trim(), image: String(p.image ?? '').trim(), photoCredit: String(p.photoCredit ?? '').trim(), photoLink: String(p.photoLink ?? '').trim(), tags: String(p.tags ?? '').trim(),
      inStock: bool(p.inStock, true), visible: bool(p.visible, true), featured: bool(p.featured, false),
      sort: Number(p.sort) || 999
    };
  }
  /* cat(id) gives the category with name/stage/blurb already in the current language */
  const cat = id => {
    const c = CATS.find(x => x.id === id);
    if (!c) return { id, name: id || 'Other items', stage: '', icon: 'tools', blurb: '' };
    return { ...c, name: loc(c, 'name'), stage: loc(c, 'stage'), blurb: loc(c, 'blurb') };
  };
  const pName = p => loc(p, 'name');
  const pDesc = p => loc(p, 'description');
  const hasPrice = p => p.price !== '';
  const priceHTML = p => hasPrice(p)
    ? `<span class="amt">${inr(p.price)}</span><span class="per">${esc(t('card.per', { unit: unitT(p.unit || 'unit') }))}</span>` +
      (p.mrp && p.mrp > p.price ? `<s class="mrp">MRP ${inr(p.mrp)}</s>` : '')
    : `<span class="ask">${esc(t('card.ask'))}</span>`;
  const localImg = p => 'images/' + encodeURIComponent(p.id) + '.jpg';
  const imgSrc = p => {
    const v = p.image;
    if (!v) return localImg(p);
    return /^(https?:|images\/)/i.test(v) ? v : 'images/' + v;
  };
  // Try the saved photo, then images/<code>.jpg, then fall back to the category drawing
  const media = p => {
    const src = imgSrc(p), alt = src === localImg(p) ? '' : localImg(p);
    return icon(cat(p.category).icon) +
      `<img src="${esc(src)}" alt="${esc(pName(p))}" loading="lazy" referrerpolicy="no-referrer" data-alt="${esc(alt)}"
        onerror="if(this.dataset.alt){this.src=this.dataset.alt;this.dataset.alt=''}else{this.remove()}">`;
  };
  const creditHTML = p => p.photoCredit
    ? `<p class="credit">${esc(t('pd.photo'))}: ${p.photoLink ? `<a href="${esc(p.photoLink)}" target="_blank" rel="noopener">${esc(p.photoCredit)}</a>` : esc(p.photoCredit)}</p>` : '';

  /* ---------- Products ---------- */
  const PKEY = 'st_products_v1';
  let byId = {};
  async function loadProducts() {
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(PKEY)); } catch (e) { /* ignore */ }
    const prep = data => {
      const list = data.map(norm).filter(p => p.id && p.name && p.visible)
        .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
      byId = {}; list.forEach(p => { byId[p.id] = p; });
      return list;
    };
    if (S.apiUrl && cached && Date.now() - cached.t < (S.cacheMinutes || 5) * 60000) return prep(cached.data);
    try {
      const r = await fetch(S.apiUrl + '?action=products', { cache: 'no-store' });
      const j = await r.json();
      const data = Array.isArray(j) ? j : j.products;
      if (!Array.isArray(data)) throw new Error('Bad data');
      if (S.apiUrl) { try { localStorage.setItem(PKEY, JSON.stringify({ t: Date.now(), data })); } catch (e) { /* full */ } }
      return prep(data);
    } catch (e) {
      if (cached) return prep(cached.data);
      throw e;
    }
  }

  /* ---------- Enquiry list (kept in this browser) ---------- */
  const LKEY = 'st_list_v1';
  const List = {
    get() { try { return JSON.parse(localStorage.getItem(LKEY)) || []; } catch (e) { return []; } },
    set(a) {
      try { localStorage.setItem(LKEY, JSON.stringify(a)); } catch (e) { /* ignore */ }
      badge(); document.dispatchEvent(new CustomEvent('list:change'));
    },
    add(p, qty = 1) {
      const a = this.get(); const f = a.find(x => x.id === p.id);
      if (f) f.qty = Number(f.qty) + qty; else a.push({ id: p.id, name: p.name, nameHi: p.nameHi || '', brand: p.brand || '', unit: p.unit, qty });
      this.set(a);
    },
    setQty(id, q) { const a = this.get(); const f = a.find(x => x.id === id); if (f) { f.qty = Math.max(1, q); this.set(a); } },
    remove(id) { this.set(this.get().filter(x => x.id !== id)); },
    clear() { this.set([]); },
    count() { return this.get().length; }
  };
  const listText = items => items.map((x, i) =>
    `${i + 1}. ${x.name}${x.brand ? ' (' + x.brand + ')' : ''} — ${x.qty} ${x.unit || ''}`.trim()).join('\n');

  const waLink = text => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text)}`;
  const productWA = (p, qty) => waLink(
    t('wa.product', { shop: shopName(), item: p.name + (p.brand ? ' (' + p.brand + ')' : '') }) +
    (qty ? '\n' + t('wa.qty', { q: qty, unit: unitT(p.unit) }) : ''));

  async function api(body) {
    if (!S.apiUrl) throw new Error('The Apps Script URL is not set in config.js.');
    const r = await fetch(S.apiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'Request failed');
    return j;
  }

  /* ---------- UI pieces ---------- */
  function card(p) {
    const c = cat(p.category);
    const url = `product.html?id=${encodeURIComponent(p.id)}`;
    return `<article class="card${p.inStock ? '' : ' is-out'}">
      <a class="card-media" href="${url}" tabindex="-1" aria-hidden="true">${p.inStock ? '' : `<span class="tag-out">${esc(t('card.out'))}</span>`}${media(p)}</a>
      <div class="card-body">
        <p class="card-brand">${esc(p.brand || c.name)}</p>
        <h3><a href="${url}">${esc(pName(p))}</a></h3>
        <p class="price">${priceHTML(p)}</p>
        <div class="card-actions">
          ${p.inStock
            ? `<button class="btn btn-dark" data-add="${esc(p.id)}">${esc(t('card.add'))}</button>`
            : `<button class="btn btn-ghost" disabled>${esc(t('card.out'))}</button>`}
          <a class="btn btn-wa icon-btn" href="${productWA(p)}" target="_blank" rel="noopener" aria-label="${esc(t('card.waAria', { name: pName(p) }))}">${svg('wa')}</a>
        </div>
      </div>
    </article>`;
  }

  let toastTimer;
  function toast(msg, linkHTML = '') {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = `<span>${esc(msg)}</span>${linkHTML}`;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function badge() { $$('[data-badge]').forEach(b => { b.textContent = List.count(); }); }

  function header() {
    const el = $('#site-header'); if (!el) return;
    const page = document.body.dataset.page;
    const links = [['home', 'index.html'], ['products', 'products.html'], ['calc', 'calculator.html'], ['about', 'about.html'], ['contact', 'contact.html']];
    el.innerHTML = `<a class="skip" href="#main">${esc(t('skip'))}</a>
    <header class="hdr"><div class="wrap hdr-in">
      <a class="brand" href="index.html"><span class="brand-mark">ST</span><span><b>${esc(shopName())}</b><small>${esc(loc(S, 'tagline'))}</small></span></a>
      <nav class="nav" id="nav" aria-label="Main">${links.map(([k, h]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${esc(t('nav.' + k))}</a>`).join('')}</nav>
      <button class="lang-btn" type="button" lang="${HI ? 'en' : 'hi'}" aria-label="${esc(t('lang.aria'))}">${esc(t('lang.other'))}</button>
      <a class="list-btn" href="enquiry.html"${page === 'enquiry' ? ' aria-current="page"' : ''}>${svg('list')}<span class="lbl">${esc(t('nav.list'))}</span><span class="badge" data-badge>0</span></a>
      <button class="nav-toggle" aria-controls="nav" aria-expanded="false" aria-label="${esc(t('nav.menu'))}">${svg('menu')}</button>
    </div></header>`;
    const btn = $('.nav-toggle', el), nav = $('#nav', el);
    btn.addEventListener('click', () => { const o = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
    $('.lang-btn', el).addEventListener('click', () => setLang(HI ? 'en' : 'hi'));
  }

  function footer() {
    const el = $('#site-footer'); if (!el) return;
    const tel = String(S.phone).replace(/[^\d+]/g, '');
    const hello = waLink(t('wa.generic', { shop: shopName() }));
    el.innerHTML = `<footer class="ftr"><div class="wrap">
      <div class="ftr-grid">
        <div><h3>${esc(shopName())}</h3><p>${esc(loc(S, 'address'))}</p><p>GSTIN ${esc(S.gstin)}</p></div>
        <div><h3>${esc(t('f.talk'))}</h3><ul>
          <li><a href="tel:${tel}">${esc(S.phone)}</a></li>
          <li><a href="${hello}" target="_blank" rel="noopener">${esc(t('f.whatsapp'))}</a></li>
          <li><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></li>
          <li>${esc(loc(S, 'hours'))}</li></ul></div>
        <div><h3>${esc(t('f.shop'))}</h3><ul>${CATS.map(c => `<li><a href="products.html?cat=${c.id}">${esc(cat(c.id).name)}</a></li>`).join('')}</ul></div>
      </div>
      <div class="ftr-base"><span>© ${new Date().getFullYear()} ${esc(shopName())}. ${esc(t('f.note'))}</span>
      ${S.credit ? `<span>${esc(t('f.by'))} <a href="${esc(S.credit.url)}" target="_blank" rel="noopener">${esc(S.credit.name)}</a></span>` : ''}</div>
    </div></footer>
    <a class="fab" href="${hello}" target="_blank" rel="noopener" aria-label="WhatsApp">${svg('wa')}</a>`;
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    const p = byId[b.dataset.add]; if (!p) return;
    const qEl = b.dataset.qty ? $(b.dataset.qty) : null;
    const q = qEl ? Math.max(1, parseInt(qEl.value, 10) || 1) : 1;
    List.add(p, q);
    toast(t('toast.added', { name: pName(p) }), `<a href="enquiry.html">${esc(t('toast.view'))}</a>`);
  });

  header(); footer(); badge(); applyT();

  const itemsN = n => n === 1 ? t('items.1') : t('items.n', { n });
  window.ST = { t, lang, HI, shopName, loc, unitT, pName, pDesc, applyT, itemsN, S, CATS, $, $$, esc, inr, bool, num, norm, cat, hasPrice, priceHTML, media, creditHTML, imgSrc, icon, svg, card,
    loadProducts, getById: id => byId[id], List, listText, waLink, productWA, api, toast, params };
})();
