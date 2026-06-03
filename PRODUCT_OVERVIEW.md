# TEMPO — MVP PRODUCT SPEC
### The complete build doc for the limited MVP feature set
> ROK military self-development → society launchpad · Jun 2026
> This is the **buildable** spec: every MVP feature fully mechanized, every opportunity researched from real government/program sources, every data model laid out. The roadmap doc (PRODUCT.md / v4) is the *why*; this is the *what you actually build*.

---

## THE ONE LINE

> **TEMPO turns the army's idle time, free money, and unclaimed benefits into a head start — by routing every soldier to the real certs, savings, competitions, and programs he's eligible for, and breaking each one into tonight's 5-minute step.**

The MVP bet: if the **Opportunity Engine** produces quest-paths good enough that a tired soldier opens the app and *does the next small thing toward a real-world win*, everything else (retention, virality, revenue) follows. So the MVP is built almost entirely around making that one thing excellent and grounded in a real catalog.

---

## PART 0 — MVP SCOPE

**IN (build now):**
1. The core loop — 60-sec check-in → 오늘 밤의 3 → complete → bars move → one line
2. The 6-stat system + leveling + **The Gap** (target overlay)
3. 전역 D-day + streak
4. The HUD lockscreen widget
5. **The Opportunity Engine** — detailed progress bars powered by the Claude API *(the centerpiece)*
6. **The real Opportunity Catalog** *(Part 4 — the thing that makes it usable)*
7. **The Benefits Hub** — "everything you get just for being a soldier" (self-filter, store nothing)
8. **The Vacation Ladder** — 휴가 aggregation (the hook)
9. **The Referral Engine** — low-commitment quests routed to partner services for a fee
10. The 적금 display — projected discharge balance (simple, not a simulator)
11. Monthly recap (결산)

**The ONE AI job:** context → adaptive quest-path (Part 3.3). No chatbot, no companion persona in the MVP.

**FAST-FOLLOW (v1.1, not MVP):** the Outside-Ally layer (곰신/parent as payer) · the live Receipt (a *view* of MVP data) · the Sunday Letter.

**DEFERRED (post-PMF):** Squad/social · Skill tree · Rival/Mentor · Startup Sidecar.

---

## PART 1 — THE SPINE (core loop, fully mechanized)

### 1.1 The 60-second check-in
Two taps on unlock: **mood** (5-point) + **energy** (low / mid / high). Stored as a daily row `{date, mood, energy}`. This is not analytics decoration — it is the input that **sizes tonight's quests**. Optional one-line journal field (free text) feeds the AI's context window (Part 3.3) but is never required.

### 1.2 오늘 밤의 3
Three quests surfaced for tonight, **selected** (not freshly generated — see cost control 3.3) from the union of: the user's active opportunity paths' `next` sub-quests + standing habit quests. Selection rule by tonight's energy:

| Energy | Quest sizing |
|---|---|
| low | all three are **S** (≤5 min) micro-quests — "앱에서 5분," "한 줄 회고," "물 1L" |
| mid | mix of S/M |
| high | allow one **L**, escalate the lagging opportunity |

The app **never** hands an exhausted soldier a 2-hour quest. This single rule is the anti-churn mechanism.

### 1.3 Complete + animation
One tap = done (honor tap, Part 6.3). A Solo-Leveling-style level-up animation fires on completion — the earned dopamine. Optional flex photo (private by default).

### 1.4 The payoff cluster (what moves on completion)
- the relevant **stat bar** fills (XP, Part 2.2)
- the **opportunity progress bar** advances + its pacing marker updates
- the **streak** ticks (one monthly freeze for forgiveness)
- the **D-day** and **적금** numbers refresh on the widget

### 1.5 The one line
A single non-generic line after the loop, generated cheaply off the day's context (rides the AI pipeline, Part 3.3): e.g. *"3일 연속 숙련도 채웠다. 정보처리 필기까지 D-9, 페이스 좋아."* Specific, tied to a real opportunity, never empty praise.

---

## PART 2 — THE STAT SYSTEM

### 2.1 The six stats (society-mapped)
| In-app name | Real capability | Primary opportunity feed (Part 4) |
|---|---|---|
| 전투력 **Body** | fitness, health | 체력검정, 사격, 헌혈 |
| 정신력 **Mind** | resilience, focus, reading | 다독왕, 정신전력 공모전, 회고 |
| 자산력 **Money** | savings, financial literacy | 적금, 자기개발비, ISA/청약 |
| 숙련도 **Craft** | certs, marketable skills | 국가기술자격, TOEIC, 학점취득, 군 e-러닝 |
| 지휘력 **People** | leadership, communication | 분대장, 멘토링 |
| 담력 **Edge** | courage, initiative | 창업경진대회, 공모전, the avoided thing |

