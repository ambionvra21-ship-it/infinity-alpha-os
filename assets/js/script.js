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

/* ---------- Chart helpers ---------- */
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
  return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
}
function bigLine(values, color) {
  const w = 300, h = 120;
  const min = Math.min(...values), max = Math.max(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:100%;"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
}

/* ---------- Stat cards ---------- */
document.getElementById('stats-grid').innerHTML = `
  <div class="card"><div class="card-head"><i data-lucide="cloud"></i> Weather</div><div class="value">24°C</div><div class="sub">Clear Sky · Feels like 25°C</div></div>
  <div class="card"><div class="card-head"><i data-lucide="wallet"></i> Wealth OS</div><div class="value">$2,340.00</div><div class="sub up">↑ 12.5% vs yesterday</div>${miniLine([10,14,12,18,16,20,24], '#22c55e')}</div>
  <div class="card" style="display:flex; align-items:center; gap:16px;"><div>${circularProgress(72)}</div><div><div class="card-head" style="margin-bottom:2px;"><i data-lucide="target"></i> Focus</div><div class="value" style="font-size:16px;">3 Active Tasks</div><div class="sub">2 completed today</div></div></div>
  <div class="card"><div class="card-head"><i data-lucide="activity"></i> System</div><div class="value">100%</div><div class="sub">All Systems Operational</div>${miniLine([5,8,6,10,9,13,15], '#5b8cff')}</div>
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
  <div class="workspace-tile"><div class="icon-circle" style="background:${w.color}22;"><i data-lucide="${w.icon}" style="color:${w.color}"></i></div><span>${w.label}</span></div>
`).join('');
lucide.createIcons();

/* ---------- Dashboard live crypto (top 10, live ranking) ---------- */
let coinsData = [];

async function loadMarkets() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true');
    coinsData = await res.json();
    document.getElementById('markets-list').innerHTML = coinsData.map((c, i) => {
      const up = c.price_change_percentage_24h >= 0;
      return `<div class="coin-row" data-index="${i}">
        <div class="coin-left"><img src="${c.image}" alt="${c.symbol}"><div class="coin-name">${c.market_cap_rank}. ${c.name} <br><small>${c.symbol.toUpperCase()}</small></div></div>
        <div class="coin-right">${miniLine(c.sparkline_in_7d.price.slice(-30), up ? '#22c55e' : '#ef4444')}
          <div><div class="price">$${c.current_price.toLocaleString()}</div><div class="${up ? 'up' : 'down'}">${up ? '+' : ''}${c.price_change_percentage_24h?.toFixed(2)}%</div></div>
        </div></div>`;
    }).join('');
    document.querySelectorAll('#markets-list .coin-row').forEach(row => {
      row.addEventListener('click', () => showDetail(coinsData[parseInt(row.dataset.index)]));
    });
    const avg = coinsData.reduce((s, c) => s + (c.price_change_percentage_24h || 0), 0) / coinsData.length;
    const sentEl = document.getElementById('sentiment-val');
    sentEl.textContent = (avg >= 0 ? '+' : '') + avg.toFixed(2) + '% ' + (avg >= 0 ? 'Bullish' : 'Bearish');
    sentEl.className = avg >= 0 ? 'up' : 'down';
    if (!document.getElementById('market-detail').dataset.selected) showDetail(coinsData[0]);
  } catch (e) {
    document.getElementById('markets-list').textContent = 'Failed to load markets.';
  }
}

function showDetail(c) {
  const panel = document.getElementById('market-detail');
  panel.dataset.selected = c.id;
  const up = c.price_change_percentage_24h >= 0;
  panel.innerHTML = `
    <div class="detail-head"><img src="${c.image}" alt="${c.symbol}"><div>${c.name} <small style="color:var(--muted)">${c.symbol.toUpperCase()}/USD</small></div></div>
    <div class="detail-price">$${c.current_price.toLocaleString()}<span class="${up ? 'up' : 'down'}" style="font-size:14px;">${up ? '+' : ''}${c.price_change_percentage_24h?.toFixed(2)}%</span></div>
    <div class="big-chart">${bigLine(c.sparkline_in_7d.price, up ? '#22c55e' : '#ef4444')}</div>`;
}

