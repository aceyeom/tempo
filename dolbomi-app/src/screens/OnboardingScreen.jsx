// Onboarding wizard — runs once after signup (and again for accounts that are
// missing profile fields). One decision per step, progress dots on top:
//   1) 이름·군별  2) 계급·병과·부대  3) 복무 기간  4) 관심사  5) 전역 목표  6) 수호신
// What it collects drives everything personal: D-day math, base-local benefit
// filters, the interest tags that customize tonight's quests + the radar, and
// the goal-template targets that draw the Gap on the profile Receipt.
import { useMemo, useState } from 'react';
import { Icon } from '../icons';
import { Btn } from '../components/ui';
import { RANKS, BRANCH_INFO, BRANCHES, INTERESTS, GOAL_TEMPLATES } from '../data';
import { CREATURE_PATHS } from '../components/creature/CreatureHero';

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: 12, border: 'none',
  background: 'var(--surface2)', boxShadow: 'inset 0 0 0 1px var(--line)', color: 'var(--ink)',
  fontSize: 14.5, fontFamily: 'inherit', outline: 'none',
};

function Label({ children, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 2px 8px' }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--sub)', letterSpacing: '.02em' }}>{children}</span>
      {hint && <span style={{ fontSize: 10.5, color: 'var(--faint)' }}>{hint}</span>}
    </div>
  );
}

