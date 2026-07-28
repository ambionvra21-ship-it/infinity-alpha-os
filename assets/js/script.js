lucide.createIcons();

/* ---------- Clock ---------- */
function updateDateTime() {
  const el = document.getElementById('datetime');
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    + ' · ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
updateDateTime();
setInterval(updateDateTime, 60000);

/* ---------- Stat cards ---------- */
function circularProgress(pct) {
  const r = 26, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return `<svg width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="${r}" stroke="#232a3d" stroke-width="6" fill="none"/>
    <circle cx="32" cy="32" r="${r}" stroke="url(#g)" stroke-width="6" fill="none"
      stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"
      transform="rotate(-90 32 32)"/>
    <defs><linearGradient id="g"><stop offset="0%" stop-color="#5b8cff"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs>
  </svg>`;
}

function miniLine(values, color) {
  const w = 100, h = 30;
  const min = Math.min(...values), max = Math.max(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"/>
  </svg>`;
}

document.getElementById('stats-grid').innerHTML = `
  <div class="card">
    <div class="card-head"><i data-lucide="cloud"></i> Weather</div>
    <div class="value">24°C</div>
    <div class="sub">Clear Sky · Feels like 25°C</div>
  </div>
  <div class="card">
    <div class="card-head"><i data-lucide="wallet"></i> Wealth OS</div>
    <div class="value">$2,340.00</div>
    <div class="sub up">↑ 12.5% vs yesterday</div>
    ${miniLine([10,14,12,18,16,20,24], '#22c55e')}
  </div>
  <div class="card" style="display:flex; align-items:center; gap:16px;">
    <div>${circularProgress(72)}</div>
    <div>
      <div class="card-head" style="margin-bottom:2px;"><i data-lucide="target"></i> Focus</div>
      <div class="value" style="font-size:16px;">3 Active Tasks</div>
      <div class="sub">2 completed today</div>
    </div>
  </div>
  <div class="card">
    <div class="card-head"><i data-lucide="activity"></i> System</div>
    <div class="value">100%</div>
    <div class="sub">All Systems Operational</div>
    ${miniLine([5,8,6,10,9,13,15], '#5b8cff')}
  </div>
`;
lucide.createIcons();

/* ---------- Workspace grid ---------- */
const workspaceItems = [
  { icon: 'trending-up', label: 'Markets', color: '#22c55e' },
  { icon: 'wallet', label: 'Wealth OS', color: '#5b8cff' },
  { icon: 'globe', label: 'Global', color: '#a855f7' },
  { icon: 'mail', label: 'Email', color: '#f59e0b' },
  { icon: 'message-square', label: 'Messages', color: '#ec4899' },
  { icon: 'calendar', label: 'Calendar', color: '#5b8cff' },
  { icon: 'file-text', label: 'Notes', color: '#a855f7' },
  { icon: 'bar-chart-2', label: 'Analytics', color: '#22c55e' },
  { icon: 'bot', label: 'AI Assistant', color: '#5b8cff' },
  { icon: 'grid', label: 'More Apps', color: '#8b93a7' },
];
document.getElementById('workspace-grid').innerHTML = workspaceItems.map(w => `
  <div class="workspace-tile">
    <div class="icon-circle" style="background:${w.color}22;">
      <i data-lucide="${w.icon}" style="color:${w.color}"></i>
    </div>
    <span>${w.label}</span>
  </div>
`).join('');
lucide.createIcons();

/* ---------- Live crypto markets (CoinGecko, with sparkline) ---------- */
let coinsData = [];

async function loadMarkets() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true');
    coinsData = await res.json();

    document.getElementById('markets-list').innerHTML = coinsData.map((c, i) => {
      const up = c.price_change_percentage_24h >= 0;
      return `
      <div class="coin-row" data-index="${i}">
        <div class="coin-left">
          <img src="${c.image}" alt="${c.symbol}">
          <div class="coin-name">${c.market_cap_rank}. ${c.name} <br><small>${c.symbol.toUpperCase()}</small></div>
        </div>
        <div class="coin-right">
          ${miniLine(c.sparkline_in_7d.price.slice(-30), up ? '#22c55e' : '#ef4444')}
          <div>
            <div class="price">$${c.current_price.toLocaleString()}</div>
            <div class="${up ? 'up' : 'down'}">${up ? '+' : ''}${c.price_change_percentage_24h?.toFixed(2)}%</div>
          </div>
        </div>
      </div>`;
    }).join('');

    document.querySelectorAll('.coin-row').forEach(row => {
      row.addEventListener('click', () => showDetail(parseInt(row.dataset.index)));
    });

    // sentiment: average of top 10 24h changes
    const avg = coinsData.reduce((s, c) => s + (c.price_change_percentage_24h || 0), 0) / coinsData.length;
    const sentEl = document.getElementById('sentiment-val');
    sentEl.textContent = (avg >= 0 ? '+' : '') + avg.toFixed(2) + '% ' + (avg >= 0 ? 'Bullish' : 'Bearish');
    sentEl.className = avg >= 0 ? 'up' : 'down';

    if (!document.querySelector('.market-detail').dataset.selected) {
      showDetail(0);
    }
  } catch (e) {
    document.getElementById('markets-list').textContent = 'Failed to load markets.';
  }
}

function showDetail(i) {
  const c = coinsData[i];
  const panel = document.getElementById('market-detail');
  panel.dataset.selected = i;
  const up = c.price_change_percentage_24h >= 0;
  panel.innerHTML = `
    <div class="detail-head">
      <img src="${c.image}" alt="${c.symbol}">
      <div>
        <div>${c.name} <small style="color:var(--muted)">${c.symbol.toUpperCase()}/USD</small></div>
      </div>
    </div>
    <div class="detail-price">$${c.current_price.toLocaleString()}
      <span class="${up ? 'up' : 'down'}" style="font-size:14px;">${up ? '+' : ''}${c.price_change_percentage_24h?.toFixed(2)}%</span>
    </div>
    <div class="big-chart">${bigLine(c.sparkline_in_7d.price, up ? '#22c55e' : '#ef4444')}</div>
  `;
}

function bigLine(values, color) {
  const w = 300, h = 120;
  const min = Math.min(...values), max = Math.max(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:100%;">
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"/>
  </svg>`;
}

loadMarkets();
setInterval(loadMarkets, 60000);
