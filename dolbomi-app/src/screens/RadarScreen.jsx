import { useMemo, useState } from 'react';
import { Icon } from '../icons';
import { Card, ProgressBar, IconChip } from '../components/ui';
import { STATUS } from '../icons';
import { cats, radarCats } from '../data';
import { useStore } from '../store';
import { TipBanner } from '../components/Guide';
import { VacationScreen } from './VacationScreen';
import { BenefitsScreen } from './BenefitsScreen';

// 기회 tab = three jobs in one place: explore real programs (탐색), track the
// army's reward currency (휴가), and claim what you're owed (혜택). The latter
// two are browse-content, so they live as segments instead of nav tabs.
const SEGMENTS = [
  { key: 'explore', ko: '탐색', icon: 'target' },
  { key: 'vacation', ko: '휴가', icon: 'palm' },
  { key: 'benefits', ko: '혜택', icon: 'shieldGift' },
];

export function RadarScreen({ onOpenOpp, onAddOpp, onMakeQuest, soldier }) {
  const [seg, setSeg] = useState('explore');

  return (
    <div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 16 }}>
        {SEGMENTS.map((s) => {
          const on = seg === s.key;
          return (
            <button key={s.key} onClick={() => setSeg(s.key)} className="tm-tap" style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', borderRadius: 12,
              fontSize: 13, fontWeight: 700, background: on ? 'var(--accent)' : 'var(--surface)',
              color: on ? 'var(--on-accent)' : 'var(--sub)', boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line)' }}>
              {Icon(s.icon, { size: 15, color: on ? 'var(--on-accent)' : 'var(--sub)', stroke: 2 })}{s.ko}
            </button>
          );
        })}
      </div>
      <div key={seg} className="tm-rise">
        {seg === 'explore' && <ExploreList onOpenOpp={onOpenOpp} onAddOpp={onAddOpp} soldier={soldier} />}
        {seg === 'vacation' && <VacationScreen onOpenOpp={onOpenOpp} />}
        {seg === 'benefits' && <BenefitsScreen onMakeQuest={onMakeQuest} soldier={soldier} />}
      </div>
    </div>
  );
}

