# TEMPO — 제품 스펙 (문서 허브)

> ROK 군 복무기간 자기계발 → 사회 출발선 런처 · 2026년 6월
> 이 `docs/` 트리는 단일 거대 문서(`PRODUCT_OVERVIEW.md`)를 **반복 개발(iterative development)** 과 **AI·개발자 탐색**에 맞게 쪼갠 버전이다. 각 파트는 독립적으로 읽고, 고치고, 구현할 수 있다.

---

## 한 줄 정의

> **TEMPO는 군대의 남는 시간, 공짜 돈, 안 챙긴 혜택을 "사회 출발선의 우위"로 바꾼다 — 모든 병사를 그가 실제로 자격이 되는 진짜 자격증·적금·대회·프로그램으로 라우팅하고, 그 하나하나를 "오늘 밤 5분짜리 다음 한 걸음"으로 쪼개서.**

MVP의 베팅: **기회 엔진(Opportunity Engine)** 이 만들어내는 퀘스트 경로가, 지친 병사가 앱을 열고 *"현실의 승리로 이어지는 작은 다음 한 걸음"* 을 실제로 하게 만들 만큼 좋으면 — 나머지(리텐션·바이럴·매출)는 따라온다.

---

## 문서 지도 (navigation)

| # | 문서 | 무엇을 다루나 |
|---|---|---|
| 00 | [범위 / MVP Scope](./00-scope.md) | 무엇을 지금 만들고, 무엇을 미루나 |
| 01 | [코어 루프 / The Spine](./01-core-loop.md) | 체크인 → 오늘 밤의 3 → 완료 → 보상 → 한 줄 |
| 02 | [스탯 시스템 / Stats](./02-stats.md) | 6스탯 · 레벨링 · The Gap |
| 03 | [기회 엔진 / Opportunity Engine](./03-opportunity-engine.md) | 진행바 · 퀘스트 경로 생성기(Claude API) · 휴가 사다리 |
| 04 | [기회 카탈로그 / Catalog](./04-catalog/README.md) | 실제 기회 DB (카테고리별 파일) |
| 05 | [혜택 허브 / Benefits Hub](./05-benefits-hub.md) | "군인이라서 받는 모든 것" (셀프 필터) |
| 06 | [리퍼럴 엔진 / Referral Engine](./06-referral-engine.md) | MVP 1차 매출 · 2단계 완료 |
| 07 | [월간 결산 / Monthly Recap](./07-monthly-recap.md) | 공유 카드 · 유일한 오가닉 획득 루프 |
| 08 | [데이터 모델 / Data Models](./08-data-models.md) | 빌드 가능한 스키마 모음 |
| 09 | [빌드 순서 / Build Order](./09-build-order.md) | MVP 내부 구현 순서 |
| 10 | [정직성 노트 / Honesty Notes](./10-honesty-notes.md) | 신뢰를 깨지 않기 위한 규칙 |
| — | [출처 / Sources](./appendix-sources.md) | 카탈로그 시드 출처 + 검증일 |

---

## 이 문서를 읽는 법

- **제품/기획자** → `00-scope` → `01-core-loop` → `03-opportunity-engine` 순으로.
- **개발자** → `08-data-models` + 각 파트의 "데이터/로직" 섹션.
- **AI 에이전트** → 작업 대상 파트 파일 하나만 컨텍스트에 올리면 된다. 파일 간 의존은 상단 "의존성" 박스에 명시.
- **카탈로그 시딩 담당** → `04-catalog/` 의 카테고리 파일 + `appendix-sources`.

## 문서 규약 (conventions)

- **언어:** 서술은 한국어 우선. 단, **코드 식별자·JSON 필드명·함수명·enum 값은 영어**로 유지(코드이기 때문).
- **숫자·날짜·금액·휴가 일수는 전부 "시드값"** 이다. 정책은 매년 바뀐다. 각 항목은 `source_url` + 검증일을 보유하고, 엔진이 출처에서 갱신한다.
- **포상휴가는 부대 내규** (지휘관 재량). 일수는 항상 범위로, "부대별 상이" 라벨과 함께. 약속하지 않는다. (→ [10-honesty-notes](./10-honesty-notes.md))
- 각 파트 문서 상단에는 **상태 박스**(구현 우선순위 / 의존성 / 미해결 질문)를 둔다.

---

## 현재 작업 상태

- ✅ **Phase 1** — 단일 문서를 한국어 우선 `docs/` 트리로 재구성 (내용 보존, 신규 리서치 없음).
- 🔄 **Phase 2 (진행 중)** — 웨이브 단위.
  - ✅ Wave 1a: 기회 엔진([03](./03-opportunity-engine.md)) brutal 심화 — 상태머신·AI 계약·검증/리페어·재계획·비용가드·eval. (웹 불필요, Opus)
  - ✅ Wave 1b: 검증된 시드 2개 딥 — 적금(M1)·육군창업대회(E1) (2026 수치 검증·인용·퀘스트 경로).
  - ⏳ Wave 1c: 나머지 시드 3개(정보처리 C1·한국사 C3·TOEIC C4) — **WebSearch 쿼터 소진(리셋 18:40 UTC)으로 인용 검증 대기.**
  - ⏳ Wave 2: 신규 기회 ~20개 breadth (Sonnet 에이전트) — 동일 쿼터 사유로 대기.

> 원본 단일 문서는 루트의 `PRODUCT_OVERVIEW.md` 에 그대로 보존되어 있다(레거시/diff 참고용).
