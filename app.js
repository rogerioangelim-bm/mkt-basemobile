/* ────────────────────────────────────────────
   Base Mobile & BEEGOW — Marketing Dashboard
   app.js
──────────────────────────────────────────── */

const USERS = { rogerio: 'beegow2025', admin: 'basemobile@123' };
const STORE_KEY = 'bm_mkt_v2';

let months = [];
let charts = {};

/* ── Toast notification ── */
function showToast(msg, type = 'success') {
  let t = document.getElementById('appToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'appToast';
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500;font-family:Space Grotesk,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.15);transition:opacity .3s;opacity:0;pointer-events:none;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = type === 'success' ? '#0E2A4E' : '#c62828';
  t.style.color = type === 'success' ? '#7ABE1E' : '#fff';
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

/* ── Storage ── */
function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      months = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
    months = [];
  }
}

function saveData() {
  try {
    const json = JSON.stringify(months);
    localStorage.setItem(STORE_KEY, json);
    const verify = localStorage.getItem(STORE_KEY);
    if (!verify) throw new Error('Verificação falhou');
    showToast('✓ Dados salvos com sucesso!');
  } catch (e) {
    console.error('Erro ao salvar:', e);
    showToast('⚠ Erro ao salvar. Verifique permissões do browser.', 'error');
  }
}

/* ── Auth ── */
function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  if (USERS[u] && USERS[u] === p) {
    document.getElementById('loginScreen').style.display = 'none';
    const dash = document.getElementById('dashboard');
    dash.style.display = 'block';
    const initials = u.slice(0,2).toUpperCase();
    document.getElementById('avatarLabel').textContent = initials;
    loadData();
    renderAll();
  } else {
    document.getElementById('loginErr').textContent = 'Usuário ou senha inválidos.';
  }
}
function doLogout() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginErr').textContent = '';
}
document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

/* ── Sidebar & Tabs ── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
function closeFormOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeForm();
}

const TAB_TITLES = { resumo: 'Sumário executivo', site: 'Site & tráfego', social: 'Redes sociais', crm: 'CRM & HubSpot', comparativo: 'Comparativo 6 meses' };

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', function() {
    const tab = this.dataset.tab;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById('tab-' + tab).style.display = 'block';
    document.getElementById('topbarTitle').textContent = TAB_TITLES[tab];
    if (months.length > 0) renderCharts(tab);
    if (window.innerWidth < 768) document.getElementById('sidebar').classList.remove('open');
  });
});

/* ── Modal ── */
function openForm() {
  document.getElementById('modalOverlay').classList.add('open');
}
function closeForm() {
  document.getElementById('modalOverlay').classList.remove('open');
}

/* ── Save month ── */
function fv(id) { return document.getElementById(id).value; }
function saveMonth() {
  const m = {
    mes: fv('inputMes'),
    usuarios: +fv('f_usuarios') || 0,
    sessoes: +fv('f_sessoes') || 0,
    bounce: +fv('f_bounce') || 0,
    tempo: +fv('f_tempo') || 0,
    org: +fv('f_org') || 0,
    pago: +fv('f_pago') || 0,
    direto: +fv('f_direto') || 0,
    social_t: +fv('f_social_t') || 0,
    bg_seg: +fv('f_bg_seg') || 0,
    bg_alc: +fv('f_bg_alc') || 0,
    bg_eng: +fv('f_bg_eng') || 0,
    bg_imp: +fv('f_bg_imp') || 0,
    bm_seg: +fv('f_bm_seg') || 0,
    bm_alc: +fv('f_bm_alc') || 0,
    bm_eng: +fv('f_bm_eng') || 0,
    bm_imp: +fv('f_bm_imp') || 0,
    li_seg: +fv('f_li_seg') || 0,
    li_imp: +fv('f_li_imp') || 0,
    li_nov: +fv('f_li_nov') || 0,
    li_art: +fv('f_li_art') || 0,
    hs_base: +fv('f_hs_base') || 0,
    hs_open: +fv('f_hs_open') || 0,
    hs_ctr: +fv('f_hs_ctr') || 0,
    hs_conv: +fv('f_hs_conv') || 0,
    summary: fv('f_summary')
  };
  const idx = months.findIndex(x => x.mes === m.mes);
  if (idx >= 0) months[idx] = m; else months.push(m);
  months.sort((a, b) => a.mes.localeCompare(b.mes));
  saveData();
  closeForm();
  renderAll();
}