### 2.2 Leveling math (keep it simple)
- Each quest carries `xp` and a primary `stat`. S=10xp, M=25xp, L=60xp; opportunity sub-quests carry a bonus ×1.5 (real-world stakes).
- Stat level = floor(sqrt(totalXP / 100)) — gentle curve, early levels feel fast, later ones earn bragging rights.
- **담력/Edge XP is rarer and worth more** — it only comes from opportunity sub-quests the user has been avoiding (flagged when a path sits untouched 7+ days). This makes the Edge bar the screenshot trophy.

### 2.3 The Gap (target overlay) — nearly free, high impact
At onboarding the soldier sets a discharge target per stat (and names a concrete goal: "정보처리기사 + TOEIC 800 + 적금 만기"). Rendered as a **ghosted second bar** behind each live bar. The shrinking distance converts 뒤처지는 불안 into a number. Build cost ≈ a styling pass on bars already drawn.

---

## PART 3 — THE OPPORTUNITY ENGINE (centerpiece)

### 3.1 What an Opportunity is — data model
```jsonc
Opportunity {
  id, title, category,          // 창업 | 자격증 | 어학 | 학점 | 금융 | 체력 | 봉사 | 취업 | 정신전력
  stat,                         // primary stat it feeds
  what,                         // one-paragraph plain explanation
  eligibility,                  // 군별 / 계급 / prerequisites — shown for SELF-FILTER, never harvested
  rewards: [                    // typed, multiple
    { type: "휴가", days: [2,5], note: "본선 수상자, 부대 내규" },
    { type: "cert" | "money" | "학점" | "résumé" | "prize", value }
  ],
  schedule: { deadline, window, frequency },   // drives D-day; "live" — refreshed from source
  cost: { amount, gov_funded: "자기개발비" | "무료" | null },
  apply_where,                  // exact portal/app/site
  partner_service_id,           // → Referral Engine (Part 6), nullable
  source_url,                   // source of truth, for credibility + refresh
  difficulty                    // 1–5
}
```

### 3.2 The detailed progress bar — sub-features
The bar is the most-watched object after the D-day. It renders the AI-generated path (3.3):
- **Fill** = % of sub-quests done, weighted by effort.
- **Pacing marker** — a "you should be here by `{date}`" tick. The gap between marker and fill is the action driver.
- **State** — 🟢 on track / 🟡 tight / 🔴 at risk → triggers a re-plan nudge.
- **Milestone pips** along the bar, tappable to expand sub-quests.
- **Reward pinned to the finish line** — the 휴가 days / cert / prize sits at the end, always visible.
- **Re-plan button** on 🟡/🔴.
- **Service jump** — a sub-quest with a `partner_service_id` deep-links to the partner app (Part 6) and returns to two-tier completion.

### 3.3 The Quest-Path Generator — the Claude API job
This is the only place the API is essential, and where build effort concentrates.

**Model:** `claude-sonnet` class for cost (calls are bounded — see below). Escalate to a stronger model only for the initial plan of a high-stakes opportunity (e.g. 창업대회).

**System prompt (sketch):**
> You are a planning engine for ROK soldiers with limited daily free time. Given a real opportunity, its deadline, and the soldier's current level, available weekly minutes, and recent completion rate, output a realistic, dated quest-path that ladders to the goal. Quests must be atomic and energy-sized (S ≤5min / M ~20min / L ~45min). Be honest: if the deadline is not achievable at the soldier's real pace, say so and propose either more weekly minutes or the next cycle. Output **JSON only**, no prose, matching the schema. Ground the plan in the recent completion rate — never produce a schedule a tired soldier will bounce off.

**Input bundle:**
```jsonc
{ opportunity, days_remaining, goal_text,
  current_level, weekly_minutes_available, recent_completion_rate_7d, recent_completion_rate_14d }
```