async function selectDashCoinById(id) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}&sparkline=true`);
    const [c] = await res.json();
    if (c) showDetail(c);
  } catch (e) { /* ignore */ }
}

let dashSearchDebounce;
document.getElementById('dash-search-input')?.addEventListener('input', (e) => {
  clearTimeout(dashSearchDebounce);
  const q = e.target.value.trim();
  const box = document.getElementById('dash-search-results');
  if (!q) { box.innerHTML = ''; return; }
  dashSearchDebounce = setTimeout(async () => {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      box.innerHTML = data.coins.slice(0, 6).map(c => `
        <div class="search-result-item" data-id="${c.id}"><img src="${c.thumb}" alt="${c.symbol}"> ${c.name} <small style="color:var(--muted)">${c.symbol.toUpperCase()}</small></div>
      `).join('');
      box.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          selectDashCoinById(item.dataset.id);
          box.innerHTML = '';
          document.getElementById('dash-search-input').value = '';
        });
      });
    } catch (e) { /* ignore */ }
  }, 400);
});

loadMarkets();
setInterval(loadMarkets, 60000);

/* ---------- Sidebar navigation ---------- */
document.querySelectorAll('.sidebar nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + link.dataset.view);
    if (target) target.classList.add('active');

    if (link.dataset.view === 'markets' && !window.terminalLoaded) { loadTerminalCoins(); window.terminalLoaded = true; }
    if (link.dataset.view === 'wealth' && !window.wealthLoaded) { renderWealth(); window.wealthLoaded = true; }
    if (link.dataset.view === 'ai-assistant' && !window.chatGreeted) { appendBubble("Hey Commander, I'm Alpha. What do you need?", 'ai'); window.chatGreeted = true; }
    if (link.dataset.view === 'global' && !window.globalLoaded) { loadGlobal(); window.globalLoaded = true; }
  });
});

/* ---------- Markets terminal ---------- */
let terminalCurrentId = null;
let terminalCurrentRange = '1D';

async function loadTerminalCoins() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1');
    const coins = await res.json();
    document.getElementById('terminal-coin-list').innerHTML = coins.map(c => {
      const up = c.price_change_percentage_24h >= 0;
      return `<div class="coin-row" data-id="${c.id}">
        <div class="coin-left"><img src="${c.image}" alt="${c.symbol}"><div class="coin-name">${c.name} <br><small>${c.symbol.toUpperCase()}</small></div></div>
        <div class="coin-right"><div><div class="price">$${c.current_price.toLocaleString()}</div><div class="${up ? 'up' : 'down'}">${up ? '+' : ''}${c.price_change_percentage_24h?.toFixed(2)}%</div></div></div></div>`;
    }).join('');
    document.querySelectorAll('#terminal-coin-list .coin-row').forEach(row => row.addEventListener('click', () => selectTerminalCoin(row.dataset.id)));
    if (!terminalCurrentId) selectTerminalCoin(coins[0].id);
  } catch (e) { document.getElementById('terminal-coin-list').textContent = 'Failed to load coins.'; }
}

async function selectTerminalCoin(id) { terminalCurrentId = id; terminalCurrentRange = '1D'; await renderTerminalDetail(); }
function daysForRange(range) { return { '1H': 1, '1D': 1, '1W': 7, '1M': 30, '1Y': 365 }[range]; }

async function renderTerminalDetail() {
  const panel = document.getElementById('terminal-detail');
  panel.innerHTML = `<p class="muted">Loading chart...</p>`;
  try {
    const [infoRes, chartRes] = await Promise.all([
      fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${terminalCurrentId}`),
      fetch(`https://api.coingecko.com/api/v3/coins/${terminalCurrentId}/market_chart?vs_currency=usd&days=${daysForRange(terminalCurrentRange)}`)
    ]);
    const info = (await infoRes.json())[0];
    const chart = await chartRes.json();
    let prices = chart.prices.map(p => p[1]);
    if (terminalCurrentRange === '1H') prices = prices.slice(-12);
    const up = info.price_change_percentage_24h >= 0;
    panel.innerHTML = `
      <div class="detail-head"><img src="${info.image}" alt="${info.symbol}"><div>${info.name} <small style="color:var(--muted)">${info.symbol.toUpperCase()}/USD</small></div></div>
      <div class="detail-price">$${info.current_price.toLocaleString()}<span class="${up ? 'up' : 'down'}" style="font-size:14px;">${up ? '+' : ''}${info.price_change_percentage_24h?.toFixed(2)}%</span></div>
      <div class="timeframe-btns">${['1H','1D','1W','1M','1Y'].map(r => `<button data-range="${r}" class="${r === terminalCurrentRange ? 'active' : ''}">${r}</button>`).join('')}</div>
      <div class="big-chart">${bigLine(prices, up ? '#22c55e' : '#ef4444')}</div>`;
    panel.querySelectorAll('.timeframe-btns button').forEach(btn => btn.addEventListener('click', async () => { terminalCurrentRange = btn.dataset.range; await renderTerminalDetail(); }));
  } catch (e) { panel.innerHTML = `<p class="muted">Failed to load chart.</p>`; }
}

