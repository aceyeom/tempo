# 03 · 기회 엔진 (Opportunity Engine) — 센터피스

> **상태 박스**
> 우선순위: 빌드 순서 2번. **이게 전부의 베팅.** 경로가 제네릭하면 여기서 멈추고 고친다.
> 의존성: 카탈로그([04](./04-catalog/README.md)), 체크인 컨텍스트([01](./01-core-loop.md)), 스탯([02](./02-stats.md)), 리퍼럴([06](./06-referral-engine.md)), 데이터 모델([08](./08-data-models.md)).
> 미해결 질문: §3.10 참조.

이 파트가 MVP의 심장이다. AI가 *필수적으로* 쓰이는 유일한 곳이고, 빌드 노력이 집중되는 곳. 나머지(루프·스탯·위젯)는 잘 알려진 패턴이지만, **이 엔진이 제네릭하면 제품 전체가 실패한다.**

---

## 3.0 약점 / 리스크 (먼저 솔직하게)

엔진을 짓기 전에 이 베팅의 약점을 직시한다.

1. **"한 번 생성, 캐시" vs 현실의 표류.** 경로를 한 번 만들고 재계획 트리거에만 갱신한다는 설계는 비용엔 좋지만, *조용히 뒤처지는* 다수 사용자(트리거를 안 누르고 그냥 안 함)를 놓친다. → 해결: 페이스 이탈은 **사용자 액션이 아니라 시스템 cron**으로 감지해야 한다(§3.5 페이스 평가는 매일 로컬에서 도는 결정론적 잡, LLM 아님).
2. **"정직한 비현실 판정"의 UX 함정.** `feasibility: "unrealistic"` 를 그대로 보여주면 동기를 꺾는다. 이 청중은 "안 된다"는 말에 앱을 지운다. → 해결: 비현실 판정은 **항상 대안과 함께**(주간 시간 ↑ 또는 다음 사이클 D-day로 리타겟). 빈 거절 금지. (§3.4 출력 규칙)
3. **LLM 환각 = 신뢰 즉사.** 가짜 마감일·없는 시험 회차·틀린 응시료를 생성하면 이 코호트는 즉시 간파하고 떠난다. → 해결: **생성기는 사실(날짜·비용·자격)을 만들지 않는다.** 그건 카탈로그(`Opportunity`)에서 *주입*되고, LLM은 오직 *학습 스케줄링*만 한다. LLM 출력의 날짜는 카탈로그 `schedule` 경계 안으로 **하드 클램프**(§3.4 검증/리페어).
4. **포상휴가 과약속.** 휴가 사다리가 가장 강한 hook이자 가장 큰 신뢰 리스크. (→ [10](./10-honesty-notes.md)) 항상 범위 + "부대별 상이".
5. **콜드 스타트 카탈로그.** 시드 3–5개로 시작하면 대부분 사용자에게 "내 관심사 없음" 문제. → 빌드 순서상 감수하되, 온보딩에서 *관심 스탯*을 받아 시드를 거기 집중.
6. **비용 폭주 시나리오.** "재계획 트리거"가 느슨하면(예: 저에너지 3연속이 흔함) 호출이 일일 오픈에 수렴해 단위경제가 깨진다. → §3.6 비용 가드(사용자당 일/주 재계획 상한 + 디바운스).

---

## 3.1 Opportunity란 무엇인가 — 데이터 모델

`Opportunity` 는 **카탈로그가 소유하는 사실(fact)** 이다. 생성기는 이걸 읽지, 쓰지 않는다.

```jsonc
Opportunity {
  id,                           // 안정적 식별자 (예: "C1-info-proc-ind")
  title, category,              // 창업 | 자격증 | 어학 | 학점 | 금융 | 체력 | 봉사 | 취업 | 정신전력
  stat,                         // 먹이는 1차 스탯 (body|mind|money|craft|people|edge)
  what,                         // 한 문단 평이한 설명
  eligibility: {                // 셀프 필터용으로만 표시, 절대 수집/저장 안 함
    군별: ["육","해","공","해병","상근","사복"], 계급?, prerequisites?
  },
  rewards: [                    // 타입드, 복수
    { type: "휴가", days: [2,5], note: "본선 수상자, 부대 내규" },
    { type: "cert" | "money" | "학점" | "résumé" | "prize", value, note? }
  ],
  schedule: {                   // D-day 구동; "live" — source에서 갱신
    deadline?,                  // 단일 마감 (대회·시험 접수)
    windows?: [{open, close}],  // 회차형 (시험 정기 회차)
    frequency?                  // "상시" | "월" | "분기" | "반기" | "연"
  },
  cost: { amount, gov_funded: "자기개발비" | "무료" | null },
  apply_where,                  // 정확한 포털/앱/사이트 (URL)
  partner_service_id,           // → 리퍼럴 엔진(06), nullable
  source_url,                   // 진실의 출처, 신뢰성 + 갱신용
  verified_at,                  // 마지막 검증일 (stale 플래그 구동)
  difficulty,                   // 1–5
  est_total_minutes?            // 목표까지 추정 총 학습량 (feasibility 계산 입력)
}
```