**Output schema (parsed straight into the bar):**
```jsonc
{
  milestones: [ { title, target_date, why } ],
  subquests:  [ { milestone_id, text, size: "S"|"M"|"L", xp, stat,
                  service_link?: partner_service_id, target_date } ],
  pace_plan:  [ { date, expected_pct } ],          // → the pacing marker
  feasibility: "on_track" | "tight" | "unrealistic",
  feasibility_note,                                 // honest message if tight/unrealistic
  next_3: [subquest_id, subquest_id, subquest_id]   // tonight's candidates
}
```

**Re-plan triggers (event-driven, NOT every session):** fall past pace threshold · deadline moves · 3+ low-energy check-ins in a row · user taps re-plan · milestone finished early (escalate). On trigger, resend context + `completed_subquests` + `actual_pace` → re-sequence to still hit the deadline, or tell the truth.

**Cost control (critical for unit economics):**
- The path is **generated once and cached.** The API fires only on re-plan triggers.
- The nightly 오늘 밤의 3 pick is a **deterministic selection** from cached `next_3` filtered by energy — *no LLM call.*
- The "one line" (1.5) and Monthly recap copy (Part 7) are cheap templated/batch calls off the same context.
- Net: API spend scales with **re-plans**, not daily opens — bounded and cheap at scale.