let terminalSearchDebounce;
document.getElementById('terminal-search-input')?.addEventListener('input', (e) => {
  clearTimeout(terminalSearchDebounce);
  const q = e.target.value.trim();
  const box = document.getElementById('terminal-search-results');
  if (!q) { box.innerHTML = ''; return; }
  terminalSearchDebounce = setTimeout(async () => {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      box.innerHTML = data.coins.slice(0, 6).map(c => `<div class="search-result-item" data-id="${c.id}"><img src="${c.thumb}" alt="${c.symbol}"> ${c.name} <small style="color:var(--muted)">${c.symbol.toUpperCase()}</small></div>`).join('');
      box.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => { selectTerminalCoin(item.dataset.id); box.innerHTML = ''; document.getElementById('terminal-search-input').value = ''; });
      });
    } catch (e) { /* ignore */ }
  }, 400);
});

/* ---------- Wealth OS (multi-currency) ---------- */
const CATEGORY_COLORS = { Food: '#f59e0b', Transport: '#5b8cff', Shopping: '#a855f7', Bills: '#ef4444', Entertainment: '#ec4899', Income: '#22c55e', Other: '#8b93a7' };
const CATEGORY_ICONS = { Food: 'utensils', Transport: 'car', Shopping: 'shopping-bag', Bills: 'file-text', Entertainment: 'film', Income: 'plus-circle', Other: 'circle' };
const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', PHP: '₱' };

function seedWealthData() {
  if (!localStorage.getItem('ia_accounts')) {
    localStorage.setItem('ia_accounts', JSON.stringify([
      { name: 'Checking', currency: 'USD', balance: 1200 },
      { name: 'Savings', currency: 'EUR', balance: 850 },
      { name: 'Investment', currency: 'GBP', balance: 165 },
      { name: 'Travel Fund', currency: 'JPY', balance: 25000 },
      { name: 'Local Wallet', currency: 'PHP', balance: 3000 },
    ]));
  }
  if (!localStorage.getItem('ia_transactions')) {
    const today = new Date();
    const d = (offset) => new Date(today.getTime() - offset * 86400000).toISOString();
    localStorage.setItem('ia_transactions', JSON.stringify([
      { name: 'Grocery Store', amount: -54.20, category: 'Food', date: d(0) },
      { name: 'Salary', amount: 1800, category: 'Income', date: d(1) },
      { name: 'Gas Station', amount: -32.00, category: 'Transport', date: d(2) },
      { name: 'Netflix', amount: -15.99, category: 'Entertainment', date: d(3) },
      { name: 'Electric Bill', amount: -88.40, category: 'Bills', date: d(4) },
      { name: 'Online Shopping', amount: -64.30, category: 'Shopping', date: d(5) },
    ]));
  }
}
function getWealthData() {
  return { accounts: JSON.parse(localStorage.getItem('ia_accounts') || '[]'), transactions: JSON.parse(localStorage.getItem('ia_transactions') || '[]') };
}

