// Live clock
function updateDateTime() {
  const el = document.getElementById('datetime');
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    + ' · ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
updateDateTime();
setInterval(updateDateTime, 60000);

// Stat cards (placeholder data for now)
const stats = [
  { title: 'Wealth OS', value: '$2,340.00' },
  { title: 'Focus', value: '3 Active Tasks' },
  { title: 'System', value: '100%' },
];
document.getElementById('stats-grid').innerHTML = stats.map(s => `
  <div class="card"><h3>${s.title}</h3><div class="value">${s.value}</div></div>
`).join('');

// Live crypto - CoinGecko free API, no key needed
async function loadMarkets() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1');
    const coins = await res.json();
    document.getElementById('markets-list').innerHTML = coins.map(c => `
      <div class="coin-row">
        <span>${c.market_cap_rank}. ${c.name} (${c.symbol.toUpperCase()})</span>
        <span>$${c.current_price.toLocaleString()}
          <span class="${c.price_change_percentage_24h >= 0 ? 'up' : 'down'}">
            ${c.price_change_percentage_24h?.toFixed(2)}%
          </span>
        </span>
      </div>
    `).join('');
  } catch (e) {
    document.getElementById('markets-list').textContent = 'Failed to load markets.';
  }
}
loadMarkets();
setInterval(loadMarkets, 60000);