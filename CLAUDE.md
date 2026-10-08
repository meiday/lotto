# 로또 번호 추천

과거 당첨번호의 출현 빈도로 가중치를 줘서 번호를 추천하는 정적 웹페이지. 빌드 도구 없이 GitHub Pages로 배포한다.

## 디렉토리 구조

- `/` — 페이지 본체(`index.html`, `style.css`, `app.js`). 빈도 계산과 추출은 모두 브라우저에서 한다.
- `data/` — 역대 당첨번호(`draws.json`). 페이지는 이 파일만 읽는다(동행복권 API는 CORS 때문에 브라우저에서 직접 호출할 수 없다).
- `scripts/` — 동행복권에서 새 회차를 받아 `data/`에 추가하는 Node 스크립트(`node scripts/fetch.mjs`).
- `.github/workflows/` — 매주 토요일 데이터를 갱신하고 Pages에 배포한다. push할 때도 배포한다.