let fxRates = { USD: 1 };
async function fetchFxRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    fxRates = { USD: 1, EUR: data.rates.EUR, GBP: data.rates.GBP, JPY: data.rates.JPY, PHP: data.rates.PHP };
  } catch (e) {
    fxRates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 157, PHP: 58.5 }; // fallback if API unreachable
  }
}
function toUSD(amount, currency) {
  const rate = fxRates[currency] || 1;
  return amount / rate;
}

async function renderWealth() {
  seedWealthData();
  await fetchFxRates();
  const { accounts, transactions } = getWealthData();

  const totalBalance = accounts.reduce((s, a) => s + toUSD(a.balance, a.currency), 0);
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spending = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  document.getElementById('wealth-stats-grid').innerHTML = `
    <div class="card"><div class="card-head"><i data-lucide="dollar-sign"></i> Total Balance</div><div class="value">$${totalBalance.toLocaleString(undefined, {minimumFractionDigits:2})}</div><div class="sub">${accounts.length} accounts, ${new Set(accounts.map(a=>a.currency)).size} currencies</div></div>
    <div class="card"><div class="card-head"><i data-lucide="trending-up"></i> Income</div><div class="value up">$${income.toLocaleString(undefined, {minimumFractionDigits:2})}</div><div class="sub">Recent</div></div>
    <div class="card"><div class="card-head"><i data-lucide="trending-down"></i> Spending</div><div class="value down">$${spending.toLocaleString(undefined, {minimumFractionDigits:2})}</div><div class="sub">Recent</div></div>
  `;

  document.getElementById('accounts-list').innerHTML = accounts.map(a => {
    const sym = CURRENCY_SYMBOLS[a.currency] || '';
    const usdEq = toUSD(a.balance, a.currency);
    return `<div class="account-item">
      <span class="acc-name">${a.name}<small>${a.currency}</small></span>
      <span class="acc-balance">${sym}${a.balance.toLocaleString(undefined,{minimumFractionDigits:2})}<div class="acc-usd">≈ $${usdEq.toLocaleString(undefined,{minimumFractionDigits:2})}</div></span>
    </div>`;
  }).join('');

  document.getElementById('transactions-list').innerHTML = [...transactions].reverse().map(t => {
    const color = CATEGORY_COLORS[t.category] || '#8b93a7';
    const icon = CATEGORY_ICONS[t.category] || 'circle';
    const isIncome = t.amount > 0;
    return `<div class="transaction-row">
      <div class="tx-left"><div class="tx-icon" style="background:${color}22;"><i data-lucide="${icon}" style="color:${color};width:16px;height:16px;"></i></div>
      <div><div class="tx-name">${t.name}</div><div class="tx-date">${new Date(t.date).toLocaleDateString('en-US', {month:'short', day:'numeric'})} · ${t.category}</div></div></div>
      <div class="${isIncome ? 'up' : 'down'}">${isIncome ? '+' : ''}$${Math.abs(t.amount).toLocaleString(undefined,{minimumFractionDigits:2})}</div>
    </div>`;
  }).join('');

  const byCategory = {};
  transactions.filter(t => t.amount < 0).forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount); });
  const total = Object.values(byCategory).reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  const gradientParts = Object.entries(byCategory).map(([cat, val]) => {
    const start = (acc / total) * 360; acc += val; const end = (acc / total) * 360;
    return `${CATEGORY_COLORS[cat] || '#8b93a7'} ${start}deg ${end}deg`;
  });
  const gradient = gradientParts.length ? gradientParts.join(', ') : '#232a3d 0deg 360deg';
  document.getElementById('spending-chart').innerHTML = `
    <div class="donut-wrap"><div class="donut" style="background: conic-gradient(${gradient});"></div>
      <div class="donut-legend">${Object.entries(byCategory).map(([cat, val]) => `<div class="legend-row"><span class="legend-dot" style="background:${CATEGORY_COLORS[cat] || '#8b93a7'}"></span>${cat} — $${val.toFixed(2)}</div>`).join('')}</div>
    </div>`;
  lucide.createIcons();
}

