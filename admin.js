/* Shani Traders — master control */
(() => {
  'use strict';
  const { $, $$, esc, inr, CATS, api, toast, num, norm, cat, svg, S, waLink, media } = ST;
  const KKEY = 'st_admin_key';
  let key = sessionStorage.getItem(KKEY) || '';
  let products = [], dirty = {}, enquiries = [];
  const view = { q: '', cat: 'all', show: 'all' };
  $('#s-ico').outerHTML = svg('search');

  /* ---------- Sign in ---------- */
  const lmsg = t => { $('#lmsg').innerHTML = t ? `<p class="msg err">${t}</p>` : ''; };
  if (!S.apiUrl) lmsg('Paste the Apps Script Web App URL into config.js (apiUrl) to use master control.');
  $('#lf').addEventListener('submit', async e => {
    e.preventDefault();
    const k = $('#key').value.trim(); if (!k) return;
    const b = $('#lf button'); b.disabled = true; b.textContent = 'Signing in…';
    try { await api({ action: 'admin_login', key: k }); key = k; sessionStorage.setItem(KKEY, k); start(); }
    catch (err) { lmsg(esc(err.message)); }
    b.disabled = false; b.textContent = 'Sign in';
  });
  $('#logout').addEventListener('click', () => {
    if (Object.keys(dirty).length && !confirm('You have unsaved changes. Sign out anyway?')) return;
    sessionStorage.removeItem(KKEY); location.reload();
  });
  function start() {
    $('#login').hidden = true; $('#app').hidden = false; $('#logout').hidden = false;
    loadItems(); loadEnq();
  }
  const call = body => api({ ...body, key }).catch(err => {
    if (/admin key/i.test(err.message)) { sessionStorage.removeItem(KKEY); alert('Session ended. Sign in again.'); location.reload(); }
    throw err;
  });

  /* ---------- Tabs ---------- */
  $('.tabs').addEventListener('click', e => {
    const t = e.target.closest('[data-tab]'); if (!t) return;
    $$('.tab').forEach(x => x.setAttribute('aria-selected', x === t));
    $('#tab-items').hidden = t.dataset.tab !== 'items';
    $('#tab-enq').hidden = t.dataset.tab !== 'enq';
  });

  /* ---------- Items ---------- */
  const allCats = () => [...new Set([...CATS.map(c => c.id), ...products.map(p => p.category).filter(Boolean)])];
  function fillCats() {
    $('#acat').innerHTML = '<option value="all">All categories</option>' + allCats().map(id => `<option value="${esc(id)}">${esc(cat(id).name)}</option>`).join('');
    $('#acat').value = allCats().includes(view.cat) ? view.cat : 'all';
    $('#p-cat').innerHTML = allCats().map(id => `<option value="${esc(id)}">${esc(cat(id).name)}</option>`).join('') + '<option value="__new">New category…</option>';
  }
  async function loadItems() {
    try {
      const r = await call({ action: 'admin_products' });
      setProducts(r.products);
    } catch (err) { $('#alist').innerHTML = `<p class="msg err">${esc(err.message)}</p>`; }
  }
  function setProducts(list) {
    products = list.map(norm).filter(p => p.id).sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
    dirty = {}; fillCats(); renderItems(); bar();
    try { localStorage.removeItem('st_products_v1'); } catch (e) { }
  }
  const cur = p => ({ ...p, ...(dirty[p.id] || {}) });
  function renderItems() {
    $('#n-items').textContent = products.length;
    if (!products.length) {
      $('#alist').innerHTML = `<div class="empty"><p>No items yet. Add your first item, or load a starter list of common items (no prices) and fill in your rates.</p>
        <button class="btn btn-dark" id="starter">Load starter items</button></div>`;
      $('#starter').onclick = loadStarter; $('#bulkph').hidden = true; return;
    }
    $('#bulkph').hidden = !products.some(p => !p.image);
    checkHindi();
    const w = view.q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = products.map(cur).filter(p =>
      (view.cat === 'all' || p.category === view.cat) &&
      (view.show === 'all' || (view.show === 'in' && p.inStock) || (view.show === 'out' && !p.inStock) ||
        (view.show === 'hidden' && !p.visible) || (view.show === 'noprice' && p.price === '')) &&
      w.every(x => (p.name + ' ' + p.brand + ' ' + p.tags).toLowerCase().includes(x)));
    $('#alist').innerHTML = list.length ? list.map(p => `<div class="arow${dirty[p.id] ? ' dirty' : ''}${p.visible ? '' : ' is-hidden'}" data-id="${esc(p.id)}">
      <button type="button" class="thumb" data-edit aria-label="Photo of ${esc(p.name)}">${media(p)}</button>
      <div class="nm"><b>${esc(p.name)}</b><small>${esc([p.brand, 'per ' + p.unit, cat(p.category).name].filter(Boolean).join(', '))}</small></div>
      <label class="pr"><span class="sr">Price of ${esc(p.name)}</span>₹<input type="number" min="0" step="0.01" inputmode="decimal" data-f="price" value="${p.price}" placeholder="Ask"></label>
      <label class="sw s1"><input type="checkbox" data-f="inStock"${p.inStock ? ' checked' : ''}>In stock</label>
      <label class="sw s2"><input type="checkbox" data-f="visible"${p.visible ? ' checked' : ''}>On site</label>
      <button class="btn btn-sm btn-ghost" data-edit>Edit</button></div>`).join('')
      : '<div class="empty"><p>No items match these filters.</p></div>';
  }
  $('#alist').addEventListener('input', e => {
    const f = e.target.dataset.f; if (!f) return;
    const row = e.target.closest('.arow'), id = row.dataset.id;
    const orig = products.find(p => p.id === id);
    const val = e.target.type === 'checkbox' ? e.target.checked : num(e.target.value);
    const d = dirty[id] || {};
    if (val === orig[f]) delete d[f]; else d[f] = val;
    if (Object.keys(d).length) dirty[id] = d; else delete dirty[id];
    row.classList.toggle('dirty', !!dirty[id]);
    if (f === 'visible') row.classList.toggle('is-hidden', !val);
    bar();
  });
  $('#alist').addEventListener('click', e => { const b = e.target.closest('[data-edit]'); if (b) openDlg(cur(products.find(p => p.id === b.closest('.arow').dataset.id))); });
  $('#aq').addEventListener('input', e => { view.q = e.target.value; renderItems(); });
  $('#acat').addEventListener('change', e => { view.cat = e.target.value; renderItems(); });
  $('#ashow').addEventListener('change', e => { view.show = e.target.value; renderItems(); });

  function bar() {
    const n = Object.keys(dirty).length;
    $('#dcount').textContent = n + (n === 1 ? ' item changed' : ' items changed');
    $('#savebar').classList.toggle('show', n > 0);
  }
  $('#discard').addEventListener('click', () => { dirty = {}; renderItems(); bar(); });
  $('#save').addEventListener('click', async () => {
    const items = Object.keys(dirty).map(id => ({ ...products.find(p => p.id === id), ...dirty[id] }));
    const b = $('#save'); b.disabled = true; b.textContent = 'Saving…';
    try { const r = await call({ action: 'save_products', items }); setProducts(r.products); toast(`Saved ${items.length} ${items.length === 1 ? 'item' : 'items'}. The site updates within a few minutes.`); }
    catch (err) { alert('Not saved: ' + err.message); }
    b.disabled = false; b.textContent = 'Save changes';
  });
  window.addEventListener('beforeunload', e => { if (Object.keys(dirty).length) { e.preventDefault(); e.returnValue = ''; } });

  async function loadStarter() {
    const b = $('#starter'); b.disabled = true; b.textContent = 'Loading…';
    try {
      const j = await (await fetch('starter-items.json', { cache: 'no-store' })).json();
      const r = await call({ action: 'save_products', items: j.products });
      setProducts(r.products); toast('Starter items added. Fill in your prices and stock.');
    } catch (err) { alert('Could not load starter items: ' + err.message); b.disabled = false; b.textContent = 'Load starter items'; }
  }

  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'item';
  function newId(name) {
    const base = slug(name); let id = base, n = 2;
    while (products.some(p => p.id === id)) id = base + '-' + n++;
    return id;
  }
  /* Starter items loaded before the Hindi update: offer to fill their Hindi names in one go */
  let starter = null;
  async function checkHindi() {
    try { if (!starter) starter = (await (await fetch('starter-items.json', { cache: 'no-store' })).json()).products; } catch (e) { return; }
    const todo = products.filter(p => !p.nameHi && starter.some(s => s.id === p.id && s.nameHi));
    $('#bulkhi').hidden = !todo.length;
    $('#bulkhi').textContent = `Add Hindi names (${todo.length})`;
  }
  $('#bulkhi').addEventListener('click', async () => {
    const items = products.filter(p => !p.nameHi).map(p => { const s = starter.find(x => x.id === p.id); return s && s.nameHi ? { ...p, nameHi: s.nameHi, descriptionHi: p.descriptionHi || s.descriptionHi || '' } : null; }).filter(Boolean);
    if (!items.length) return;
    const b = $('#bulkhi'); b.disabled = true; b.textContent = 'Saving…';
    try { const r = await call({ action: 'save_products', items }); setProducts(r.products); toast(`Hindi names added to ${items.length} items`); }
    catch (err) { alert('Not saved: ' + err.message); }
    b.disabled = false;
  });

  /* ---------- Item dialog ---------- */
  const dlg = $('#dlg'), pf = $('#pf');
  function openDlg(p) {
    fillCats();
    const isNew = !p;
    p = p || { id: '', name: '', nameHi: '', descriptionHi: '', category: view.cat !== 'all' ? view.cat : CATS[0].id, brand: '', unit: '', price: '', mrp: '', description: '', image: '', tags: '', inStock: true, visible: true, featured: false, sort: '' };
    $('#dtitle').textContent = isNew ? 'Add item' : 'Edit item';
    $('#pdel').hidden = isNew;
    editing = isNew ? null : p;
    $('#picker').hidden = true;
    showPhoto();
    ['id', 'name', 'brand', 'unit', 'price', 'mrp', 'description', 'image', 'tags', 'nameHi', 'descriptionHi'].forEach(k => { pf.elements[k].value = p[k] ?? ''; });
    pf.elements.sort.value = p.sort === 999 ? '' : p.sort;
    pf.elements.category.value = p.category;
    ['inStock', 'visible', 'featured'].forEach(k => { pf.elements[k].checked = !!p[k]; });
    showPhoto(); dlg.showModal(); pf.elements.name.focus();
  }
  $('#add').addEventListener('click', () => openDlg(null));
  $$('[data-close]', dlg).forEach(b => b.addEventListener('click', () => dlg.close()));
  $('#p-cat').addEventListener('change', e => {
    if (e.target.value !== '__new') return;
    const n = (prompt('New category code (one word, e.g. glass)') || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!n) { e.target.value = CATS[0].id; return; }
    const o = document.createElement('option'); o.value = n; o.textContent = n;
    e.target.insertBefore(o, e.target.lastElementChild); e.target.value = n;
  });
  let editing = null;
  function showPhoto() {
    const p = editing;
    $('#pv').innerHTML = p ? media(p) : ST.icon(cat(pf.elements.category.value).icon);
    $$('#pacts .btn').forEach(b => b.classList.toggle('is-off', !p));
    $('#pfile').disabled = $('#pfind').disabled = !p;
    $('#prm').hidden = !(p && p.image);
    $('#pcode').innerHTML = p
      ? (p.photoCredit ? `Photo: ${esc(p.photoCredit)}. ` : '') + `Photos are kept in your Google Drive. Item code: ${esc(p.id)}.`
      : 'Save the item first, then add a photo.';
  }
  function patchPhoto(id, r) {
    const p = products.find(x => x.id === id);
    if (p) Object.assign(p, { image: r.url, photoCredit: r.photoCredit, photoLink: r.photoLink });
    if (editing && editing.id === id) { Object.assign(editing, { image: r.url, photoCredit: r.photoCredit, photoLink: r.photoLink }); pf.elements.image.value = r.url; showPhoto(); }
    renderItems();
    try { localStorage.removeItem('st_products_v1'); } catch (e) { }
  }
  const busy = (on, text) => { $('#pcode').textContent = on ? text : ''; $$('#pacts .btn, #pacts input').forEach(b => { b.disabled = on; }); if (!on) showPhoto(); };

  /* Shrink the photo in the browser before upload: max 1000 px, JPEG */
  function shrink(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const k = Math.min(1, 1000 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
        x.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', 0.82).split(',')[1]);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('This file could not be read as a photo. Use a JPG or PNG.')); };
      img.src = url;
    });
  }
  $('#pfile').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f || !editing) return;
    const id = editing.id;
    busy(true, 'Uploading photo…');
    try { const data = await shrink(f); const r = await call({ action: 'upload_photo', id, data, mime: 'image/jpeg' }); patchPhoto(id, r); toast('Photo saved'); }
    catch (err) { alert('Photo not saved: ' + err.message); }
    busy(false);
  });
  $('#prm').addEventListener('click', async () => {
    if (!editing || !confirm('Remove this photo?')) return;
    const id = editing.id; busy(true, 'Removing…');
    try { const r = await call({ action: 'remove_photo', id }); patchPhoto(id, r); toast('Photo removed'); }
    catch (err) { alert('Not removed: ' + err.message); }
    busy(false);
  });

  /* Free photos from Wikimedia Commons (all freely licensed; the credit is shown on the product page) */
  const STARTER_Q = {
    'ppc-cement': 'cement bags', 'opc-cement': 'cement sacks stack', 'river-sand': 'sand pile construction site',
    'gitti-20mm': 'crushed stone aggregate', 'gitti-10mm': 'gravel aggregate pile', 'tmt-8mm': 'rebar bundle',
    'tmt-10mm': 'reinforcing steel bars', 'tmt-12mm': 'steel rebars', 'tmt-16mm': 'rebar stack', 'binding-wire': 'rebar tie wire',
    'red-brick': 'red bricks stack', 'fly-ash-brick': 'fly ash bricks', 'pvc-pipe': 'PVC pipes', 'cpvc-pipe': 'plastic water pipes',
    'water-tank': 'plastic water tank rooftop', 'house-wire': 'electrical cable coil', 'switches': 'electrical switch socket wall',
    'floor-tile': 'floor tiles', 'wall-tile': 'ceramic wall tiles', 'wall-putty': 'wall plastering', 'paint': 'paint buckets',
    'waterproofing': 'roof waterproofing', 'tasla': 'mortar pan construction', 'phawda': 'shovel'
  };
  const queryFor = p => STARTER_Q[p.id] || p.name.replace(/\(.*?\)|\d+(\.\d+)?\s*(mm|kg|l|litre|m|inch|sq)\b/gi, ' ').replace(/,.*$/, '').trim();
  const strip = h => { const d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent.replace(/\s+/g, ' ').trim(); };
  async function commons(q) {
    const u = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
      action: 'query', format: 'json', origin: '*', generator: 'search', gsrnamespace: '6', gsrlimit: '16',
      gsrsearch: q + ' filetype:bitmap', prop: 'imageinfo', iiprop: 'url|mime|extmetadata', iiurlwidth: '960',
      iiextmetadatafilter: 'Artist|LicenseShortName'
    });
    const j = await (await fetch(u)).json();
    return Object.values((j.query && j.query.pages) || {}).sort((a, b) => a.index - b.index)
      .map(pg => ({ pg, ii: (pg.imageinfo || [])[0] })).filter(x => x.ii && /jpeg|png/.test(x.ii.mime) && x.ii.thumburl)
      .map(({ pg, ii }) => {
        const m = ii.extmetadata || {};
        const artist = strip(m.Artist && m.Artist.value).slice(0, 80) || 'Unknown author';
        const lic = strip(m.LicenseShortName && m.LicenseShortName.value) || 'free licence';
        return { thumb: ii.thumburl, page: ii.descriptionurl, credit: `${artist}, ${lic}, via Wikimedia Commons`, title: pg.title };
      });
  }
  let found = [];
  async function searchPicks(q) {
    $('#picks').innerHTML = '<p class="muted">Searching…</p>';
    try { found = await commons(q); }
    catch (e) { found = []; }
    $('#picks').innerHTML = found.length
      ? found.map((x, i) => `<button type="button" data-pick="${i}" title="${esc(x.title)}"><img src="${esc(x.thumb.replace(/\/960px-/, '/330px-'))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${esc(x.thumb)}';this.onerror=null"></button>`).join('')
      : '<p class="muted">No photos found. Try simpler words in English, like "bricks" or "pipes".</p>';
  }
  $('#pfind').addEventListener('click', () => {
    if (!editing) return;
    const pk = $('#picker'); pk.hidden = !pk.hidden;
    if (!pk.hidden) { $('#pkq').value = queryFor(editing); searchPicks($('#pkq').value); pk.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  });
  $('#pkgo').addEventListener('click', () => searchPicks($('#pkq').value.trim()));
  $('#pkq').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); searchPicks(e.target.value.trim()); } });
  async function savePick(id, x) {
    try { return await call({ action: 'photo_from_url', id, url: x.thumb, credit: x.credit, link: x.page }); }
    catch (err) {
      // Drive copy failed: link the Commons photo directly instead
      const p = products.find(q => q.id === id);
      if (!p) throw err;
      await call({ action: 'save_products', items: [{ ...p, image: x.thumb, photoCredit: x.credit, photoLink: x.page }] });
      return { url: x.thumb, photoCredit: x.credit, photoLink: x.page };
    }
  }
  $('#picks').addEventListener('click', async e => {
    const b = e.target.closest('[data-pick]'); if (!b || !editing) return;
    const id = editing.id, x = found[b.dataset.pick];
    $('#picker').hidden = true; busy(true, 'Saving photo to Drive…');
    try { patchPhoto(id, await savePick(id, x)); toast('Photo saved'); }
    catch (err) { alert('Photo not saved: ' + err.message); }
    busy(false);
  });

  /* One click: a free photo for every item that has none */
  $('#bulkph').addEventListener('click', async () => {
    const todo = products.filter(p => !p.image);
    if (!todo.length || !confirm(`Find a free photo online for ${todo.length} items without a photo?\nYou can change any of them later.`)) return;
    const b = $('#bulkph'); b.disabled = true;
    const used = new Set(products.map(p => p.photoLink).filter(Boolean));
    let ok = 0, n = 0;
    for (const p of todo) {
      b.textContent = `Adding photos ${++n} of ${todo.length}…`;
      try {
        const x = (await commons(queryFor(p))).find(c => !used.has(c.page));
        if (!x) continue;
        used.add(x.page);
        const r = await savePick(p.id, x);
        Object.assign(p, { image: r.url, photoCredit: r.photoCredit, photoLink: r.photoLink }); ok++;
        renderItems();
      } catch (e) { /* skip this one */ }
    }
    b.disabled = false; b.textContent = 'Add missing photos';
    renderItems(); toast(`${ok} photos added. Open any item to change its photo.`);
    try { localStorage.removeItem('st_products_v1'); } catch (e) { }
  });

  pf.addEventListener('submit', async e => {
    e.preventDefault();
    const el = pf.elements;
    if (!el.name.value.trim() || !el.unit.value.trim()) { alert('Item name and "Sold per" are required.'); return; }
    const item = {
      id: el.id.value || newId(el.name.value), name: el.name.value.trim(), category: el.category.value, brand: el.brand.value.trim(), unit: el.unit.value.trim(),
      price: num(el.price.value), mrp: num(el.mrp.value), description: el.description.value.trim(), image: el.image.value.trim(),
      tags: el.tags.value.trim(), nameHi: el.nameHi.value.trim(), descriptionHi: el.descriptionHi.value.trim(), inStock: el.inStock.checked, visible: el.visible.checked, featured: el.featured.checked,
      sort: el.sort.value === '' ? 999 : Number(el.sort.value)
    };
    const b = $('#psave'); b.disabled = true; b.textContent = 'Saving…';
    try {
      const keep = { ...dirty }; delete keep[item.id];
      const r = await call({ action: 'save_products', items: [item] });
      setProducts(r.products); dirty = keep; renderItems(); bar();
      const wasNew = !editing;
      dlg.close(); toast(`${item.name} saved`);
      if (wasNew) { const np = products.find(p => p.id === item.id); if (np) { openDlg(np); $('#pcode').textContent = 'Saved. Now add a photo.'; } }
    } catch (err) { alert('Not saved: ' + err.message); }
    b.disabled = false; b.textContent = 'Save item';
  });
  $('#pdel').addEventListener('click', async () => {
    const id = pf.elements.id.value, name = pf.elements.name.value;
    if (!confirm(`Delete "${name}" permanently?\nTip: switch off "Show on site" instead if you may sell it again.`)) return;
    try {
      await call({ action: 'delete_product', id });
      products = products.filter(p => p.id !== id); delete dirty[id];
      renderItems(); bar(); dlg.close(); toast(`${name} deleted`);
      try { localStorage.removeItem('st_products_v1'); } catch (e) { }
    } catch (err) { alert('Not deleted: ' + err.message); }
  });

  /* ---------- Enquiries ---------- */
  async function loadEnq() {
    $('#elist').innerHTML = '<p>Loading enquiries…</p>';
    try { const r = await call({ action: 'list_enquiries' }); enquiries = r.enquiries; renderEnq(); }
    catch (err) { $('#elist').innerHTML = `<p class="msg err">${esc(err.message)}</p>`; }
  }
  function renderEnq() {
    $('#n-new').textContent = enquiries.filter(x => x.status === 'New').length;
    const f = $('#estat').value;
    const list = enquiries.filter(x => f === 'all' || x.status === f);
    $('#elist').innerHTML = list.length ? list.map(x => {
      const d = x.timestamp ? new Date(x.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';
      const ph = String(x.phone || '');
      return `<article class="ecard${x.status === 'New' ? ' new' : ''}" data-eid="${esc(x.enquiryId)}">
        <div class="ecard-top"><div><b>${esc(x.name)}</b><div class="muted">${esc([x.place, x.delivery, d].filter(Boolean).join(', '))}</div></div>
          <span class="muted">${esc(x.enquiryId)}</span></div>
        ${x.items ? `<pre>${esc(x.items)}</pre>` : ''}${x.message ? `<p>${esc(x.message)}</p>` : ''}
        <div class="acts">
          <a class="btn btn-sm btn-dark" href="tel:+91${esc(ph)}">Call ${esc(ph)}</a>
          <a class="btn btn-sm btn-wa" target="_blank" rel="noopener" href="https://wa.me/91${esc(ph)}?text=${encodeURIComponent('Namaste ' + x.name + ', this is ' + S.name + ' about your enquiry ' + x.enquiryId + '.')}">WhatsApp</a>
          <label class="sr" for="st-${esc(x.enquiryId)}">Status</label>
          <select id="st-${esc(x.enquiryId)}" data-status>${['New', 'Contacted', 'Quoted', 'Closed'].map(s => `<option${s === x.status ? ' selected' : ''}>${s}</option>`).join('')}</select>
        </div></article>`;
    }).join('') : '<div class="empty"><p>No enquiries here yet.</p></div>';
  }
  $('#estat').addEventListener('change', renderEnq);
  $('#ereload').addEventListener('click', loadEnq);
  $('#elist').addEventListener('change', async e => {
    if (!e.target.matches('[data-status]')) return;
    const id = e.target.closest('[data-eid]').dataset.eid, status = e.target.value;
    try { await call({ action: 'set_enquiry_status', enquiryId: id, status }); const x = enquiries.find(q => q.enquiryId === id); if (x) x.status = status; renderEnq(); toast('Status updated'); }
    catch (err) { alert('Not updated: ' + err.message); }
  });

  if (key && S.apiUrl) start();
})();
