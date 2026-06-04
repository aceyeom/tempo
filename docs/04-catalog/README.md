# 04 · 기회 카탈로그 (Catalog)

> **상태 박스**
> 우선순위: 빌드 순서 2번(시드 3–5개) → 7번(전체 시딩). 앱을 "쓸 수 있게" 만드는 실체.
> 의존성: 기회 데이터 모델([03](../03-opportunity-engine.md) §3.1), 리퍼럴([06](../06-referral-engine.md)), 출처([appendix](../appendix-sources.md)).
> 미해결 질문(Phase 2 후보): 신규 기회 추가(해/공군 창업대회 등), 각 항목 2026 수치 검증, 군별 자격 매트릭스.

진짜 기회, 진짜 숫자, 진짜 신청 경로. 카테고리별로 파일이 분리되어 있다.

> ⚠️ **모든 ₩/일수/날짜는 카탈로그 DB의 시드값.** 엔진이 `source_url` 에서 `schedule` 과 수치를 갱신하고, 포상휴가 일수는 부대 재량 범위다. 출시 전 각 항목 검증. (→ [10](../10-honesty-notes.md))

---

## 카테고리 파일

| 스탯 | 파일 | 항목 |
|---|---|---|
| 자산력 / Money | [money.md](./money.md) | M1 적금 · M2 자기개발비 · M3 ISA/청약 · **M4 청년미래적금** |
| 숙련도 / Craft | [craft.md](./craft.md) | C1 정보처리산업기사 · C2 컴활 · C3 한국사 · C4 TOEIC · C5 OPIc · C6 워드/ITQ · C7 원격강좌 학점 · C8 군 e-러닝 · C9 국방 국가자격 · **C10 SW·AI(구름)** · **C11 군 운전면허 교환** · **C12 지게차·굴착기** · **C13 고졸 검정고시** |
| 담력 / Edge | [edge.md](./edge.md) | E1 육군창업 · E2 K-스타트업 · E3 공모전/해커톤(+공군 해커톤 실예시) · **E4 해군창업** · **E5 공군창업** · **E6 국방AI 경연** |
| 전투력 / Body | [body.md](./body.md) | B1 체력검정 · B2 사격 · B3 헌혈 |
| 지휘력 / People | [people.md](./people.md) | P1 분대장/포반장 |
| 정신력 / Mind | [mind.md](./mind.md) | MI1 다독왕 · MI2 정신전력 공모전(+국방헬프콜 실예시) |
| 취업 / Post-discharge | [post-discharge.md](./post-discharge.md) | T1 제대군인·청년 취업 · **T2 내일배움카드** · **T3 보훈부 전직지원** (D-90 해금) |

## 항목 작성 규약

각 항목은 가능한 한 다음을 채운다:
- **What** — 한 문단 설명
- **Eligibility** — 군별/계급/선행조건 (셀프 필터용, 수집 안 함)
- **Reward** — 타입드 (휴가 범위 / cert / money / 학점 / résumé / prize)
- **Schedule / Cost / Apply** — D-day 구동, 정부 지원 여부, 정확한 신청처
- **Quest-path** — MVP 퀘스트 경로 (마일스톤·서브퀘스트)
- **Referral** — 제휴 서비스 매핑 (→ [06](../06-referral-engine.md))
- **Source** — `source_url` + 검증일 (→ [appendix](../appendix-sources.md))