document.getElementById('add-transaction-btn')?.addEventListener('click', () => { document.getElementById('transaction-modal').style.display = 'flex'; });

document.getElementById('add-account-btn')?.addEventListener('click', () => { document.getElementById('account-modal').style.display = 'flex'; });
document.getElementById('acc-cancel')?.addEventListener('click', () => { document.getElementById('account-modal').style.display = 'none'; });
document.getElementById('acc-save')?.addEventListener('click', () => {
  const name = document.getElementById('acc-name').value.trim();
  const currency = document.getElementById('acc-currency').value;
  const balance = parseFloat(document.getElementById('acc-balance').value);
  if (!name || isNaN(balance) || balance < 0) return;
  const { accounts } = getWealthData();
  accounts.push({ name, currency, balance });
  localStorage.setItem('ia_accounts', JSON.stringify(accounts));
  document.getElementById('account-modal').style.display = 'none';
  document.getElementById('acc-name').value = '';
  document.getElementById('acc-balance').value = '';
  renderWealth();
});
document.getElementById('tx-cancel')?.addEventListener('click', () => { document.getElementById('transaction-modal').style.display = 'none'; });
document.getElementById('tx-save')?.addEventListener('click', () => {
  const name = document.getElementById('tx-name').value.trim();
  const amountRaw = parseFloat(document.getElementById('tx-amount').value);
  const type = document.getElementById('tx-type').value;
  const category = document.getElementById('tx-category').value;
  if (!name || isNaN(amountRaw) || amountRaw <= 0) return;
  const amount = type === 'income' ? amountRaw : -amountRaw;
  const { accounts, transactions } = getWealthData();
  transactions.push({ name, amount, category, date: new Date().toISOString() });
  localStorage.setItem('ia_transactions', JSON.stringify(transactions));
  const usdAccount = accounts.find(a => a.currency === 'USD') || accounts[0];
  if (usdAccount) { usdAccount.balance += amount; localStorage.setItem('ia_accounts', JSON.stringify(accounts)); }
  document.getElementById('transaction-modal').style.display = 'none';
  document.getElementById('tx-name').value = ''; document.getElementById('tx-amount').value = '';
  renderWealth();
});

/* ---------- Global (live news + macro + FX) ---------- */
async function loadGlobal() {
  loadMacro();
  loadFx();
  loadStocks();
  loadNews();
}

async function loadMacro() {
  const box = document.getElementById('macro-indicators');
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/global');
    const g = (await res.json()).data;
    const mcap = g.total_market_cap.usd;
    const change = g.market_cap_change_percentage_24h_usd;
    box.innerHTML = `
      <div class="macro-row"><span>Total Crypto Market Cap</span><b>$${(mcap/1e12).toFixed(2)}T</b></div>
      <div class="macro-row"><span>24h Market Cap Change</span><b class="${change >= 0 ? 'up' : 'down'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</b></div>
      <div class="macro-row"><span>BTC Dominance</span><b>${g.market_cap_percentage.btc.toFixed(1)}%</b></div>
      <div class="macro-row"><span>ETH Dominance</span><b>${g.market_cap_percentage.eth.toFixed(1)}%</b></div>
      <div class="macro-row"><span>Active Cryptocurrencies</span><b>${g.active_cryptocurrencies.toLocaleString()}</b></div>
    `;
  } catch (e) { box.textContent = 'Failed to load macro data.'; }
}