/* ── Export / Import JSON backup ── */
function exportJSON() {
  if (months.length === 0) { showToast('Nenhum dado para exportar.', 'error'); return; }
  const blob = new Blob([JSON.stringify(months, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dados-marketing-basemobile.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('✓ Backup JSON baixado!');
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Formato inválido');
      months = data;
      months.sort((a, b) => a.mes.localeCompare(b.mes));
      saveData();
      renderAll();
      showToast('✓ Dados importados com sucesso!');
    } catch (err) {
      showToast('⚠ Arquivo JSON inválido.', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

/* ── Helpers ── */
function last() { return months[months.length - 1]; }
function prev() { return months.length > 1 ? months[months.length - 2] : null; }
function last6() { return months.slice(-6); }

function deltaHtml(cur, prevVal, higherBetter = true) {
  if (prevVal === undefined || prevVal === null || prevVal === 0) return '<span style="color:var(--text-hint)">—</span>';
  const pct = ((cur - prevVal) / prevVal * 100).toFixed(1);
  const isUp = cur >= prevVal;
  const isGood = higherBetter ? isUp : !isUp;
  const cls = isGood ? 'up' : 'down';
  const arrow = isUp ? '↑' : '↓';
  return `<span class="${cls}">${arrow} ${Math.abs(pct)}%</span> vs mês ant.`;
}

function kpiCard(label, value, prevVal, higherBetter = true, suffix = '') {
  const disp = typeof value === 'number' ? value.toLocaleString('pt-BR') : value;
  return `<div class="kpi">
    <div class="kpi-label">${label}</div>
    <div class="kpi-value">${disp}${suffix}</div>
    <div class="kpi-delta">${deltaHtml(+value, prevVal, higherBetter)}</div>
  </div>`;
}

function setLegend(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map(i =>
    `<span class="legend-item"><span class="legend-sq" style="background:${i.color}"></span>${i.label}</span>`
  ).join('');
}

/* ── Render All ── */
function renderAll() {
  if (months.length === 0) {
    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('resumoContent').style.display = 'none';
    document.getElementById('topbarMonth').textContent = 'Nenhum dado';
    return;
  }
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('resumoContent').style.display = 'block';
  document.getElementById('topbarMonth').textContent = last().mes;
  renderResumo();
  renderSite();
  renderSocial();
  renderCrm();
  renderCharts('resumo');
}

function renderResumo() {
  const l = last(), p = prev();
  document.getElementById('hlMes').textContent = l.mes;
  document.getElementById('hlText').textContent = l.summary || 'Sem destaques registrados para este mês.';
  document.getElementById('resumoKpis').innerHTML = [
    kpiCard('Usuários únicos', l.usuarios, p?.usuarios),
    kpiCard('Sessões', l.sessoes, p?.sessoes),
    kpiCard('Seguidores BEEGOW', l.bg_seg, p?.bg_seg),
    kpiCard('Seguidores BM (IG)', l.bm_seg, p?.bm_seg),
    kpiCard('Base HubSpot', l.hs_base, p?.hs_base),
    kpiCard('Conversões CRM', l.hs_conv, p?.hs_conv),
  ].join('');
}

function renderSite() {
  const l = last(), p = prev();
  document.getElementById('siteBadge').textContent = l.mes;
  document.getElementById('siteKpis').innerHTML = [
    kpiCard('Usuários únicos', l.usuarios, p?.usuarios),
    kpiCard('Sessões', l.sessoes, p?.sessoes),
    kpiCard('Bounce rate', l.bounce, p?.bounce, false, '%'),
    kpiCard('Tempo médio', l.tempo, p?.tempo, true, 's'),
  ].join('');
}

function renderSocial() {
  const l = last(), p = prev();
  ['bg', 'bm', 'li'].forEach(k => {
    const el = document.getElementById(k + 'Badge');
    if (el) el.textContent = l.mes;
  });
  document.getElementById('bgKpis').innerHTML = [
    kpiCard('Seguidores', l.bg_seg, p?.bg_seg),
    kpiCard('Alcance', l.bg_alc, p?.bg_alc),
    kpiCard('Engajamento', l.bg_eng, p?.bg_eng, true, '%'),
    kpiCard('Impressões', l.bg_imp, p?.bg_imp),
  ].join('');
  document.getElementById('bmKpis').innerHTML = [
    kpiCard('Seguidores', l.bm_seg, p?.bm_seg),
    kpiCard('Alcance', l.bm_alc, p?.bm_alc),
    kpiCard('Engajamento', l.bm_eng, p?.bm_eng, true, '%'),
    kpiCard('Impressões', l.bm_imp, p?.bm_imp),
  ].join('');
  document.getElementById('liKpis').innerHTML = [
    kpiCard('Seguidores', l.li_seg, p?.li_seg),
    kpiCard('Impressões', l.li_imp, p?.li_imp),
    kpiCard('Novos seguidores', l.li_nov, p?.li_nov),
    kpiCard('Interações artigos', l.li_art, p?.li_art),
  ].join('');
}

function renderCrm() {
  const l = last(), p = prev();
  document.getElementById('crmBadge').textContent = l.mes;
  document.getElementById('crmKpis').innerHTML = [
    kpiCard('Base total', l.hs_base, p?.hs_base),
    kpiCard('Open Rate', l.hs_open, p?.hs_open, true, '%'),
    kpiCard('CTR', l.hs_ctr, p?.hs_ctr, true, '%'),
    kpiCard('Conversões', l.hs_conv, p?.hs_conv),
  ].join('');
}

/* ── Charts ── */
const C_NAVY = '#0E2A4E';
const C_GREEN = '#7ABE1E';
const C_BLUE = '#378ADD';
const C_LIGHT = '#B5D4F4';

function mkChart(id, type, labels, datasets, extraOpts = {}) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  const canvas = document.getElementById(id);
  if (!canvas) return;
  charts[id] = new Chart(canvas, {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
      scales: {},
      ...extraOpts
    }
  });
}

function renderCharts(activeTab) {
  const s = last6();
  const lbs = s.map(x => x.mes);
  const l = last();

  if (activeTab === 'resumo' || activeTab === undefined) {
    mkChart('chartResumoSessoes', 'bar', lbs, [
      { label: 'Sessões', data: s.map(x => x.sessoes), backgroundColor: C_NAVY, yAxisID: 'y', borderRadius: 4 },
      { label: 'Bounce %', data: s.map(x => x.bounce), type: 'line', borderColor: C_GREEN, backgroundColor: 'transparent', tension: .35, yAxisID: 'y1', pointRadius: 4, pointBackgroundColor: C_GREEN, borderWidth: 2 }
    ], { scales: { x: { grid: { display: false } }, y: { position: 'left', grid: { color: 'rgba(0,0,0,.05)' } }, y1: { position: 'right', max: 100, grid: { display: false } } } });
    setLegend('leg-sessoes', [{ color: C_NAVY, label: 'Sessões' }, { color: C_GREEN, label: 'Bounce %' }]);

    mkChart('chartResumoSegs', 'line', lbs, [
      { label: 'BEEGOW', data: s.map(x => x.bg_seg), borderColor: C_GREEN, backgroundColor: 'rgba(122,190,30,.1)', fill: true, tension: .35, pointRadius: 4, pointBackgroundColor: C_GREEN, borderWidth: 2 },
      { label: 'Base Mobile', data: s.map(x => x.bm_seg), borderColor: C_NAVY, borderDash: [5, 3], backgroundColor: 'transparent', tension: .35, pointRadius: 4, pointBackgroundColor: C_NAVY, borderWidth: 2 }
    ], { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } } });
    setLegend('leg-segs', [{ color: C_GREEN, label: 'BEEGOW' }, { color: C_NAVY, label: 'Base Mobile' }]);
  }

  if (activeTab === 'site' || activeTab === undefined) {
    mkChart('chartAquis', 'doughnut',
      ['Orgânico', 'Pago', 'Direto', 'Social'],
      [{ data: [l.org, l.pago, l.direto, l.social_t], backgroundColor: [C_NAVY, C_GREEN, C_BLUE, C_LIGHT], borderWidth: 0 }],
      { plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 11, family: 'Space Grotesk' }, padding: 10, usePointStyle: true } } }, cutout: '60%' }
    );
    mkChart('chartUsuarios', 'bar', lbs, [
      { label: 'Usuários únicos', data: s.map(x => x.usuarios), backgroundColor: C_NAVY, borderRadius: 4 }
    ], { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } } });
    setLegend('leg-usuarios', [{ color: C_NAVY, label: 'Usuários únicos' }]);
  }

  if (activeTab === 'social' || activeTab === undefined) {
    mkChart('chartBgSeg', 'line', lbs, [
      { label: 'Seguidores BEEGOW', data: s.map(x => x.bg_seg), borderColor: C_GREEN, backgroundColor: 'rgba(122,190,30,.12)', fill: true, tension: .35, pointRadius: 5, pointBackgroundColor: C_GREEN, borderWidth: 2 }
    ], { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } } });
    setLegend('leg-bgSeg', [{ color: C_GREEN, label: 'Seguidores BEEGOW' }]);
  }

  if (activeTab === 'crm' || activeTab === undefined) {
    mkChart('chartCrm', 'bar', lbs, [
      { label: 'Open Rate %', data: s.map(x => x.hs_open), backgroundColor: C_NAVY, borderRadius: 4 },
      { label: 'CTR %', data: s.map(x => x.hs_ctr), backgroundColor: C_GREEN, borderRadius: 4 }
    ], { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } } });
    setLegend('leg-crm', [{ color: C_NAVY, label: 'Open Rate %' }, { color: C_GREEN, label: 'CTR %' }]);
  }

  if (activeTab === 'comparativo' || activeTab === undefined) {
    mkChart('chartComp1', 'bar', lbs, [
      { label: 'Usuários únicos', data: s.map(x => x.usuarios), backgroundColor: C_NAVY, borderRadius: 4 }
    ], { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } } });

    mkChart('chartComp2', 'line', lbs, [
      { label: 'BEEGOW IG', data: s.map(x => x.bg_seg), borderColor: C_GREEN, tension: .35, pointRadius: 4, pointBackgroundColor: C_GREEN, backgroundColor: 'transparent', borderWidth: 2 },
      { label: 'Base Mobile IG', data: s.map(x => x.bm_seg), borderColor: C_NAVY, borderDash: [4, 3], tension: .35, pointRadius: 4, pointBackgroundColor: C_NAVY, backgroundColor: 'transparent', borderWidth: 2 }
    ], { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } } });
    setLegend('leg-comp2', [{ color: C_GREEN, label: 'BEEGOW IG' }, { color: C_NAVY, label: 'Base Mobile IG' }]);

    mkChart('chartComp3', 'bar', lbs, [
      { label: 'Conversões', data: s.map(x => x.hs_conv), backgroundColor: C_BLUE, borderRadius: 4 }
    ], { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } } });

    mkChart('chartComp4', 'line', lbs, [
      { label: 'BEEGOW %', data: s.map(x => x.bg_eng), borderColor: C_GREEN, tension: .35, pointRadius: 4, pointBackgroundColor: C_GREEN, backgroundColor: 'rgba(122,190,30,.08)', fill: true, borderWidth: 2 },
      { label: 'Base Mobile %', data: s.map(x => x.bm_eng), borderColor: C_NAVY, borderDash: [4, 3], tension: .35, pointRadius: 4, pointBackgroundColor: C_NAVY, backgroundColor: 'transparent', borderWidth: 2 }
    ], { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.05)' } } } });
    setLegend('leg-comp4', [{ color: C_GREEN, label: 'BEEGOW %' }, { color: C_NAVY, label: 'Base Mobile %' }]);
  }
}

