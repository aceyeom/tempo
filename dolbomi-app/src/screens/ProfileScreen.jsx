// 프로필 — the living Receipt + functional hub (design review).
// "Who I'm becoming": identity → the Gap (현재 vs 전역 목표) → evolution
// roadmap → titles → records, then the functional rows (avatar, settings,
// share, logout). The guardian hero lives on 홈 only — no duplication here.
import { useState } from 'react';
import { Icon } from '../icons';
import { Card, Tag, Btn, SectionHeader } from '../components/ui';
import { useStore } from '../store';
import { evolutionOf, BANDS } from '../components/creature/GuardianCard';
import { StatRow } from '../components/SkillDetail';
import { BadgeCard } from '../components/Badges';
import { ActivityLog } from '../components/ActivityLog';
import { TipBanner } from '../components/Guide';
import { GOAL_TEMPLATES, goalTemplateOf } from '../data';
import { share } from '../util/share';

export function ProfileScreen({ soldier, stats, statMode, onOpen, onOpenOpp, onOpenAvatar, onOpenSettings, onGoRadar }) {
  const titles = useStore((s) => s.titles);
  const equipTitle = useStore((s) => s.equipTitle);
  const catalog = useStore((s) => s.catalog);
  const signOut = useStore((s) => s.signOut);
  const online = useStore((s) => s.online);
  const owned = titles.filter((t) => t.owned).length;
  const evo = evolutionOf(stats);
  const [editingTargets, setEditingTargets] = useState(false);
  const goal = goalTemplateOf(soldier.goal);
  const mineCount = catalog.filter((o) => o.mine).length;

  const fmtDate = (iso) => (iso || '').replaceAll('-', '.');

  return (
    <div className="tm-rise">
      <TipBanner id="profile" icon="trophy" title="이 페이지가 너의 증명서다"
        text="여기 쌓이는 모든 숫자는 네가 실제로 한 일. 전역하는 날, 시간이 헛되지 않았다는 영수증이 된다." />

      {/* identity */}
      <Card pad={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: 'var(--surface2)',
            boxShadow: 'inset 0 0 0 1px var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="mono">
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)' }}>{soldier.rankEn}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>{soldier.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {soldier.rank} · {soldier.branch}{soldier.mos ? ` ${soldier.mos}` : ''} · {soldier.unit}
            </div>
          </div>
          <Tag tone="accent" icon="trophy">{soldier.title}</Tag>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 14, paddingTop: 13, borderTop: '1px solid var(--hair)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, color: 'var(--faint)', fontWeight: 700 }}>전역까지</div>
            <div className="num" style={{ fontSize: 21, fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>D-{soldier.dday}</div>
          </div>
          <div style={{ width: 1, background: 'var(--line)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, color: 'var(--faint)', fontWeight: 700 }}>복무 진행</div>
            <div className="num" style={{ fontSize: 21, fontWeight: 800, marginTop: 2 }}>{Math.round(soldier.served * 100)}%</div>
          </div>
          <div style={{ width: 1, background: 'var(--line)' }} />
          <div style={{ flex: 1.6, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, color: 'var(--faint)', fontWeight: 700 }}>복무 기간</div>
            <div className="mono" style={{ fontSize: 11.5, fontWeight: 700, marginTop: 6, color: 'var(--sub)' }}>
              {fmtDate(soldier.enlistDate)} → {fmtDate(soldier.dischargeDate)}
            </div>
          </div>
        </div>
      </Card>

      {/* the Gap — 현재 나 vs 전역하는 날의 나 */}
      <SectionHeader right={`총 ${evo.total} XP`}
        caption={goal ? `목표: ${goal.ko} · 점선이 전역하는 날의 너` : '점선이 전역하는 날의 너 · 목표를 정해보자'}>
        전역 리시트 · 목표와의 거리
      </SectionHeader>
      <Card pad={18} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingBottom: 6 }}>
          <Radar stats={stats} mode={statMode} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: 'var(--sub)', fontWeight: 600 }}>여섯 능력치 합산</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 2 }}>
              <span className="num" style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.03em', color: 'var(--accent)' }}>{evo.total}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--faint)' }}>XP</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4, lineHeight: 1.4 }}>
              {evo.maxed ? '최종 진화 도달' : <>다음 진화 <b style={{ color: 'var(--ink)' }}>{evo.nextLabel}</b>까지 {100 - evo.pct}% 남음</>}
            </div>
            <button onClick={() => setEditingTargets(true)} className="tm-tap" style={{ marginTop: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 999, fontSize: 11, fontWeight: 800,
              background: 'rgba(var(--accent-rgb),.12)', color: 'var(--accent)', boxShadow: 'inset 0 0 0 1px rgba(var(--accent-rgb),.28)' }}>
              {Icon('replan', { size: 12, color: 'var(--accent)', stroke: 2.2 })}목표 조정
            </button>
          </div>
        </div>
        <div style={{ marginTop: 4 }}>
          {stats.map((s) => <StatRow key={s.key} s={s} mode={statMode} divided={true} onOpenOpp={onOpenOpp} />)}
        </div>
      </Card>

      {/* evolution roadmap — every stage and what it unlocks */}
      <SectionHeader right={`${evo.stage} / ${BANDS.length}단계`} caption="단계가 오를 때마다 보상이 해금돼 · 기능은 절대 잠기지 않아">진화 로드맵</SectionHeader>
      <Card pad="6px 16px" style={{ marginBottom: 18 }}>
        {BANDS.map((b, i) => {
          const reached = evo.total >= b.min;
          const isCur = evo.stage === i + 1;
          return (
            <div key={b.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 0', borderTop: i ? '1px solid var(--hair)' : 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: reached ? 'var(--accent)' : 'var(--surface2)',
                boxShadow: reached ? 'none' : 'inset 0 0 0 1px var(--line)' }}>
                {reached
                  ? Icon('check', { size: 14, color: 'var(--on-accent)', stroke: 2.6 })
                  : <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--faint)' }}>{i + 1}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: reached ? 'var(--ink)' : 'var(--sub)' }}>{b.label}</span>
                  {isCur && <Tag tone="accent" style={{ fontSize: 9, padding: '0 7px' }}>현재</Tag>}
                  <span className="mono" style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--faint)', flexShrink: 0 }}>{b.min} XP</span>
                </div>
                {b.rewards.length > 0 && (
                  <div style={{ fontSize: 11, color: reached ? 'var(--positive)' : 'var(--faint)', marginTop: 2 }}>
                    {reached ? '해금됨' : '해금'}: {b.rewards.join(' · ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Card>

      <SectionHeader right={`${owned} / ${titles.length}`} caption="보유한 칭호를 탭하면 착용 · 임무와 기록이 새겨진 문장">칭호</SectionHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        {titles.map((t) => <BadgeCard key={t.name} t={t} onEquip={() => equipTitle(t.name)} />)}
      </div>

      <SectionHeader caption="이번 달 결산과 최근 활동 기록">기록</SectionHeader>
      <ActivityLog onOpenRecap={() => onOpen('wrapped')} />

      {/* functional hub */}
      <SectionHeader style={{ marginTop: 18 }}>바로가기</SectionHeader>
      <Card pad="4px 6px" style={{ marginBottom: 4 }}>
        <HubRow icon="expand" label="수호신 크게 보기" sub="회전 · 황금화 · 동료" onClick={onOpenAvatar} />
        <HubRow icon="pin" label="내가 등록한 기회" sub={mineCount ? `${mineCount}개 · 기회 레이더 상단에 고정` : '부대 안 대회·일정을 직접 등록'} onClick={onGoRadar} divided />
        <HubRow icon="share" label="이번 달 결산 공유"
          onClick={() => share(`DOLBOMI — ${soldier.name}, 총 ${evo.total} XP · ${evo.label} 단계. 복무를 성장으로 바꾸는 중.`)} divided />
        <HubRow icon="sliders" label="설정" sub="테마 · 팔레트 · 계정" onClick={onOpenSettings} divided />
        {online && <HubRow icon="arrowR" label="로그아웃" onClick={signOut} divided danger />}
      </Card>

      {editingTargets && (
        <TargetEditor stats={stats} goalKey={soldier.goal} onClose={() => setEditingTargets(false)} />
      )}
    </div>
  );
}

function HubRow({ icon, label, sub, onClick, divided, danger }) {
  return (
    <button onClick={onClick} className="tm-tap" style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 10px', background: 'transparent', textAlign: 'left',
      borderTop: divided ? '1px solid var(--hair)' : 'none' }}>
      {Icon(icon, { size: 17, color: danger ? 'var(--danger)' : 'var(--sub)', stroke: 2 })}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: danger ? 'var(--danger)' : 'var(--ink)' }}>{label}</span>
        {sub && <span style={{ display: 'block', fontSize: 11, color: 'var(--faint)', marginTop: 1 }}>{sub}</span>}
      </span>
      {Icon('chevR', { size: 16, color: 'var(--faint)' })}
    </button>
  );
}

