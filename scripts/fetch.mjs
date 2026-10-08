// 동행복권에서 아직 없는 회차만 받아 data/draws.json에 추가한다.
import { readFile, writeFile } from 'node:fs/promises';

const API = 'https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do';
const FILE = new URL('../data/draws.json', import.meta.url);
const DELAY_MS = 1000; // 연속 요청 시 차단되므로 간격을 둔다

async function get(params) {
  const res = await fetch(`${API}?${new URLSearchParams(params)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).data.list.map((x) => ({
    r: x.ltEpsd,
    d: x.ltRflYmd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
    n: [x.tm1WnNo, x.tm2WnNo, x.tm3WnNo, x.tm4WnNo, x.tm5WnNo, x.tm6WnNo],
    b: x.bnsWnNo,
  }));
}

async function save() {
  const sorted = [...draws.values()].sort((a, b) => a.r - b.r);
  await writeFile(FILE, `[\n${sorted.map((d) => JSON.stringify(d)).join(',\n')}\n]\n`);
}

const draws = new Map(
  JSON.parse(await readFile(FILE, 'utf8').catch(() => '[]')).map((d) => [d.r, d]),
);
const before = draws.size;

// 'latest'는 커서보다 최신 회차를 최대 10개씩 준다. 데이터가 없으면 1회차 주변부터 시작한다.
let cursor = Math.max(0, ...draws.keys());
let list = cursor
  ? await get({ srchDir: 'latest', srchCursorLtEpsd: cursor })
  : await get({ srchDir: 'center', srchLtEpsd: 1 });

while (list.length) {
  for (const d of list) draws.set(d.r, d);
  await save(); // 중간에 차단돼도 받은 만큼은 남긴다
  cursor = Math.max(...list.map((d) => d.r));
  await new Promise((r) => setTimeout(r, DELAY_MS));
  list = await get({ srchDir: 'latest', srchCursorLtEpsd: cursor });
}

console.log(`${draws.size - before}개 회차 추가 (총 ${draws.size}회)`);