/* ── PDF EXPORT ── */
function setProgress(pct, msg) {
  document.getElementById('pdfProgress').style.width = pct + '%';
  document.getElementById('pdfProgressLabel').textContent = pct + '%';
  if (msg) document.getElementById('pdfStatusMsg').textContent = msg;
}

function buildChartImage(type, labels, datasets, width, height, extraOpts = {}) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    const ch = new Chart(ctx, {
      type,
      data: { labels, datasets },
      options: {
        responsive: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {},
        ...extraOpts
      }
    });
    setTimeout(() => { resolve(canvas.toDataURL('image/png')); ch.destroy(); }, 300);
  });
}

function pdfKpiRow(items) {
  const cols = items.map(i => `
    <td style="width:${Math.floor(100/items.length)}%;padding:6px 8px;vertical-align:top">
      <div style="background:#F0F2F7;border-radius:8px;padding:10px 12px">
        <div style="font-size:10px;color:#6B7A90;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px">${i.label}</div>
        <div style="font-size:20px;font-weight:700;color:#0E2A4E">${i.value}</div>
        <div style="font-size:10px;margin-top:3px;color:${i.up ? '#2e7d32' : '#c62828'}">${i.delta || '—'}</div>
      </div>
    </td>`).join('');
  return `<table style="width:100%;border-collapse:separate;border-spacing:0">${cols}</table>`;
}

