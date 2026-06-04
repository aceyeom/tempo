# PHASE 2 — 자동 재개 체크리스트 (RESUME)

> 이 파일은 작업용 메모다. WebSearch 쿼터 소진(리셋 **2026-06-04 18:45 UTC 경**)으로 Phase 2의 웹 의존 작업이 일시 중단되었다. 이미 커밋·푸시된 것은 전부 검증/인용 완료. 아래는 리셋 후 마무리할 잔여 작업.
>
> **컨테이너가 재활용되어 세션이 끊겼다면:** 새 세션에서 이 파일을 읽고 그대로 실행하면 된다. 잃은 작업 없음(전부 푸시됨).

## 현황

- ✅ Phase 1: 한국어 우선 `docs/` 재구성
- ✅ 기회 엔진 심화 (`docs/03-opportunity-engine.md`) — 상태머신·AI 계약·검증/리페어·재계획·비용가드·eval·약점/리스크
- ✅ 검증 시드 2개: M1 적금(`docs/04-catalog/money.md`), E1 육군창업대회(`docs/04-catalog/edge.md`)
- ⏳ **잔여(이 파일):** 시드 3개 + 신규 기회 ~20개 (웹 필요)

## 리셋 후 실행 (브랜치: `claude/eloquent-darwin-0174Z`)

### A. 남은 시드 3개 딥 (→ `docs/04-catalog/craft.md`)
M1/E1과 **동일 포맷·깊이**로 작성: What / Eligibility / Reward(worked math) / Schedule / Cost / Apply / Quest-path(마일스톤→S·M·L 사이즈드 서브퀘스트 + xp) / Referral / Source(source_url·verified_at) / **약점·리스크**.
- **C1 · 정보처리산업기사** — 2026 큐넷 시험 일정·필기 과목·실기·합격기준, 국방부 위탁 무료검정 연계.
- **C3 · 한국사능력검정시험** — 2026 회차·심화/기본 급수·시험일·가산점.
- **C4 · TOEIC** — 2026 정기시험·응시료(자기개발비 대상)·휴가는 부대 내규 범위.

### B. 신규 기회 ~20개 breadth (Sonnet 에이전트 4개)
`mkdir -p docs/04-catalog/_inbox` 후 background general-purpose(model **sonnet**) 4개 재실행 → 각자 `_inbox/<theme>.md` 작성:
1. **NX · 국방혁신/창업/SW·AI** → `_inbox/innovation.md` (해군·공군 창업대회, 국방 스타트업 챌린지/K-스타트업, 장병 SW/AI·코딩 교육, 국방 해커톤)
2. **LX · 자격/면허/학습** → `_inbox/skills-licenses.md` (군 운전면허, 인기 기능사 종목, 한국어/국어 자격, 검정고시, 디지털 학습, 무료 어학)
3. **RX · 표창/포상휴가 이벤트** → `_inbox/recognition.md` (국방 제안제도, 군 UCC/사진/웹툰/수기 공모전, 봉사·헌혈 유공, 모범용사 표창, 경연대회)
4. **PX · 금융/복지/전역후** → `_inbox/finance-transition.md` (청년도약계좌, 국가보훈부 전직지원, 내일배움카드, 워크넷/취업박람회, 청년정책, 나라사랑카드 제휴)

에이전트 공통 규칙: 한국어 우선 · 코드 식별자 영어 · 휴가=**부대 내규 범위 "부대별 상이"** · 모든 수치 **시드값 + source_url + verified_at** · 항목별 **약점/리스크** · 공식(.go.kr 등) 출처 우선 · 커밋/푸시·타 파일 수정 금지(자기 inbox 파일만).

### C. 큐레이션 (Opus가 직접)
에이전트 완료 후: 중복 제거, 기존 카탈로그와 충돌 시 조용히 검증값으로 교정(+source_url·verified_at), 적절한 카테고리 파일(`craft/edge/body/mind/people/money/post-discharge.md`, 필요시 신규)로 병합, `_inbox` 정리.

### D. 마무리
- `docs/appendix-sources.md` 에 신규 출처 + 검증일 갱신.
- `docs/README.md` Phase 2 상태 ✅.
- 이 파일(`PHASE2_RESUME.md`) 삭제 또는 "완료" 표기.
- 커밋·푸시(`git push -u origin claude/eloquent-darwin-0174Z`, 실패 시 지수 백오프). **PR 생성 금지.**

원칙(→ `docs/10-honesty-notes.md`): 포상휴가 절대 약속 금지, 데이터 수집 금지, 리퍼럴은 정부 돈 경로 우선.