function ExploreList({ onOpenOpp, onAddOpp, soldier }) {
  const catalog = useStore((s) => s.catalog);
  const storeSoldier = useStore((s) => s.soldier);
  const me = soldier || storeSoldier;
  const [filter, setFilter] = useState('전체');
  const catList = radarCats;
  const interests = useMemo(() => me?.interests || [], [me]);

  // 맞춤 우선: interest-matching first, then by closest (unlocked) deadline —
  // user-created entries always pinned on top so they're easy to find again
  const list = useMemo(() => {
    const matches = (o) => (o.tags || []).some((t) => interests.includes(t));
    return catalog
      .filter((o) => filter === '전체' || o.cat === filter)
      .map((o) => ({ o, m: matches(o) }))
      .sort((a, b) =>
        (b.o.mine === true) - (a.o.mine === true)
        || b.m - a.m
        || (a.o.locked === true) - (b.o.locked === true)
        || a.o.dday - b.o.dday);
  }, [catalog, filter, interests]);

  const urgent = catalog.filter((o) => !o.locked && o.dday <= 14).length;
  const matched = catalog.filter((o) => (o.tags || []).some((t) => interests.includes(t))).length;

  return (
    <div>
      <TipBanner id="radar" icon="target" title="진짜 프로그램, 단계별 경로"
        text="자격증·대회·적금이 단계별 경로로 준비돼 있어. 단계마다 능력치 XP, 인증하면 +50% 보너스. 대회 입상은 포상휴가로 이어진다." />
      <Card pad={15} style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
        <IconChip name="target" tone="accent" size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>너에게 맞는 기회 {catalog.length}개</div>
          <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>
            {interests.length ? <>관심사 일치 <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{matched}개</span> · </> : <>{me?.branch || '육군'} · {me?.rank || '병사'} 기준 · </>}
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{urgent}개 마감 임박</span>
          </div>
        </div>
        <button onClick={onAddOpp} className="tm-tap" aria-label="기회 직접 추가" style={{ border: 'none', cursor: 'pointer', flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '9px 13px', borderRadius: 999,
          background: 'rgba(var(--accent-rgb),.13)', color: 'var(--accent)', fontSize: 12, fontWeight: 800, fontFamily: 'inherit',
          boxShadow: 'inset 0 0 0 1px rgba(var(--accent-rgb),.3)' }}>
          {Icon('plus', { size: 14, color: 'var(--accent)', stroke: 2.4 })}직접 추가
        </button>
      </Card>

      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', margin: '0 -20px 16px', padding: '0 20px 2px' }}>
        {catList.map((c) => {
          const on = filter === c;
          return (
            <button key={c} onClick={() => setFilter(c)} className="tm-tap" style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
              background: on ? 'var(--accent)' : 'var(--surface)', color: on ? 'var(--on-accent)' : 'var(--sub)',
              boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line)' }}>{c}</button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {list.map(({ o, m }) => <OppCard key={o.id} o={o} matched={m} onClick={() => onOpenOpp(o)} />)}
      </div>
    </div>
  );
}

function OppCard({ o, matched, onClick }) {
  const cc = (cats[o.cat] || { c: 'var(--accent)' }).c;
  const st = STATUS[o.status] || STATUS.on;
  const next = o.milestones.flatMap((m) => m.subquests).find((s) => !s.done);
  const urgent = !o.locked && o.dday <= 14;
  const rIcon = o.reward.kind === '휴가' ? 'palm' : o.reward.kind === 'money' ? 'wallet' : o.reward.kind === 'cert' ? 'medal' : 'trophy';
  return (
    <Card onClick={onClick} pad={0} style={{ overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: 128, background: `linear-gradient(120deg, ${cc}30, var(--surface2))` }}>
        <img src={o.img} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,9,11,.22) 0%, rgba(8,9,11,0) 34%, rgba(8,9,11,.52) 66%, rgba(8,9,11,.88) 100%)' }} />
        <div style={{ position: 'absolute', top: 11, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 800, color: '#fff',
            padding: '4px 9px', borderRadius: 999, background: 'rgba(10,11,13,.46)', boxShadow: `inset 0 0 0 1px ${cc}` }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: cc }} />{o.cat}
          </span>
          {o.mine && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 800, color: '#fff', padding: '4px 8px', borderRadius: 999, background: 'rgba(10,11,13,.62)' }}>{Icon('pin', { size: 11, color: '#fff', stroke: 2.2 })}내 등록</span>}
          {!o.mine && matched && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 800, color: '#fff', padding: '4px 8px', borderRadius: 999, background: 'rgba(var(--positive-rgb),.88)' }}>{Icon('heart', { size: 11, color: '#fff', stroke: 2.2 })}맞춤</span>}
          {!o.mine && !matched && o.hot && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 800, color: '#fff', padding: '4px 8px', borderRadius: 999, background: 'rgba(var(--accent-rgb),.92)' }}>{Icon('flame', { size: 11, color: '#fff', stroke: 2.4 })}주목</span>}
          {o.locked ? (
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: '#fff',
              padding: '4px 9px', borderRadius: 999, background: 'rgba(10,11,13,.62)' }}>
              {Icon('shield', { size: 11, color: '#fff', stroke: 2.2 })}D-{o.unlockDday} 해금
            </span>
          ) : (
            <span className="mono" style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: '#fff',
              padding: '4px 9px', borderRadius: 999, background: urgent ? 'rgba(var(--accent-rgb),.94)' : 'rgba(10,11,13,.52)' }}>D-{o.dday}</span>
          )}
        </div>
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
          <div style={{ fontSize: 17.5, fontWeight: 800, letterSpacing: '-.02em', color: '#fff', textShadow: '0 1px 14px rgba(0,0,0,.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 800, color: '#fff', padding: '3px 9px', borderRadius: 999, background: 'rgba(var(--accent-rgb),.94)' }}>
              {Icon(rIcon, { size: 12.5, color: '#fff', stroke: 2.2 })}{o.reward.finish}
            </span>
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.72)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{o.sub}</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '13px 15px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: st.c, flexShrink: 0, boxShadow: `0 0 7px ${st.c}` }} />
          <div style={{ flex: 1 }}><ProgressBar pct={o.fill} height={7} color={st.c} marker={o.expectedPct} /></div>
          <span className="num" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--sub)', flexShrink: 0 }}>{o.fill}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 11 }}>
          <span style={{ fontSize: 11.5, color: 'var(--faint)', flexShrink: 0 }}>다음</span>
          <span style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{next ? next.text : '완료됨 🎉'}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>경로 {Icon('chevR', { size: 13, color: 'var(--accent)' })}</span>
        </div>
      </div>
    </Card>
  );
}
