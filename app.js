const state = { mode: 'hot', range: 0, games: 5 };
let draws = [];

const $meta = document.getElementById('meta');
const $generate = document.getElementById('generate');
const $results = document.getElementById('results');

// 선택한 기간 동안 1~45 각 번호가 나온 횟수 (보너스 제외)
function countFrequency() {
  const recent = state.range ? draws.slice(-state.range) : draws;
  const counts = Array(46).fill(0);
  for (const d of recent) for (const n of d.n) counts[n]++;
  return counts;
}

// 핫: 많이 나온 번호일수록, 콜드: 적게 나온 번호일수록 무겁게. +1은 0회 번호도 뽑힐 수 있게 하기 위함
function weights(counts) {
  const max = Math.max(...counts);
  return counts.map((c) => (state.mode === 'hot' ? c : max - c) + 1);
}

// 가중치 비례로 중복 없이 6개 추출 (Efraimidis–Spirakis: 키 = U^(1/w) 상위 6개)
function pick(w) {
  return w
    .map((wi, n) => ({ n, key: Math.random() ** (1 / wi) }))
    .slice(1)
    .sort((a, b) => b.key - a.key)
    .slice(0, 6)
    .map((x) => x.n)
    .sort((a, b) => a - b);
}

function render(games) {
  $results.innerHTML = games
    .map((nums, i) => `
      <div class="glass game" style="animation-delay:${i * 60}ms">
        <span class="tag">${'ABCDE'[i]}</span>
        <div class="balls">${nums.map((n) => `<span class="ball c${Math.ceil(n / 10)}">${n}</span>`).join('')}</div>
      </div>`)
    .join('');
}

document.querySelectorAll('.segment').forEach((seg) => {
  seg.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === btn));
    const { value } = btn.dataset;
    state[seg.dataset.name] = seg.dataset.name === 'mode' ? value : Number(value);
  });
});

$generate.addEventListener('click', () => {
  const w = weights(countFrequency());
  render(Array.from({ length: state.games }, () => pick(w)));
});

fetch('data/draws.json')
  .then((res) => res.json())
  .then((data) => {
    draws = data;
    const last = draws.at(-1);
    $meta.textContent = `제${last.r}회 (${last.d})까지 ${draws.length}회차 기준`;
    $generate.disabled = false;
  })
  .catch(() => {
    $meta.textContent = '당첨 데이터를 불러오지 못했어요';
  });