// bottom-sheet editor for the discharge-day targets (the Gap's dashed line)
function TargetEditor({ stats, goalKey, onClose }) {
  const setTargets = useStore((s) => s.setTargets);
  const [goal, setGoal] = useState(goalKey || '');
  const [vals, setVals] = useState(() => Object.fromEntries(stats.map((s) => [s.key, s.tgt])));

  const applyTemplate = (g) => { setGoal(g.key); setVals({ ...g.targets }); };
  const save = () => { setTargets(vals, goal || null); onClose(); };

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(6,8,11,.6)', backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'tmFade .2s both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg)', boxShadow: '0 -1px 0 var(--line), 0 -20px 60px rgba(0,0,0,.5)',
        borderRadius: '26px 26px 0 0', padding: '14px 22px 30px', maxHeight: '86%', overflowY: 'auto', animation: 'tmSheet .32s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--line)', margin: '0 auto 16px' }} />
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.02em' }}>전역하는 날의 나</div>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 3 }}>점선 목표를 조정해 · 템플릿으로 시작해도 좋아</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          {GOAL_TEMPLATES.map((g) => {
            const on = goal === g.key;
            return (
              <button key={g.key} onClick={() => applyTemplate(g)} className="tm-tap" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 11px', borderRadius: 12, textAlign: 'left',
                background: on ? 'rgba(var(--accent-rgb),.14)' : 'var(--surface)',
                boxShadow: on ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--line)' }}>
                {Icon(g.icon, { size: 15, color: on ? 'var(--accent)' : 'var(--faint)', stroke: 2 })}
                <span style={{ fontSize: 12, fontWeight: 700, color: on ? 'var(--accent)' : 'var(--ink)' }}>{g.ko}</span>
              </button>
            );
          })}
        </div>
        {stats.map((s) => (
          <div key={s.key} style={{ marginBottom: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>{s.mil}</span>
              <span style={{ fontSize: 10.5, color: 'var(--faint)' }}>{s.real}</span>
              <span className="mono" style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{vals[s.key]}</span>
            </div>
            <input type="range" min={20} max={100} step={5} value={vals[s.key]}
              onChange={(e) => { setVals((v) => ({ ...v, [s.key]: Number(e.target.value) })); setGoal(''); }}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
        ))}
        <div style={{ marginTop: 6 }}>
          <Btn onClick={save}>목표 저장</Btn>
        </div>
      </div>
    </div>
  );
}

function Radar({ stats, mode, size = 132 }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 10;
  const n = stats.length;
  const pt = (i, r) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const poly = (vals) => vals.map((v, i) => pt(i, R * v / 100).join(',')).join(' ');
  const cur = stats.map((s) => s.cur);
  const tgt = stats.map((s) => s.tgt);
  const accent = mode === 'color' ? '#9B8CF5' : 'var(--accent)';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {[0.33, 0.66, 1].map((g, i) => (
        <polygon key={i} points={stats.map((_, idx) => pt(idx, R * g).join(',')).join(' ')} fill="none" stroke="var(--line)" strokeWidth="1" />
      ))}
      {stats.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--hair)" strokeWidth="1" />; })}
      <polygon points={poly(tgt)} fill="var(--track)" stroke="var(--faint)" strokeWidth="1" strokeDasharray="3 3" />
      <polygon points={poly(cur)} fill="rgba(var(--accent-rgb),.16)" stroke={accent} strokeWidth="1.8" />
      {cur.map((v, i) => { const [x, y] = pt(i, R * v / 100); return <circle key={i} cx={x} cy={y} r="2.4" fill={accent} />; })}
    </svg>
  );
}