**필드 규약**
- `schedule` 은 `deadline` **또는** `windows` 중 하나를 채운다. 둘 다 없으면 `frequency: "상시"`.
- `verified_at` 이 90일 이상 경과 → 허브/바에 ⚠️ stale 배지(→ [05](./05-benefits-hub.md), [10](./10-honesty-notes.md)).
- `rewards[].days` 는 **항상 `[min,max]` 범위.** 단일 숫자 금지(휴가 과약속 방지).

**`UserOpportunity` 생명주기(status)**
`browsing` → `committed`(경로 생성됨) → `active` → (`at_risk`) → `completed` | `abandoned`(30일 무활동) | `expired`(마감 경과).

---

## 3.2 상세 진행바 — 상태 머신 + 페이싱 수학

진행바는 D-day 다음으로 가장 많이 보는 객체다. AI가 생성한 경로(§3.4)를 렌더한다.

**Fill 계산 (노력 가중)**
```
fill_pct = Σ(완료 서브퀘스트 effort) / Σ(전체 서브퀘스트 effort)
effort(size) = { S:1, M:3, L:6 }      // 분 단위 비례 근사
```
단순 개수가 아니라 effort로 가중 → "쉬운 것만 쳐내고 안 찬 척" 방지.

**페이싱 마커 (`expected_pct`)**
생성기의 `pace_plan: [{date, expected_pct}]` 을 오늘 날짜로 선형 보간:
```
expected_today = lerp(pace_plan, today)
drift = fill_pct - expected_today        // 음수면 뒤처짐
```

**상태 머신 (drift 기반, 결정론적 — LLM 아님)**

| 상태 | 조건 | UI | 행동 |
|---|---|---|---|
| 🟢 on_track | `drift ≥ -0.05` | 초록 바 | 없음 |
| 🟡 tight | `-0.20 ≤ drift < -0.05` 또는 `days_remaining < 필요분/주간가용` | 노랑 + "조금 밀렸어" | 재계획 버튼 노출, 부드러운 넛지 |
| 🔴 at_risk | `drift < -0.20` 또는 마감까지 잔여 effort 불가 | 빨강 + 카운트다운 | 재계획 트리거(§3.5), 우선 에스컬레이션 |

> 임계값(−0.05 / −0.20)은 시드값. 실데이터로 튜닝(§3.10).

**그 외 바 요소**
- **마일스톤 핍** — 바 위 점, 탭하면 서브퀘스트 펼침.
- **보상은 결승선에 고정** — 휴가 범위 / 자격증 / 상금이 끝에 항상 보인다.
- **재계획 버튼** — 🟡/🔴 일 때만.
- **서비스 점프** — `service_link` 보유 서브퀘스트는 제휴 앱 딥링크(→ [06](./06-referral-engine.md)), 2단계 완료로 복귀.

## 3.3 오늘 밤의 3 — 결정론적 선택 (LLM 호출 없음)

야간 픽은 **캐시된 `next_3` 후보 풀**에서 에너지로 필터하는 순수 함수다. (→ [01](./01-core-loop.md) §1.2)

```
pickTonight(user, date):
  energy = checkin(date).energy
  pool = ∪ active UserOpportunity.path.next_3  +  standing_habit_quests
  sizeFilter = { low:[S], mid:[S,M], high:[S,M,L] }[energy]
  candidates = pool.filter(q => q.size ∈ sizeFilter)

  // 우선순위 점수 (높을수록 먼저)
  score(q) =  3 * (q.opportunity.state == 🔴)        // 위험 기회 먼저
            + 2 * (q.opportunity.deadline_proximity) // 마감 임박
            + 1 * (q.stat == user.가장_뒤처진_stat)   // The Gap 좁히기
            + 0.5 * isEdgeAvoided(q)                  // 담력 회피분 (희소 XP)
  pick = top 3 by score, 단 한 기회에서 최대 2개(다양성)
  if energy == high: ensure ≥1 L from the 🔴/lagging opportunity (에스컬레이션)
  if pool 부족: standing habit로 채움 (절대 빈 밤 없음)
```

