/* Shani Traders — material calculator */
(async () => {
  'use strict';
  const { $, $$, esc, t, shopName, waLink, svg, List, toast, HI } = ST;
  const L = window.LANG || { en: {}, hi: {} };
  const FT = 0.3048, M3_CFT = 35.3147, SQFT_M2 = 0.092903, CEMENT_KG_M3 = 1440, BAG = 50, TROLLEY_CFT = 100;

  const val = id => Math.max(0, parseFloat($('#' + id).value) || 0);
  const feet = id => { const v = val(id), u = $('#' + id + '-u'); return u && u.value === 'in' ? v / 12 : v; };
  const fmt = (n, d = 0) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: 0 });
  const up = (n, step = 1) => Math.ceil(n / step - 1e-9) * step;
  const trolleys = cft => cft / TROLLEY_CFT;
  const tr = n => fmt(n, 1);

  /* Known catalogue items, so calculator lines match what the shop lists */
  let known = {};
  try { (await ST.loadProducts()).forEach(p => { known[p.id] = p; }); } catch (e) { /* offline is fine */ }
  // A list line: use the catalogue item when it exists, otherwise a named line
  function line(id, lkey, unit, qty, vars) {
    const p = known[id];
    if (p) return { id: p.id, name: p.name, nameHi: p.nameHi, brand: p.brand, unit: p.unit, qty };
    const en = (L.en[lkey] || lkey).replace(/\{(\w+)\}/g, (m, k) => (vars || {})[k] ?? m);
    const hi = (L.hi[lkey] || en).replace(/\{(\w+)\}/g, (m, k) => (vars || {})[k] ?? m);
    return { id: 'calc-' + id, name: en, nameHi: hi, brand: '', unit, qty };
  }
  // Mortar: cement bags and sand cft from a dry volume (m³) and a 1:n mix
  const mortar = (dry, n) => ({ bags: dry / (1 + n) * CEMENT_KG_M3 / BAG, sand: dry * n / (1 + n) * M3_CFT });

  const CALC = {
    brick() {
      const area = Math.max(0, val('b-l') * val('b-h') - val('b-o'));
      const vol = area * SQFT_M2 * parseFloat($('#b-t').value);
      const red = $('#b-k').value === 'red';
      const b = red ? [0.23, 0.115, 0.075] : [0.23, 0.11, 0.075];
      const perM3 = 1 / ((b[0] + 0.01) * (b[1] + 0.01) * (b[2] + 0.01));
      const nBricks = vol * perM3;
      const wet = Math.max(0, vol - nBricks * b[0] * b[1] * b[2]);
      const m = mortar(wet * 1.33, +$('#b-m').value);
      const bricks = up(nBricks * 1.05, 10), bags = up(m.bags), sand = up(m.sand);
      return {
        meta: t('r.vol', { cft: fmt(vol * M3_CFT), m3: fmt(vol, 2) }), note: t('n.brick', { n: Math.round(perM3) }),
        work: `${t('calc.brick')} ${fmt(val('b-l'), 1)} × ${fmt(val('b-h'), 1)} ft`,
        rows: [
          { k: 'r.bricks', v: bricks, u: 'u.pcs', ln: line(red ? 'red-brick' : 'fly-ash-brick', red ? 'l.brick' : 'l.fly', 'piece', bricks) },
          { k: 'r.cement', v: bags, u: 'u.bags', ln: line('ppc-cement', 'l.cement', 'bag', bags) },
          { k: 'r.sand', v: tr(trolleys(sand)), u: 'u.trolley', sub: t('r.sandSub', { cft: fmt(sand), t: tr(trolleys(sand)) }), ln: line('river-sand', 'l.sand', 'trolley', up(trolleys(sand))) }
        ]
      };
    },
    concrete() {
      const n = Math.max(1, Math.round(val('c-n')) || 1);
      const vol = feet('c-l') * feet('c-w') * feet('c-d') * n * FT ** 3;
      const mix = { m20: [1, 1.5, 3], m15: [1, 2, 4], m10: [1, 3, 6] }[$('#c-m').value];
      const sum = mix[0] + mix[1] + mix[2], dry = vol * 1.54;
      const bags = up(dry / sum * CEMENT_KG_M3 / BAG);
      const sand = up(dry * mix[1] / sum * M3_CFT), agg = up(dry * mix[2] / sum * M3_CFT);
      const el = $('#c-e').value;
      const pct = { slab: 0.01, beam: 0.02, column: 0.025, footing: 0.008 }[el];
      const steel = $('#c-m').value === 'm10' ? 0 : up(vol * pct * 7850, 10);
      const rows = [
        { k: 'r.cement', v: bags, u: 'u.bags', ln: line('ppc-cement', 'l.cement', 'bag', bags) },
        { k: 'r.sand', v: tr(trolleys(sand)), u: 'u.trolley', sub: t('r.sandSub', { cft: fmt(sand), t: tr(trolleys(sand)) }), ln: line('river-sand', 'l.sand', 'trolley', up(trolleys(sand))) },
        { k: 'r.agg', v: tr(trolleys(agg)), u: 'u.trolley', sub: t('r.sandSub', { cft: fmt(agg), t: tr(trolleys(agg)) }), ln: line('gitti-20mm', 'l.agg', 'trolley', up(trolleys(agg))) }
      ];
      if (steel) rows.push({ k: 'r.steel', v: fmt(steel), u: 'u.kg', ln: line('sariya', 'l.steel', 'kg', steel) });
      return { meta: t('r.vol', { cft: fmt(vol * M3_CFT), m3: fmt(vol, 2) }), note: t('n.concrete'), work: `${t('calc.' + el)} × ${n}, ${$('#c-m').value.toUpperCase()}`, rows };
    },
    plaster() {
      const area = Math.max(0, val('p-l') * val('p-h') - val('p-o'));
      const wet = area * SQFT_M2 * (+$('#p-t').value / 1000);
      const m = mortar(wet * 1.27 * 1.2, +$('#p-m').value);
      const bags = up(m.bags), sand = up(m.sand);
      return {
        meta: t('r.area', { a: fmt(area) }), note: t('n.plaster'), work: `${t('calc.plaster')} ${fmt(area)} sq ft, ${$('#p-t').value} mm`,
        rows: [
          { k: 'r.cement', v: bags, u: 'u.bags', ln: line('ppc-cement', 'l.cement', 'bag', bags) },
          { k: 'r.sand', v: tr(trolleys(sand)), u: 'u.trolley', sub: t('r.sandSub', { cft: fmt(sand), t: tr(trolleys(sand)) }), ln: line('river-sand', 'l.sand', 'trolley', up(trolleys(sand))) }
        ]
      };
    },
    tiles() {
      const area = val('t-l') * val('t-w');
      const [a, b, per] = $('#t-s').value.split('x').map(Number);
      const tileFt = a * b / 1e6 / SQFT_M2;
      const tiles = area ? up(area / tileFt * (+$('#t-x').value)) : 0;
      const boxes = up(tiles / per), adh = area ? up(area * 1.05 / 45) : 0;
      const size = `${a} × ${b} mm`;
      return {
        meta: t('r.area', { a: fmt(area) }), note: t('n.tiles'), work: `${t('calc.tiles')} ${fmt(val('t-l'), 1)} × ${fmt(val('t-w'), 1)} ft, ${size}`,
        rows: [
          { k: 'r.tiles', v: fmt(tiles), u: 'u.pcs', sub: t('r.boxSub', { n: boxes, per }), ln: line('floor-tile', 'l.tiles', 'box', boxes, { size }) },
          { k: 'r.adhesive', v: adh, u: 'u.bags', ln: line('tile-adhesive', 'l.adhesive', 'bag', adh) }
        ]
      };
    },
    paint() {
      const out = $('#a-f').value === 'out';
      const l = val('a-l'), w = val('a-w'), h = val('a-h'), n = out ? 1 : Math.max(1, Math.round(val('a-n')) || 1);
      const ceil = !out && $('#a-c').checked ? l * w : 0;
      const area = Math.max(0, (2 * (l + w) * h - val('a-o') + ceil) * n);
      const paint = area ? up(area / (out ? 45 : 55)) : 0, primer = area ? up(area / 100) : 0;
      const puttyKg = area ? up(area / 10) : 0, puttyBags = up(puttyKg / 40);
      return {
        meta: t('r.area', { a: fmt(area) }), note: t('n.paint'), work: `${t(out ? 'calc.outside' : 'calc.inside')}, ${fmt(area)} sq ft`,
        rows: [
          { k: 'r.paint', v: paint, u: 'u.litre', ln: line(out ? 'paint-exterior' : 'paint-interior', out ? 'l.paintX' : 'l.paint', 'litre', paint) },
          { k: 'r.primer', v: primer, u: 'u.litre', ln: line('primer', 'l.primer', 'litre', primer) },
          { k: 'r.putty', v: puttyBags, u: 'u.bags', sub: t('r.puttySub', { kg: fmt(puttyKg), b: puttyBags }), ln: line('wall-putty', 'l.putty', 'bag', puttyBags) }
        ]
      };
    }
  };

  /* Concrete: sensible default sizes and units for each element */
  const EL = {
    slab:    { l: [20, 'ft'], w: [15, 'ft'], d: [5, 'in'], n: 1, lk: 'calc.length' },
    beam:    { l: [15, 'ft'], w: [9, 'in'], d: [12, 'in'], n: 4, lk: 'calc.length' },
    column:  { l: [10, 'ft'], w: [9, 'in'], d: [12, 'in'], n: 8, lk: 'calc.height' },
    footing: { l: [4, 'ft'], w: [4, 'ft'], d: [12, 'in'], n: 8, lk: 'calc.length' }
  };
  function setElement(e) {
    const d = EL[e];
    [['c-l', d.l], ['c-w', d.w], ['c-d', d.d]].forEach(([id, [v, u]]) => { $('#' + id).value = v; $('#' + id + '-u').value = u; });
    $('#c-n').value = d.n;
    $('label[for="c-l"]').textContent = t(d.lk);
  }
  $('#c-e').addEventListener('change', e => { setElement(e.target.value); run(); });
  setElement('slab');
  $('#a-f').addEventListener('change', () => { syncPaint(); run(); });
  function syncPaint() {
    const out = $('#a-f').value === 'out';
    $('#a-c-wrap').hidden = out;
    $('#a-n').closest('.field').hidden = out;
    $('label[for="a-l"] [data-t]').textContent = t(out ? 'calc.houseL' : 'calc.roomL');
    $('label[for="a-w"] [data-t]').textContent = t(out ? 'calc.houseW' : 'calc.roomW');
  }

  /* Tabs */
  let cur = 'brick', result = null;
  try { const h = location.hash.slice(1); if (CALC[h]) cur = h; } catch (e) { }
  function showTab(c) {
    cur = c;
    $$('#ctabs [data-c]').forEach(b => b.setAttribute('aria-selected', b.dataset.c === c));
    $$('#cform fieldset').forEach(f => { f.hidden = f.dataset.c !== c; });
    history.replaceState(null, '', '#' + c);
    run();
  }
  $('#ctabs').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) showTab(b.dataset.c); });

  function run() {
    result = CALC[cur]();
    const has = result.rows.some(r => parseFloat(String(r.v).replace(/,/g, '')) > 0);
    $('#r-meta').textContent = has ? result.meta : t('r.enter');
    $('#r-list').innerHTML = has ? result.rows.map(r => `<li><span class="r-k">${esc(t(r.k))}</span>
      <span class="r-v">${esc(String(r.v))} <small>${esc(t(r.u))}</small></span>${r.sub ? `<span class="r-sub">${esc(r.sub)}</span>` : ''}</li>`).join('') : '';
    $('#r-acts').hidden = !has;
    $('#r-note').textContent = result.note;
    const text = result.rows.filter(r => r.ln.qty > 0).map(r => `- ${t(r.k)}: ${r.v} ${t(r.u)}${r.sub ? ' (' + r.sub + ')' : ''}`).join('\n');
    $('#r-wa').href = waLink(t('r.waMsg', { shop: shopName(), work: result.work, list: text }));
  }
  $('#r-wa').innerHTML = svg('wa') + esc(t('r.wa'));
  $('#cform').addEventListener('input', run);
  $('#cform').addEventListener('change', run);
  $('#cform').addEventListener('submit', e => e.preventDefault());
  $('#r-add').addEventListener('click', () => {
    if (!result) return;
    result.rows.forEach(r => { if (r.ln.qty > 0) List.add(r.ln, r.ln.qty); });
    toast(t('r.added'), `<a href="enquiry.html">${esc(t('toast.view'))}</a>`);
  });
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (CALC[h] && h !== cur) showTab(h); });
  syncPaint();
  showTab(cur);
})();
