# 안정성 규칙

## 데이터 수집

- 옛 API(`common.do?method=getLottoNumber`)는 메인으로 302 리다이렉트된다. 지금은 `/lt645/selectPstLt645InfoNew.do`를 쓴다(`srchDir=latest&srchCursorLtEpsd=N`이면 N회차 이후를 10개씩, `center&srchLtEpsd=1`이면 1~10회차를 준다).
- 연속으로 요청하면 IP가 일시 차단된다(연결 타임아웃). 요청 사이에 1초 간격을 두고, 페이지마다 저장해서 중간에 끊겨도 이어받을 수 있게 한다.
- GitHub Actions 러너(해외 IP)에서도 수집되는지는 아직 확인하지 못했다. 실패하면 로컬에서 실행한 뒤 push한다.

## 추천 로직

- 비복원 가중 추출은 Efraimidis–Spirakis(키 `U^(1/w)` 상위 6개)를 쓴다. 누적합 방식은 `Math.random()`이 0을 반환할 때 경계 처리 버그가 생기기 쉽다.
- 가중치는 `count + 1`(핫)과 `max - count + 1`(콜드)이다. +1은 한 번도 안 나온 번호도 뽑힐 수 있게 하려는 것이다. 빈도에서 보너스 번호는 뺀다.