핵심 불변식: **low 에너지 밤에는 절대 M/L이 나오지 않는다.** 이 한 규칙이 이탈 방지의 핵심(→ [01](./01-core-loop.md) §1.2).

## 3.4 퀘스트 경로 생성기 — Claude API의 일

API가 필수인 유일한 자리이자, 빌드 노력이 집중되는 곳. **생성기는 사실을 만들지 않는다. 학습을 스케줄링한다.**

### 모델 라우팅
- **기본:** `claude-sonnet` 급 (호출은 §3.6처럼 bounded).
- **에스컬레이션:** 고위험·고복잡 기회의 *최초 계획* 만 더 강한 모델 (예: 창업대회 E1, 학점취득 C7처럼 다단계·팀·마감 빡센 것). 재계획은 항상 기본 모델.
- 라우팅 키: `Opportunity.difficulty ≥ 4 && status==committed(first plan)` → 강한 모델.

### 시스템 프롬프트 (계약, sketch)
> 너는 가용 시간이 적은 ROK 병사를 위한 **학습 스케줄링** 엔진이다. 아래 `opportunity` 의 사실(날짜·비용·자격·보상)은 **이미 검증된 입력이다 — 절대 새 사실을 지어내지 마라.** 너의 일은 그 목표까지 사다리처럼 이어지는, 날짜가 박힌 현실적 학습 경로를 짜는 것뿐이다. 퀘스트는 원자적이고 에너지 사이즈여야 한다(S ≤5분 / M ~20분 / L ~45분). 모든 `target_date` 는 `opportunity.schedule` 경계 안이어야 한다. 병사의 `recent_completion_rate` 와 `weekly_minutes_available` 에 근거해 주당 분량을 정하라 — 지친 병사가 튕겨낼 스케줄은 금지. 마감이 실제 페이스로 불가능하면 `feasibility:"unrealistic"` 로 표시하되 **반드시** `feasibility_note` 에 구체적 대안(주간 분 ↑ 또는 다음 회차 D-day)을 담아라. **JSON만** 출력, 산문·인사·마크다운 금지.

### 입력 번들
```jsonc
{ opportunity,                       // 카탈로그 사실 (3.1)
  days_remaining,                    // 호스트가 schedule에서 계산해 주입
  goal_text,
  current_level,                     // 해당 stat 레벨
  weekly_minutes_available,          // 온보딩 + 체크인에서 추정
  recent_completion_rate_7d, recent_completion_rate_14d,
  // 재계획 시에만:
  completed_subquests?, actual_pace?, prior_path_id? }
```

### 출력 스키마 (바에 그대로 파싱)
```jsonc
{
  milestones: [ { id, title, target_date, why } ],
  subquests:  [ { id, milestone_id, text, size:"S"|"M"|"L", xp, stat,
                  service_link?: partner_service_id, target_date } ],
  pace_plan:  [ { date, expected_pct } ],          // → 페이싱 마커 (단조 증가, 끝=100)
  feasibility: "on_track" | "tight" | "unrealistic",
  feasibility_note,                                 // tight/unrealistic 시 대안 포함(필수)
  next_3: [subquest_id, subquest_id, subquest_id]   // 오늘 밤 후보(앞쪽 마일스톤에서)
}
```

### 검증 / 리페어 (LLM 출력은 신뢰하되 검증)
파싱 후 호스트가 **결정론적으로** 교정한다 — 환각 차단의 핵심:
1. **날짜 클램프** — 모든 `target_date` 를 `opportunity.schedule` 경계로 클램프. 마감 후 날짜는 마감 전날로 당김.
2. **XP 재계산** — `xp` 는 LLM이 아니라 호스트가 `size`로 결정(S=10·M=25·L=60, 기회 보너스 ×1.5). LLM 값은 버림. (→ [02](./02-stats.md) §2.2)
3. **pace_plan 정규화** — 단조 증가·끝 100% 강제, 아니면 선형 재생성.
4. **참조 무결성** — `next_3` / `milestone_id` 가 실제 id를 가리키는지. 깨지면 1회 재호출, 또 깨지면 템플릿 폴백.
5. **사실 금지** — 출력에 카탈로그에 없는 URL·금액·마감이 있으면 제거.

### 재계획 트리거 (이벤트 구동, 매 세션 아님)
- 페이스 이탈: 상태가 🔴 진입 (§3.2, **매일 도는 결정론적 잡이 감지** — 사용자 액션 불필요)
- 마감 이동 (카탈로그 `schedule` 갱신)
- 저에너지 체크인 3회 연속 → **난이도 하향 재계획** (마감 유지 불가면 정직하게)
- 사용자가 재계획 탭
- 마일스톤 조기 완료 → 에스컬레이션 재계획