function Chip({ on, onClick, children, grow = true }) {
  return (
    <button type="button" onClick={onClick} className="tm-tap" style={{ flex: grow ? '1 0 auto' : '0 0 auto', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      padding: '10px 13px', borderRadius: 11, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
      background: on ? 'rgba(var(--accent-rgb),.15)' : 'var(--surface)', color: on ? 'var(--accent)' : 'var(--sub)',
      boxShadow: on ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--line)' }}>{children}</button>
  );
}

const GUARDIAN_TINT = { haechi: '#d83a32', dragon: '#2f73d6' };
const GUARDIAN_LINE = {
  haechi: '정의의 수호수. 흔들리지 않는 균형과 꾸준함의 길.',
  dragon: '동방의 수호룡. 높이 비상하는 도전과 기개의 길.',
};

const addMonths = (iso, n) => {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
};

const STEPS = ['기본', '소속', '복무', '관심사', '목표', '수호신'];

export function OnboardingScreen({ soldier, onComplete }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState(soldier?.name && soldier.name !== '병사' ? soldier.name : '');
  const [branch, setBranch] = useState(soldier?.branch || '육군');
  const [rank, setRank] = useState(soldier?.rank || '이병');
  const [mos, setMos] = useState(soldier?.mos || '');
  const [unitPick, setUnitPick] = useState(soldier?.unit && soldier.unit !== '미지정' ? soldier.unit : '');
  const [unitCustom, setUnitCustom] = useState('');
  const [enlist, setEnlist] = useState(soldier?.enlistDate || '');
  const [discharge, setDischarge] = useState(soldier?.dischargeDate || '');
  const [dischargeTouched, setDischargeTouched] = useState(!!soldier?.dischargeDate);
  const [interests, setInterests] = useState(soldier?.interests || []);
  const [goal, setGoal] = useState(soldier?.goal || null);
  const [path, setPath] = useState(soldier?.path === 'dragon' ? 'dragon' : 'haechi');

  const info = BRANCH_INFO[branch] || BRANCH_INFO['육군'];
  const customUnit = unitPick === '__custom__';
  const unit = customUnit ? unitCustom.trim() : unitPick;

  const setEnlistAuto = (v) => {
    setEnlist(v);
    if (!dischargeTouched && v) setDischarge(addMonths(v, info.serviceMonths));
  };
  const pickBranch = (b) => {
    setBranch(b);
    setMos(''); setUnitPick(''); // unit + 병과 are branch-specific
    if (!dischargeTouched && enlist) setDischarge(addMonths(enlist, (BRANCH_INFO[b] || info).serviceMonths));
  };
  const toggleInterest = (key) => {
    setInterests((cur) => cur.includes(key) ? cur.filter((k) => k !== key) : cur.length >= 5 ? cur : [...cur, key]);
  };

  const dday = useMemo(() => {
    if (!discharge) return null;
    const n = Math.round((new Date(discharge + 'T00:00:00') - new Date(new Date().toDateString())) / 86400000);
    return Number.isNaN(n) ? null : n;
  }, [discharge]);

  const valid = [
    name.trim().length > 0,
    rank && mos && unit,
    enlist && discharge && discharge > enlist,
    interests.length >= 1,
    !!goal,
    path === 'haechi' || path === 'dragon',
  ][step];

  const next = async () => {
    if (!valid || busy) return;
    if (step < STEPS.length - 1) { setStep(step + 1); return; }
    setBusy(true);
    const rankEn = (RANKS.find((r) => r.ko === rank) || {}).en || 'PVT';
    const tpl = GOAL_TEMPLATES.find((g) => g.key === goal);
    await onComplete({
      name: name.trim(), branch, rank, rankEn, mos, unit,
      enlistDate: enlist, dischargeDate: discharge, interests, path,
      goal, targets: tpl ? tpl.targets : undefined,
    });
    setBusy(false);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* header: back + progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px 6px' }}>
        <button onClick={() => step > 0 && setStep(step - 1)} className="tm-tap" aria-label="이전"
          style={{ width: 36, height: 36, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', visibility: step > 0 ? 'visible' : 'hidden',
            background: 'var(--surface)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          {Icon('back', { size: 18, color: 'var(--ink)' })}
        </button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 7 }}>
          {STEPS.map((s, i) => (
            <span key={s} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 999, transition: 'all .3s cubic-bezier(.2,.8,.2,1)',
              background: i <= step ? 'var(--accent)' : 'var(--line)' }} />
          ))}
        </div>
        <div style={{ width: 36, flexShrink: 0 }} />
      </div>

      <div key={step} className="tm-rise" style={{ flex: 1, overflowY: 'auto', padding: '14px 24px 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', color: 'var(--accent)', marginBottom: 6 }}>
          {step + 1} / {STEPS.length} · {STEPS[step]}
        </div>

        {step === 0 && (
          <>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.25 }}>먼저, 너를 알려줘</h1>
            <p style={{ fontSize: 13, color: 'var(--sub)', margin: '7px 0 24px', lineHeight: 1.5 }}>복무를 성장으로 바꾸는 첫 단계. 1분이면 끝난다.</p>
            <Label>이름 / 콜사인</Label>
            <input style={{ ...inputStyle, marginBottom: 22 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="김도현" autoFocus />
            <Label>군별</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {BRANCHES.map((b) => {
                const on = branch === b;
                return (
                  <button key={b} type="button" onClick={() => pickBranch(b)} className="tm-tap" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    padding: '16px 14px', borderRadius: 14, textAlign: 'left',
                    background: on ? 'rgba(var(--accent-rgb),.14)' : 'var(--surface)',
                    boxShadow: on ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--line)' }}>
                    <span style={{ display: 'block', fontSize: 15.5, fontWeight: 800, color: on ? 'var(--accent)' : 'var(--ink)' }}>{b}</span>
                    <span style={{ display: 'block', fontSize: 10.5, color: 'var(--faint)', marginTop: 3 }}>복무 {BRANCH_INFO[b].serviceMonths}개월</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.25 }}>{branch}, 어디서 복무해?</h1>
            <p style={{ fontSize: 13, color: 'var(--sub)', margin: '7px 0 24px', lineHeight: 1.5 }}>부대에 맞는 혜택과 일정이 추천된다.</p>
            <Label>계급</Label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
              {RANKS.map((r) => <Chip key={r.ko} on={rank === r.ko} onClick={() => setRank(r.ko)}>{r.ko}</Chip>)}
            </div>
            <Label>병과</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 22 }}>
              {info.mos.map((m) => <Chip key={m} grow={false} on={mos === m} onClick={() => setMos(m)}>{m}</Chip>)}
            </div>
            <Label hint="없으면 직접 입력">소속 부대</Label>
            <div style={{ position: 'relative', marginBottom: customUnit ? 10 : 0 }}>
              <select value={unitPick} onChange={(e) => setUnitPick(e.target.value)}
                style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', color: unitPick ? 'var(--ink)' : 'var(--faint)' }}>
                <option value="" disabled>부대를 선택해줘</option>
                {info.units.map((u) => <option key={u} value={u}>{u}</option>)}
                <option value="__custom__">직접 입력…</option>
              </select>
              <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                {Icon('chevD', { size: 16, color: 'var(--faint)', stroke: 2 })}
              </span>
            </div>
            {customUnit && (
              <input style={inputStyle} value={unitCustom} onChange={(e) => setUnitCustom(e.target.value)} placeholder="예) 제32보병사단" autoFocus />
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.25 }}>복무 기간</h1>
            <p style={{ fontSize: 13, color: 'var(--sub)', margin: '7px 0 24px', lineHeight: 1.5 }}>D-day와 모든 마감 계산의 기준이 된다.</p>
            <Label>입대일</Label>
            <input type="date" style={{ ...inputStyle, marginBottom: 22 }} value={enlist} onChange={(e) => setEnlistAuto(e.target.value)} />
            <Label hint={`${branch} 기준 ${info.serviceMonths}개월로 자동 계산`}>전역 예정일</Label>
            <input type="date" style={inputStyle} value={discharge}
              onChange={(e) => { setDischarge(e.target.value); setDischargeTouched(true); }} />
            {dday != null && discharge > enlist && (
              <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 14, background: 'rgba(var(--accent-rgb),.1)',
                boxShadow: 'inset 0 0 0 1px rgba(var(--accent-rgb),.26)', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="num" style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-.03em' }}>D-{Math.max(0, dday)}</span>
                <span style={{ fontSize: 12, color: 'var(--sub)' }}>남은 하루하루를 성장으로 바꾸자.</span>
              </div>
            )}
            {enlist && discharge && discharge <= enlist && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--danger, #e05252)' }}>전역일은 입대일보다 뒤여야 해.</div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.25 }}>뭘 키우고 싶어?</h1>
            <p style={{ fontSize: 13, color: 'var(--sub)', margin: '7px 0 24px', lineHeight: 1.5 }}>
              고른 관심사에 맞춰 <b style={{ color: 'var(--ink)' }}>오늘 밤의 퀘스트</b>와 <b style={{ color: 'var(--ink)' }}>기회 추천</b>이 맞춤된다. 1~5개.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {INTERESTS.map((it) => {
                const on = interests.includes(it.key);
                return (
                  <button key={it.key} type="button" onClick={() => toggleInterest(it.key)} className="tm-tap" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 9, padding: '13px 13px', borderRadius: 13, textAlign: 'left',
                    background: on ? 'rgba(var(--accent-rgb),.14)' : 'var(--surface)',
                    boxShadow: on ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--line)' }}>
                    {Icon(it.icon, { size: 16, color: on ? 'var(--accent)' : 'var(--faint)', stroke: 1.9 })}
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: on ? 'var(--accent)' : 'var(--ink)' }}>{it.ko}</span>
                    {on && <span style={{ marginLeft: 'auto' }}>{Icon('check', { size: 14, color: 'var(--accent)', stroke: 2.6 })}</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--faint)', textAlign: 'center' }}>{interests.length} / 5 선택됨</div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.25 }}>전역하는 날, 누구로 나갈래?</h1>
            <p style={{ fontSize: 13, color: 'var(--sub)', margin: '7px 0 24px', lineHeight: 1.5 }}>
              여섯 능력치의 <b style={{ color: 'var(--ink)' }}>전역 목표</b>가 정해진다. 매일 그 목표와의 거리가 줄어드는 걸 보게 돼. 나중에 언제든 조정 가능.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GOAL_TEMPLATES.map((g) => {
                const on = goal === g.key;
                return (
                  <button key={g.key} type="button" onClick={() => setGoal(g.key)} className="tm-tap" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 12, padding: '15px 14px', borderRadius: 15, textAlign: 'left',
                    background: on ? 'rgba(var(--accent-rgb),.14)' : 'var(--surface)',
                    boxShadow: on ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--line)' }}>
                    <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: on ? 'rgba(var(--accent-rgb),.16)' : 'var(--surface2)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                      {Icon(g.icon, { size: 19, color: on ? 'var(--accent)' : 'var(--faint)', stroke: 1.9 })}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800, color: on ? 'var(--accent)' : 'var(--ink)' }}>{g.ko}</span>
                      <span style={{ display: 'block', fontSize: 11.5, color: 'var(--sub)', marginTop: 3, lineHeight: 1.4 }}>{g.desc}</span>
                    </span>
                    {on && Icon('check', { size: 17, color: 'var(--accent)', stroke: 2.4 })}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.25 }}>너의 수호신</h1>
            <p style={{ fontSize: 13, color: 'var(--sub)', margin: '7px 0 24px', lineHeight: 1.5 }}>
              네가 성장할수록 수호신의 대리석 몸이 <b style={{ color: '#c99a2e' }}>발끝부터 황금</b>으로 물든다.
              신중하게 골라 — <b style={{ color: 'var(--ink)' }}>전역까지 함께</b>하고, 남은 하나는 성체 단계에 동료로 해금된다.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {CREATURE_PATHS.map((p) => {
                const on = path === p.key;
                const tint = GUARDIAN_TINT[p.key];
                return (
                  <button key={p.key} type="button" onClick={() => setPath(p.key)} className="tm-tap" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 14, padding: '18px 16px', borderRadius: 16, textAlign: 'left',
                    background: on ? 'rgba(var(--accent-rgb),.12)' : 'var(--surface)',
                    boxShadow: on ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--line)' }}>
                    <span style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${tint}1f`, boxShadow: `inset 0 0 0 1px ${tint}55` }}>
                      <span style={{ width: 14, height: 14, borderRadius: 999, background: tint }} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: on ? 'var(--accent)' : 'var(--ink)' }}>{p.ko}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', color: 'var(--faint)' }}>{p.en}</span>
                      </span>
                      <span style={{ display: 'block', fontSize: 11.5, color: 'var(--sub)', marginTop: 4, lineHeight: 1.45 }}>{GUARDIAN_LINE[p.key]}</span>
                    </span>
                    {on && Icon('check', { size: 18, color: 'var(--accent)', stroke: 2.4 })}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '12px 24px 30px', background: 'linear-gradient(0deg, var(--bg) 70%, transparent)' }}>
        <Btn onClick={next} style={{ opacity: valid && !busy ? 1 : 0.4 }}>
          {busy ? '잠시만…' : step === STEPS.length - 1 ? '시작하기' : '계속'}
        </Btn>
      </div>
    </div>
  );
}