### 3.4 The Vacation Ladder (휴가) — the hook
A dedicated view that aggregates every `reward.type == "휴가"` across the user's eligible opportunities into one number: **"네가 딸 수 있는 추가 휴가: 최대 N일."** Each rung links to its opportunity path. This is the surface that converts the cynic — it reads as *"beat the system for more time at home,"* not self-help.
> Honesty rule: self-development 포상휴가 is **부대 내규** (commander's discretion) almost everywhere, not a guaranteed national entitlement. The ladder must label days as ranges ("보통 2~5일, 부대별 상이") and never promise. Over-promising 휴가 to this audience is the fastest way to lose trust.

---

## PART 4 — THE OPPORTUNITY CATALOG (researched, fully built out)

Real opportunities, real numbers, real application paths. **All ₩/일수/dates are seed values for the catalog DB; the engine refreshes `schedule` and figures from `source_url`, and 포상휴가 days are unit-discretionary ranges.** Verify each before shipping.

### 자산력 / MONEY

**M1 · 장병내일준비적금 (the free-money anchor)**
- *What:* a service savings account where the government **matches 100% of principal** on 2024+ deposits, plus ~5% base interest, tax-free.
- *Eligibility:* 현역병 · 상근예비역 · 의무경찰 · 사회복무요원 · 대체복무요원 (1인, up to 2 accounts at different banks).
- *Reward:* 최대 월 55만원 (은행별 월 30만, 합산 55만). Full 18-month service ≈ **원금 ~990만 + 매칭 ~990만 + 이자 ≈ 약 2,000만원 at 전역.** Must hold to maturity (= 전역일) or matching is forfeit. Tax-free if joined by 2026-12-31.
- *Apply:* bank app (KB·IBK·NH·신한·하나·수협·iM·우체국) — requires 나라사랑카드.
- *Referral:* bank account CPA.
- *Quest-path:* ① 나라사랑카드 확인 ② 적금 개설 ③ 납입한도 55만 상향(앱) ④ 매달 납입 유지 체크 ⑤ 만기 D-day 추적(→ 적금 display).

**M2 · 자기개발비 (the budget nobody fully spends)**
- *What:* the state refunds **80% of self-development spending, up to ₩120,000/year** (you pay 20%).
- *Covers:* 도서(잡지/만화 제외) · 시험 응시료(어학·자격증) · 온/오프라인 강좌 수강료 · 학습용품 · 운동용품(최대 6만) · 문화관람.
- *Eligibility:* 육·해·공·해병·국직·카투사·상근 현역 복무자.
- *Apply:* 나라사랑포털 → 자기개발. 제휴사 = 즉시 차감 / 비제휴사 = 영수증 첨부 후 익월 ~15일 e-머니 환급. **Not retroactive across years — use it annually or lose it.**
- *Quest-path:* ① 올해 잔여 한도 확인 ② 쓸 곳 정하기(응시료/강의) ③ 신청 ④ 환급 확인.

**M3 · 전역 목돈 굴리기 (ISA / 청약) — literacy + warm lead**
- *What:* set up an ISA / 주택청약 account so the ~2,000만 discharge lump has a tax-advantaged home.
- *Reward:* 자산력 XP; warm lead to brokerage at discharge.
- *Referral:* brokerage / bank CPA. *Quest-path:* literacy micro-quests → account open.

### 숙련도 / CRAFT

**C1 · 국가기술자격 — 국방부 위탁 무료검정 (the best ROI)**
- *What:* the military hosts **free** national tech-cert exams — ~21–24 산업기사 종목 (정보처리·자동차정비·위험물·항공 등) and ~60–61 기능사 종목 (조리·지게차/굴착기 운전·정비 등), ~82 total.
- *Reward:* national cert + résumé line + 포상휴가 보통 2~5일 (부대 내규).
- *Cost:* 무료 (위탁검정).
- *Quest-path (정보처리산업기사):* ① 종목 선택 ② 필기 시험일 D-day 등록 ③ 과목별 학습 퀘스트(앱 연계) ④ 필기 응시 ⑤ 실기 준비 ⑥ 실기 응시 ⑦ 휴가 신청.
- *Referral:* cert-prep app/course (often 자기개발비-funded).

**C2 · 컴퓨터활용능력 1급**
- *What:* widely-recognized office cert (필기+실기). *Reward:* 포상휴가 ~2일 + high post-discharge utility. *Referral:* 컴활 강의.

**C3 · 한국사능력검정시험**
- *What:* national history cert, 문과-friendly, low study burden. *Reward:* 포상휴가 흔히 2박3일 + 공무원/공기업 가산점. *Referral:* 한국사 강의.

**C4 · TOEIC 900 (flagship referral example)**
- *What:* the résumé staple. *Reward:* 포상휴가 ~4~5일 (historical, 부대 내규, usually one-time per language) + 취업 필수 스펙.
- *Quest framing (the model):* **"오늘 [TOEIC 앱]에서 30분 공부"** → one honor tap. No "I solved N questions" reporting. The app routes through our partner link; install/subscribe → verified tier + referral fee.
- *Referral:* TOEIC prep app (CPI / subscription rev-share). *Cost:* 응시료 자기개발비-eligible.

**C5 · OPIc / 토익스피킹** — speaking cert, 취업 가산. *Referral:* speaking app.

**C6 · 워드프로세서 / ITQ** — easy entry certs, smaller 휴가, office basics.

**C7 · 대학 원격강좌 학점취득 (graduate sooner)**
- *What:* earn real university credits during service. **학기당 최대 6학점, 연 최대 12학점**, with **80% of tuition refunded** (separate from 자기개발비).
- *Apply:* 나라사랑포털 → 군 e-러닝. 수강신청 opens 18:00; 강의 15–16주, 주 30–40분 2–3편; credits recognized at 복학 as 계절학기 grades. Some units grant 포상휴가.
- *Quest-path:* ① 학번/학사정보 입력 ② 수강신청(개강 2월/9월) ③ e-머니 충전 ④ 주차별 강의 ⑤ 시험/리포트 ⑥ 성적결과확인서 출력(복학 제출).

**C8 · 군 e-러닝 일반강좌** — 8,000+ free/discounted courses (어학·IT·자격증·검정고시) + 전화영어 + 어학 응시료 할인, via 나라사랑포털.

**C9 · 국방 분야 국가자격** — ~14 종 (국방사업관리사·국방보안관리사·국방무인기조종사 등); niche but unique résumé lines.

### 담력 / EDGE

**E1 · 육군창업경진대회 (FLAGSHIP)**
- *What:* the army startup competition; gateway to the national 도전! K-스타트업 pipeline. Real exits exist (e.g. the founder of 링티 won in 2017).
- *Eligibility:* 육군 (장교·부사관·병), **2–5인 팀** (no solo).
- *Reward:* 본선 수상자 → **포상휴가 2~5일 (용사, 부대 내규)** + 상금(대상 ~500만, 총상금 ~2,500만) + 창업멘토링캠프(공가) + 창업지원기관 연계 → 국방 Start-up 챌린지(하반기) → 도전! K-스타트업.
- *Schedule (2026 spring cycle, as a template — verify the live cycle; spring closed 5/27):* 서류접수 2.9–4.10 · 서류발표 4.23 · 본선 5.12–15 중 1일(온라인) · 시상 5.27. 육군 also runs a **하반기** cycle.
- *Apply:* army-startup.co.kr (예선 폼 + 5분 유튜브 영상 → 본선 발표영상 + 온라인 Q&A).
- *Quest-path:* ① 아이디어 한 줄 정리 ② 시장조사 30분 ③ 팀원 1–4명 모으기 ④ 사업모델 1장 ⑤ 5분 발표영상 촬영 ⑥ 유튜브 업로드 + 접수 ⑦ 본선 Q&A 리허설. *(This is the deepest expression of the 휴가 hook: "네 아이디어로 휴가 따자.")*

**E2 · 국방 Start-up 챌린지 / 도전! K-스타트업** — the upper rungs; unlocked after E1 입상.

**E3 · 공모전 / 동아리 대회 입상** — many units grant 포상휴가 for placing in outside competitions (debate, design, hackathons). Generic template path.

### 전투력 / BODY

**B1 · 체력검정 특급/1급 (체력왕)** — improve the three measures (팔굽혀펴기·윗몸일으키기·뜀걸음) → 포상휴가 in many units. *Quest-path:* a measurable training ladder.

**B2 · 사격 특등사수** — top marksmanship → 포상휴가 (event-tied).

**B3 · 헌혈** — some units grant 포상휴가 + counts as 봉사 실적 + health. *Quest:* track 헌혈의집/헌혈버스 dates.

### 지휘력 / PEOPLE

**P1 · 분대장 / 포반장 (+ 교육대 우수수료)** — leadership role grants recognition 포상휴가; finishing 분대장교육대 with honors adds days. *Quest:* prep + 우수수료 target.

### 정신력 / MIND

**MI1 · 다독왕 / 독서** — heavy reading via 병영도서관/진중문고 → 포상휴가 (다독왕) in units that run it. *Quest:* a reading ladder.

**MI2 · 정신전력 / 표어·수기 공모전** — military writing/slogan contests; placing → 포상휴가. *Quest:* draft → submit.

### 취업 / POST-DISCHARGE (unlocks at D-90)

**T1 · 제대군인·청년 취업 연계** — eligibility-filtered programs surfaced near discharge (제대군인 지원, 청년 정책). *Referral:* 취업 플랫폼 / 청년 정책 navigator.

---

## PART 5 — THE BENEFITS HUB ("everything you get just for being a soldier")

### 5.1 Mechanic — self-filter, store nothing
The user picks filters (군별 / 계급 / 관심분야) and eligibility is computed **client-side**. We deliberately **do not** collect 부모 소득, card data, or anything sensitive — that was the v3 trap. Same value, zero stored sensitive data, zero trust cost. Each card → a **"→ make it a quest"** button hands the benefit to the Opportunity Engine (Part 3) to generate a claim-path.

### 5.2 Benefits catalog (real)
| Benefit | What you get | Claim where |
|---|---|---|
| 장병내일준비적금 + 매칭 | ~100% gov match → ~2,000만 at 전역 | bank app + 나라사랑카드 |
| 자기개발비 | 80% back, 최대 12만/yr (응시료·도서·강좌·용품·문화) | 나라사랑포털 → 자기개발 |
| 국가기술자격 무료검정 | ~82 종목 free exams | 국방부 위탁검정 |
| 대학 원격강좌 | 학기당 6 / 연 12학점, 80% 환급 | 나라사랑포털 → 군 e-러닝 |
| 군 e-러닝 강좌 | 8,000+ free/discount (어학·IT·자격증·검정고시) + 전화영어 | 나라사랑포털 |
| 어학 응시료 할인 | discounted TOEIC/etc. | 나라사랑포털 제휴 |
| 나라사랑카드 혜택 | 할인/포인트 | card benefits |
| 제대군인·청년 지원 | 취업·정책 (전역 후) | self-filter → portal |

*(Each benefit carries a `source_url` and a verify-date; the Hub flags anything stale.)*

---

## PART 6 — THE REFERRAL ENGINE (the MVP's primary revenue)

### 6.1 The insight (it also kills the "can't verify effort" problem)
We don't verify *effort*. We route to a partner service and verify the *engagement* (install/signup) — which is both checkable (affiliate attribution) and the thing that pays us. The quest is a low-commitment **action**, not a **report**.

### 6.2 Quest → Service map
| Quest domain | Partner type | Revenue event |
|---|---|---|
| 어학 (TOEIC/OPIc) | language-prep apps | install / subscription |
| 자격증 | cert-prep platforms | course purchase (often 자기개발비-funded) |
| 금융 / 적금 | banks, brokerages | account opened (CPA) |
| 학습 / 학점 | course platforms | enrollment |
| 취업 (D-90) | career platforms | signup |

### 6.3 Two-tier completion
- **Tier 1 — Honor tap (default, zero friction):** "study 30 min" → one tap "완료." Quest points + stat XP. Always available; no one is paywalled.
- **Tier 2 — Verified (optional, higher reward):** reach the service via our link → affiliate **postback** auto-marks the quest **✓ verified** → bonus XP + a **verified badge** (carries to the future Receipt). Screenshot fallback where no attribution exists.
- *Nudge:* verified gives more reward + real credibility, so users self-select into the revenue path without coercion.

### 6.4 Economics
The **attribution postback that confirms the quest is the same event that bills the partner** — one pipe, two outputs (verification + invoice). Models: CPI / CPA / subscription rev-share. Revenue scales with engagement, not headcount — fits the seasonal-cohort business.

### 6.5 Ethics guardrails (this cohort has a fine radar)
1. Only refer services that genuinely help. 2. **Government money first** (자기개발비 / 무료검정) so the soldier spends the army's money, not his own. 3. Transparent partner-link labeling. 4. **The core promise stays free** — a soldier who never taps a referral still gets the full proof of his time.

---

## PART 7 — MONTHLY RECAP (결산)

A shareable card on the 1st of each month, built for KakaoTalk: *"이번 달: 퀘스트 N개 · 숙련도 +X · 적금 +XX만 · 휴가 사다리 +N일 · 다음 목표 D-XX."* Copy generated as a cheap batch call off the same AI pipeline. The MVP's only organic acquisition loop.

---

## PART 8 — DATA MODELS (so it's buildable)

```jsonc
User { id, 군별, enlist_date, discharge_date, goal_text,
       stat_targets: {body,mind,money,craft,people,edge} }

DailyCheckin { user_id, date, mood, energy, journal_line? }

Stat { user_id, key, xp, level }

Opportunity { ...Part 3.1... }              // catalog (shared, seeded from Part 4)

UserOpportunity { user_id, opportunity_id, status,
                  path: <generator output 3.3>, actual_pace, started_at }

Quest { id, user_id, text, size, xp, stat,
        source: "habit" | {opportunity_id, subquest_id},
        partner_service_id?, status, completed_at }

PartnerService { id, name, domain, deep_link_template, attribution_type, payout }

Streak { user_id, count, last_completed, freezes_left }
```

Storage note for any artifact prototype: persist via the app backend; do **not** rely on browser storage.

---

## PART 9 — BUILD ORDER (within the MVP)

1. **Core loop + stats + Gap + D-day/streak + widget** — the shell that proves daily retention.
2. **Quest-Path Generator** (Part 3.3) against **3–5 seeded opportunities** (적금, 정보처리, TOEIC, 한국사, 창업대회). *Test with real soldiers. If paths feel generic, stop and fix this before anything else — it's the whole bet.*
3. **Opportunity bars + Vacation Ladder** wired to the generator.
4. **Benefits Hub** (self-filter) + "make it a quest" handoff.
5. **Referral Engine** (two-tier completion) on the cert/어학/금융 quests.
6. **Monthly recap.**
7. Seed the **full Part 4 catalog**, each with `source_url` + verify-date.

---

## PART 10 — HONESTY NOTES (don't let this break trust)

- **포상휴가 for self-development is 부대 내규**, not a guaranteed national right. Always show day-counts as ranges with "부대별 상이." Never promise.
- **All ₩/일수/dates are seed values.** Policies change yearly (적금 한도, 자기개발비, 매칭 비율, exam schedules, competition dates). The engine refreshes from `source_url`; the catalog carries verify-dates; stale entries are flagged.
- **No data harvesting.** Eligibility is self-filtered client-side. The app stores no income/family/card data.
- **Referrals are labeled**, government-money routes come first, and the core proof is always free.

---

## APPENDIX — SOURCES (catalog seed)
- 장병내일준비적금: mnd.go.kr, mma.go.kr (병무청), KB장병적금 안내
- 자기개발비: korea.kr 정책브리핑, 나라사랑포털
- 국가기술자격 위탁검정 / 대학 원격강좌 / 군 e-러닝: korea.kr, narasarang.or.kr
- 육군창업경진대회 2026: army-startup.co.kr; 국방 Start-up 챌린지 / 도전! K-스타트업: kised.or.kr
- 포상휴가 사례(자격증·다독·체력·분대장 등): 군인휴가규정(law.go.kr), 현역병 휴가(easylaw.go.kr), 커뮤니티/블로그 다수
- *Each catalog entry stores its own `source_url` and last-verified date.*