트리거 시 입력 번들 + `completed_subquests` + `actual_pace` 재전송 → 여전히 마감을 맞추도록 재배열, 아니면 진실을 말한다.

### 폴백 (API 실패/타임아웃/예산 초과)
LLM 없이도 **템플릿 경로**로 degrade: 카탈로그가 기회별 `default_path`(고정 마일스톤·서브퀘스트 골격)를 보유 → 개인화는 없지만 앱은 절대 빈 화면을 안 보인다. 시드 5개는 반드시 `default_path` 보유.

## 3.5 페이스 평가 잡 (매일, 로컬, LLM 아님)

§3.0(1)의 "조용히 뒤처짐" 해결. 매일 1회(또는 앱 오픈 시) 각 active `UserOpportunity` 에 대해 §3.2의 `drift`/상태를 재계산하고, 🔴 진입 시에만 재계획을 **큐잉**(디바운스: 같은 기회 72h 내 1회). 순수 산술 — API 호출 0.

## 3.6 비용 모델 + 가드 (단위경제)

- 경로는 **한 번 생성되고 캐시.** API는 재계획에만 발사.
- 야간 픽·페이스 평가는 결정론적(§3.3, §3.5) — **LLM 0.**
- "한 줄"(→ [01](./01-core-loop.md) §1.5)·월간 결산(→ [07](./07-monthly-recap.md))은 싼 배치/템플릿.

**가드(폭주 방지):**
- 사용자당 재계획 **≤ 1/일, ≤ 3/주** (초과분은 다음 윈도우로 큐). 저에너지 연속 트리거는 디바운스.
- 활성 기회 **≤ 5/사용자** (포커스 + 비용).
- 예산 초과 시 §3.4 템플릿 폴백.

**스케일 직관:** 사용자당 월 API 호출 ≈ (활성기회 수 × 평균 재계획 빈도) + 초기 계획. 일일 오픈과 **무관**하게 bounded.

## 3.7 평가(eval) 하니스 — "제네릭하면 멈춘다"를 측정 가능하게

빌드 순서 2번의 게이트(→ [09](./09-build-order.md))를 객관화:
- **골든 셋:** 5개 시드 × 3개 페르소나(저시간/중간/고시간) = 15 케이스. 각 케이스 기대 마일스톤 골격을 사람이 정의.
- **자동 체크:** 스키마 유효 · 날짜 경계 내 · pace 단조 · `next_3` 유효 · S 비율(저에너지 페르소나에서 첫 주 ≥ 80% S).
- **휴먼 루브릭(1–5):** 구체성(부대 용어·실제 포털 단계 반영) · 현실성 · 비-제네릭. **평균 < 4면 출시 보류.**

## 3.8 휴가 사다리 (the hook)

사용자의 자격 기회들에서 `reward.type == "휴가"` 를 전부 하나의 숫자로 집계하는 전용 뷰: **"네가 딸 수 있는 추가 휴가: 최대 N일."**
```
ladder_max = Σ over eligible opps ( reward.days[1] )   // 상한 합
ladder_typical = Σ ( reward.days[0] )                  // 하한 합
표시: "보통 {typical}~{max}일 · 부대별 상이"
```
각 단(rung)은 그 기회 경로로 링크. *"자기계발"* 이 아니라 *"시스템을 이겨 집에 더 있기"* 로 읽히게.

> **정직성 규칙:** 자기계발 포상휴가는 거의 모든 곳에서 **부대 내규**(지휘관 재량)이지 보장된 국가 권리가 아니다. 사다리는 일수를 범위로 표시하고 절대 약속하지 않는다. (→ [10](./10-honesty-notes.md))

## 3.9 텔레메트리 (개인정보 최소)

엔진 품질 측정에 필요한 최소만, 민감정보 0(→ [10](./10-honesty-notes.md)): 경로 생성/재계획 횟수, feasibility 분포, 첫주 완료율, 🔴 진입율, 휴가 사다리 → 기회 진입 전환율. 텍스트 회고·민감 자격은 텔레메트리에 안 들어감.

## 3.10 미해결 질문 (Phase 2/실데이터로 결정)

- drift 임계값(−0.05/−0.20)·재계획 디바운스(72h)·활성기회 상한(5)의 실데이터 튜닝.
- `weekly_minutes_available` 추정 방법(온보딩 질문 vs 체크인 누적 추론).
- 에스컬레이션 모델 라우팅의 실제 비용 임계.
- 경로 캐시 무효화: 카탈로그 `schedule` 갱신이 진행 중 경로에 미치는 영향(자동 재계획 vs 사용자 고지 후).
- 비현실 판정의 카피 톤(동기 유지 A/B).