async function loadFx() {
  const box = document.getElementById('fx-rates');
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    const show = ['EUR', 'GBP', 'JPY', 'PHP'];
    box.innerHTML = show.map(cur => `
      <div class="fx-row"><span>USD → ${cur}</span><b>${data.rates[cur].toFixed(cur === 'JPY' ? 2 : 4)}</b></div>
    `).join('');
  } catch (e) { box.textContent = 'Failed to load FX rates.'; }
}

const TWELVE_DATA_KEY = 'f499143023f54111b133e9c2f66cc84f';
async function loadStocks() {
  const box = document.getElementById('stock-indices');
  const symbols = [
    { symbol: 'SPY', name: 'S&P 500 (SPY)' },
    { symbol: 'DIA', name: 'Dow Jones (DIA)' },
    { symbol: 'QQQ', name: 'Nasdaq (QQQ)' },
  ];
  try {
    const res = await fetch(`https://api.twelvedata.com/quote?symbol=${symbols.map(s => s.symbol).join(',')}&apikey=${TWELVE_DATA_KEY}`);
    const data = await res.json();
    box.innerHTML = symbols.map(s => {
      const q = symbols.length > 1 ? data[s.symbol] : data;
      if (!q || q.status === 'error') return `<div class="stock-row"><span>${s.name}</span><b class="muted">N/A</b></div>`;
      const change = parseFloat(q.percent_change);
      return `<div class="stock-row"><span>${s.name}</span><b>${parseFloat(q.close).toLocaleString(undefined,{maximumFractionDigits:2})} <span class="${change >= 0 ? 'up' : 'down'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span></b></div>`;
    }).join('');
  } catch (e) { box.textContent = 'Stock data unavailable right now.'; }
}

async function loadNews() {
  const box = document.getElementById('global-news');
  const feeds = [
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
  ];
  try {
    const results = await Promise.all(feeds.map(f =>
      fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}`)
        .then(r => r.json())
        .then(data => (data.items || []).slice(0, 5).map(item => ({ ...item, source: f.source })))
        .catch(() => [])
    ));
    const combined = results.flat().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 10);
    if (!combined.length) { box.textContent = 'No news available right now.'; return; }
    box.innerHTML = combined.map(item => `
      <a class="news-item" href="${item.link}" target="_blank" rel="noopener">
        <div class="news-title">${item.title}</div>
        <div class="news-source">${item.source} · ${new Date(item.pubDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</div>
      </a>
    `).join('');
  } catch (e) { box.textContent = 'Failed to load news.'; }
}

/* ---------- AI Assistant (free, GET-based — avoids CORS preflight failures) ---------- */
const AI_SYSTEM_PROMPT = "You are Alpha, the AI assistant inside the Infinity Alpha X dashboard. Be concise and helpful.";
let chatLog = [];

function appendBubble(text, cls) {
  const box = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-bubble ${cls}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}
function appendTyping() {
  const box = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-bubble ai typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  appendBubble(text, 'user');
  chatLog.push(`User: ${text}`);

  const typingEl = appendTyping();
  try {
    const contextBlock = chatLog.slice(-6).join('\n');
    const prompt = `${AI_SYSTEM_PROMPT}\n\n${contextBlock}\nAlpha:`;
    const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`);
    let reply = (await res.text()).trim();
    if (!reply) reply = "I didn't catch that — try asking again.";
    typingEl.remove();
    appendBubble(reply, 'ai');
    chatLog.push(`Alpha: ${reply}`);
  } catch (e) {
    typingEl.remove();
    appendBubble(`Connection error: ${e.message || 'try again in a moment.'}`, 'ai');
  }
}

document.getElementById('chat-send')?.addEventListener('click', sendChatMessage);
document.getElementById('chat-input')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMessage(); });