function fmtDelta(cur, prev, hib = true, suffix = '') {
  if (!prev || prev === 0) return '—';
  const pct = ((cur - prev) / prev * 100).toFixed(1);
  const up = cur >= prev;
  const good = hib ? up : !up;
  return `${up ? '↑' : '↓'} ${Math.abs(pct)}% vs mês ant.`;
}

async function exportPDF() {
  if (months.length === 0) { alert('Insira dados de ao menos um mês antes de exportar.'); return; }

  const btn = document.getElementById('btnExport');
  btn.disabled = true;

  const overlay = document.getElementById('pdfOverlay');
  overlay.style.display = 'flex';
  setProgress(5, 'Preparando dados...');

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 14;
  const CW = W - M * 2;
  const l = last(), p = prev();
  const s6 = last6();
  const lbs = s6.map(x => x.mes);

  const NAVY = '#0E2A4E', GREEN = '#7ABE1E', BLUE = '#378ADD';

  let y = 0;

  function newPage() {
    pdf.addPage();
    y = 0;
    drawHeader();
  }

  function checkY(needed) {
    if (y + needed > H - 16) newPage();
  }

  function drawHeader() {
    pdf.setFillColor(14, 42, 78);
    pdf.rect(0, 0, W, 18, 'F');
    pdf.setFillColor(122, 190, 30);
    pdf.circle(M - 2, 9, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
    pdf.text('BASE MOBILE · BEEGOW', M + 4, 9.5);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8);
    pdf.setTextColor(122, 190, 30);
    pdf.text('Relatório de Marketing — ' + l.mes, M + 4, 14);
    pdf.setTextColor(180, 200, 220);
    const dateStr = new Date().toLocaleDateString('pt-BR');
    pdf.text('Gerado em ' + dateStr, W - M - 30, 11.5);
    y = 22;
  }

  function sectionTitle(title, icon) {
    checkY(14);
    pdf.setFillColor(240, 242, 247);
    pdf.roundedRect(M, y, CW, 9, 2, 2, 'F');
    pdf.setTextColor(14, 42, 78); pdf.setFontSize(9); pdf.setFont('helvetica', 'bold');
    pdf.text(title.toUpperCase(), M + 4, y + 6);
    y += 13;
  }

  function kpiTable(items) {
    checkY(22);
    const colW = CW / items.length;
    items.forEach((item, i) => {
      const x = M + i * colW;
      pdf.setFillColor(240, 242, 247);
      pdf.roundedRect(x + 1, y, colW - 2, 20, 2, 2, 'F');
      pdf.setTextColor(107, 122, 144); pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
      pdf.text(item.label.toUpperCase(), x + 4, y + 5);
      pdf.setTextColor(14, 42, 78); pdf.setFontSize(13); pdf.setFont('helvetica', 'bold');
      pdf.text(String(item.value), x + 4, y + 13);
      const isUp = item.delta && item.delta.startsWith('↑');
      pdf.setTextColor(isUp ? 46 : 198, isUp ? 125 : 40, isUp ? 50 : 40);
      pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
      pdf.text(item.delta || '—', x + 4, y + 18);
    });
    y += 24;
  }

  async function addChartImg(imgData, chartH) {
    checkY(chartH + 4);
    pdf.addImage(imgData, 'PNG', M, y, CW, chartH);
    y += chartH + 4;
  }

  // ── PAGE 1: CAPA + SUMÁRIO ──
  drawHeader();
  pdf.setFillColor(14, 42, 78);
  pdf.rect(M, y, CW, 28, 'F');
  pdf.setTextColor(122, 190, 30); pdf.setFontSize(8); pdf.setFont('helvetica', 'bold');
  pdf.text('SUMÁRIO EXECUTIVO', M + 6, y + 8);
  pdf.setTextColor(255, 255, 255); pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
  const summary = l.summary || 'Sem destaques registrados para este mês.';
  const lines = pdf.splitTextToSize(summary, CW - 12);
  pdf.text(lines.slice(0, 4), M + 6, y + 14);
  y += 32;

  setProgress(15, 'Renderizando KPIs...');
  kpiTable([
    { label: 'Usuários únicos', value: l.usuarios.toLocaleString('pt-BR'), delta: fmtDelta(l.usuarios, p?.usuarios) },
    { label: 'Sessões', value: l.sessoes.toLocaleString('pt-BR'), delta: fmtDelta(l.sessoes, p?.sessoes) },
    { label: 'Seg. BEEGOW', value: l.bg_seg.toLocaleString('pt-BR'), delta: fmtDelta(l.bg_seg, p?.bg_seg) },
    { label: 'Base HubSpot', value: l.hs_base.toLocaleString('pt-BR'), delta: fmtDelta(l.hs_base, p?.hs_base) },
  ]);
  kpiTable([
    { label: 'Open Rate', value: l.hs_open + '%', delta: fmtDelta(l.hs_open, p?.hs_open) },
    { label: 'CTR', value: l.hs_ctr + '%', delta: fmtDelta(l.hs_ctr, p?.hs_ctr) },
    { label: 'Conversões', value: l.hs_conv, delta: fmtDelta(l.hs_conv, p?.hs_conv) },
    { label: 'Bounce Rate', value: l.bounce + '%', delta: fmtDelta(l.bounce, p?.bounce, false) },
  ]);

  // ── CHART: Sessões 6m ──
  setProgress(30, 'Gerando gráficos do site...');
  sectionTitle('Analytics do site — evolução 6 meses');
  const chartSessImg = await buildChartImage('bar', lbs, [
    { label: 'Sessões', data: s6.map(x => x.sessoes), backgroundColor: NAVY, borderRadius: 3 },
  ], 760, 200, { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.06)' } } } });
  await addChartImg(chartSessImg, 48);

  // ── CHART: Canais aquisição ──
  setProgress(45, 'Gerando gráficos de redes sociais...');
  sectionTitle('Canais de aquisição — ' + l.mes);
  const chartAquisImg = await buildChartImage('doughnut', ['Orgânico', 'Pago', 'Direto', 'Social'],
    [{ data: [l.org, l.pago, l.direto, l.social_t], backgroundColor: [NAVY, GREEN, BLUE, '#B5D4F4'], borderWidth: 0 }],
    400, 200, { cutout: '55%', plugins: { legend: { display: true, position: 'right', labels: { font: { size: 10 }, padding: 8 } } } });
  pdf.addImage(chartAquisImg, 'PNG', M + CW / 4, y, CW / 2, 40);
  y += 44;

  // ── PAGE 2: REDES SOCIAIS ──
  newPage();
  setProgress(60, 'Gerando seção de redes sociais...');
  sectionTitle('Redes sociais — Instagram BEEGOW');
  kpiTable([
    { label: 'Seguidores', value: l.bg_seg.toLocaleString('pt-BR'), delta: fmtDelta(l.bg_seg, p?.bg_seg) },
    { label: 'Alcance', value: l.bg_alc.toLocaleString('pt-BR'), delta: fmtDelta(l.bg_alc, p?.bg_alc) },
    { label: 'Engajamento', value: l.bg_eng + '%', delta: fmtDelta(l.bg_eng, p?.bg_eng) },
    { label: 'Impressões', value: l.bg_imp.toLocaleString('pt-BR'), delta: fmtDelta(l.bg_imp, p?.bg_imp) },
  ]);

  const chartBgSegImg = await buildChartImage('line', lbs, [
    { label: 'Seguidores', data: s6.map(x => x.bg_seg), borderColor: GREEN, backgroundColor: 'rgba(122,190,30,.12)', fill: true, tension: .35, pointRadius: 4, borderWidth: 2 }
  ], 760, 180, { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.06)' } } } });
  await addChartImg(chartBgSegImg, 44);

  sectionTitle('Redes sociais — Instagram Base Mobile');
  kpiTable([
    { label: 'Seguidores', value: l.bm_seg.toLocaleString('pt-BR'), delta: fmtDelta(l.bm_seg, p?.bm_seg) },
    { label: 'Alcance', value: l.bm_alc.toLocaleString('pt-BR'), delta: fmtDelta(l.bm_alc, p?.bm_alc) },
    { label: 'Engajamento', value: l.bm_eng + '%', delta: fmtDelta(l.bm_eng, p?.bm_eng) },
    { label: 'Impressões', value: l.bm_imp.toLocaleString('pt-BR'), delta: fmtDelta(l.bm_imp, p?.bm_imp) },
  ]);

  sectionTitle('LinkedIn Base Mobile');
  kpiTable([
    { label: 'Seguidores', value: l.li_seg.toLocaleString('pt-BR'), delta: fmtDelta(l.li_seg, p?.li_seg) },
    { label: 'Impressões', value: l.li_imp.toLocaleString('pt-BR'), delta: fmtDelta(l.li_imp, p?.li_imp) },
    { label: 'Novos seguidores', value: l.li_nov, delta: fmtDelta(l.li_nov, p?.li_nov) },
    { label: 'Interações artigos', value: l.li_art.toLocaleString('pt-BR'), delta: fmtDelta(l.li_art, p?.li_art) },
  ]);

  // ── PAGE 3: CRM + COMPARATIVO ──
  setProgress(75, 'Gerando seção CRM & comparativo...');
  newPage();
  sectionTitle('CRM & HubSpot — Newsletter');
  kpiTable([
    { label: 'Base total', value: l.hs_base.toLocaleString('pt-BR'), delta: fmtDelta(l.hs_base, p?.hs_base) },
    { label: 'Open Rate', value: l.hs_open + '%', delta: fmtDelta(l.hs_open, p?.hs_open) },
    { label: 'CTR', value: l.hs_ctr + '%', delta: fmtDelta(l.hs_ctr, p?.hs_ctr) },
    { label: 'Conversões', value: l.hs_conv, delta: fmtDelta(l.hs_conv, p?.hs_conv) },
  ]);

  const chartCrmImg = await buildChartImage('bar', lbs, [
    { label: 'Open Rate %', data: s6.map(x => x.hs_open), backgroundColor: NAVY, borderRadius: 3 },
    { label: 'CTR %', data: s6.map(x => x.hs_ctr), backgroundColor: GREEN, borderRadius: 3 },
  ], 760, 200, { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.06)' } } } });
  await addChartImg(chartCrmImg, 50);

  sectionTitle('Comparativo 6 meses — Seguidores');
  const chartCompSegImg = await buildChartImage('line', lbs, [
    { label: 'BEEGOW', data: s6.map(x => x.bg_seg), borderColor: GREEN, tension: .35, pointRadius: 4, backgroundColor: 'transparent', borderWidth: 2 },
    { label: 'Base Mobile', data: s6.map(x => x.bm_seg), borderColor: NAVY, borderDash: [5, 3], tension: .35, pointRadius: 4, backgroundColor: 'transparent', borderWidth: 2 }
  ], 760, 200, { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.06)' } } } });
  await addChartImg(chartCompSegImg, 50);

  sectionTitle('Comparativo 6 meses — Engajamento (%)');
  const chartEngImg = await buildChartImage('line', lbs, [
    { label: 'BEEGOW %', data: s6.map(x => x.bg_eng), borderColor: GREEN, tension: .35, pointRadius: 4, backgroundColor: 'rgba(122,190,30,.1)', fill: true, borderWidth: 2 },
    { label: 'Base Mobile %', data: s6.map(x => x.bm_eng), borderColor: NAVY, borderDash: [4, 3], tension: .35, pointRadius: 4, backgroundColor: 'transparent', borderWidth: 2 }
  ], 760, 180, { scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.06)' } } } });
  await addChartImg(chartEngImg, 44);

  // ── RODAPÉ ──
  setProgress(92, 'Finalizando PDF...');
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFillColor(240, 242, 247);
    pdf.rect(0, H - 8, W, 8, 'F');
    pdf.setTextColor(107, 122, 144); pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
    pdf.text('Base Mobile & BEEGOW — Relatório de Marketing · Uso interno', M, H - 3);
    pdf.text(`Página ${i} de ${pageCount}`, W - M - 16, H - 3);
  }

  setProgress(100, 'Pronto! Baixando...');
  setTimeout(() => {
    const filename = `relatorio-marketing-${l.mes.replace('/', '-')}.pdf`;
    pdf.save(filename);
    overlay.style.display = 'none';
    btn.disabled = false;
  }, 600);
}
