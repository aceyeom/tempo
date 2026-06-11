// 퀘스트 탭 — the daily action surface (design review: Home was overloaded).
// Order is the honest order of the loop:
//   1) check-in (it literally generates tonight's list, so it gates the list)
//   2) 오늘 밤의 퀘스트 — tap to complete; completed quests need a second tap
//      within 3s to un-complete (XP is reclaimed, so no accidental undo)
//   3) 진행 중인 도전 — active opportunity tracks with their next step inline
//   4) 오늘의 기록 — what already landed today
import { useMemo, useState, useRef, useEffect } from 'react';
import { Icon, STAT_C, STATUS } from '../icons';
import { Card, Tag, SectionHeader, ProgressBar } from '../components/ui';
import { TipBanner } from '../components/Guide';
import { seoulToday } from '../data';
import { useStore } from '../store';

export function QuestScreen({ soldier, stats, quests, mood, onToggleQuest, onOpenCheckin, onOpenPlan, onGoRadar }) {
  const catalog = useStore((s) => s.catalog);
  const activity = useStore((s) => s.activity) || [];
  const toggleSubquest = useStore((s) => s.toggleSubquest);
  const online = useStore((s) => s.online);

  // online: compare to the profile's Seoul-day check-in date; offline demo: mood
  const checkedIn = online
    ? soldier.lastCheckinDate === seoulToday()
    : !!mood;

  const done = quests.filter((q) => q.done).length;

  const tracks = useMemo(() =>
    (catalog || [])
      .filter((o) => o.started && !o.locked && o.fill < 100)
      .sort((a, b) => a.dday - b.dday)
      .slice(0, 4),
  [catalog]);

  const todayLog = activity.filter((a) => a.day === '오늘' && a.type === 'quest').slice(0, 5);

  return (
    <div className="tm-rise">
      <TipBanner id="quests" icon="moon" title="매일 밤의 리듬"
        text="체크인 → 오늘 밤의 퀘스트 → 능력치 성장. 지친 날엔 퀘스트가 5분짜리로 줄어 — 그것도 1승이야." />

      {checkedIn ? (
        <Card onClick={onOpenCheckin} pad={13} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 21 }}>{mood ? mood.emoji : '✅'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>오늘 체크인 완료{mood ? ` · ${mood.label}` : ''}</div>
            <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 1 }}>컨디션이 바뀌었으면 탭해서 다시 — 퀘스트가 다시 뽑혀</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--positive)', fontWeight: 700, flexShrink: 0 }}>
            {Icon('flame', { size: 13, color: 'var(--positive)', stroke: 2 })}{soldier.streak}일
          </span>
        </Card>
      ) : (
        <Card onClick={onOpenCheckin} glow pad={16} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: 'rgba(var(--accent-rgb),.13)',
            boxShadow: 'inset 0 0 0 1px rgba(var(--accent-rgb),.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon('moon', { size: 21, color: 'var(--accent)', stroke: 1.9 })}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800 }}>60초 체크인으로 시작</div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>오늘 컨디션에 맞춰 밤의 퀘스트가 뽑혀 · 두 번 탭이면 끝</div>
          </div>
          {Icon('chevR', { size: 18, color: 'var(--accent)' })}
        </Card>
      )}

      <SectionHeader right={checkedIn ? `${done} / ${quests.length} 완료` : '체크인 후 공개'}>오늘 밤의 퀘스트</SectionHeader>
      <div style={{ position: 'relative', marginBottom: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, filter: checkedIn ? 'none' : 'blur(5px)', pointerEvents: checkedIn ? 'auto' : 'none' }}>
          {quests.map((q) => <QuestRow key={q.id} q={q} stats={stats} onToggle={() => onToggleQuest(q.id)} />)}
          {quests.length === 0 && (
            <Card pad={16} style={{ textAlign: 'center', color: 'var(--sub)', fontSize: 12.5 }}>체크인하면 오늘의 퀘스트가 도착해</Card>
          )}
        </div>
        {!checkedIn && quests.length > 0 && (
          <button onClick={onOpenCheckin} className="tm-tap" style={{ position: 'absolute', inset: 0, border: 'none', cursor: 'pointer',
            background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 800, color: 'var(--ink)',
              padding: '10px 16px', borderRadius: 999, background: 'var(--surface)', boxShadow: 'inset 0 0 0 1px var(--line), var(--shadow)' }}>
              {Icon('moon', { size: 15, color: 'var(--accent)', stroke: 2 })}체크인하고 오늘의 퀘스트 받기
            </span>
          </button>
        )}
      </div>

      <SectionHeader right={tracks.length ? `${tracks.length}개 진행 중` : null}
        caption="기회 레이더에서 시작한 도전 · 다음 단계를 여기서 바로 끝낼 수 있어">진행 중인 도전</SectionHeader>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
        {tracks.map((o) => <TrackRow key={o.id} o={o} onOpen={() => onOpenPlan(o)} onToggleStep={toggleSubquest} />)}
        {tracks.length === 0 && (
          <Card onClick={onGoRadar} pad={15} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: 'var(--surface2)',
              boxShadow: 'inset 0 0 0 1px var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icon('target', { size: 18, color: 'var(--accent)', stroke: 2 })}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>아직 진행 중인 도전이 없어</div>
              <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 1 }}>기회 레이더에서 자격증·대회·적금 경로를 시작해보자</div>
            </div>
            {Icon('chevR', { size: 16, color: 'var(--faint)' })}
          </Card>
        )}
      </div>

      {todayLog.length > 0 && (
        <>
          <SectionHeader right={`+${todayLog.reduce((n, a) => n + (a.xp || 0), 0)} XP`}>오늘의 기록</SectionHeader>
          <Card pad="6px 15px">
            {todayLog.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 0', borderTop: i ? '1px solid var(--hair)' : 'none' }}>
                {Icon('check', { size: 14, color: STAT_C[a.stat] || 'var(--positive)', stroke: 2.4 })}
                <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.text}</span>
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: STAT_C[a.stat] || 'var(--sub)', flexShrink: 0 }}>+{a.xp}</span>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

// quest row with an arm-then-confirm undo: a done quest's first tap arms a 3s
// "tap again to un-complete" state instead of silently reclaiming XP
function QuestRow({ q, onToggle, stats }) {
  const c = STAT_C[q.stat];
  const stat = stats.find((s) => s.key === q.stat);
  const [confirming, setConfirming] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const tap = () => {
    if (!q.done) { onToggle(); return; }
    if (confirming) { clearTimeout(timer.current); setConfirming(false); onToggle(); return; }
    setConfirming(true);
    timer.current = setTimeout(() => setConfirming(false), 3000);
  };

  return (
    <Card onClick={tap} pad={14} style={{ display: 'flex', alignItems: 'center', gap: 13, opacity: q.done && !confirming ? 0.62 : 1,
      boxShadow: confirming ? 'inset 0 0 0 1.5px var(--danger)' : q.hard && !q.done ? 'inset 0 0 0 1px rgba(var(--accent-rgb),.35)' : 'inset 0 0 0 1px var(--line)' }}>
      <div style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: q.done ? 'var(--accent)' : 'transparent', boxShadow: q.done ? 'none' : `inset 0 0 0 2px ${q.hard ? 'var(--accent)' : 'var(--faint)'}` }}>
        {q.done && Icon('check', { size: 15, color: 'var(--on-accent)', stroke: 2.6 })}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, textDecoration: q.done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.txt}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
          {confirming ? (
            <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700 }}>한 번 더 누르면 완료 취소 · +{q.xp} XP 회수</span>
          ) : (
            <>
              <span style={{ fontSize: 11, color: c, fontWeight: 600 }}>{stat?.mil}</span>
              <span style={{ fontSize: 11, color: 'var(--faint)' }}>· {q.min}분</span>
              {q.hard && <Tag tone="accent" style={{ fontSize: 9.5, padding: '0 6px' }}>담력</Tag>}
            </>
          )}
        </div>
      </div>
      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: q.done ? 'var(--faint)' : c, flexShrink: 0 }}>+{q.xp}</span>
    </Card>
  );
}

function TrackRow({ o, onOpen, onToggleStep }) {
  const st = STATUS[o.status] || STATUS.on;
  const next = o.milestones.flatMap((m) => m.subquests).find((s) => !s.done);
  return (
    <Card pad={14}>
      <div onClick={onOpen} className="tm-tap" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <div style={{ flex: 1 }}><ProgressBar pct={o.fill} height={6} color={st.c} /></div>
            <span className="num" style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)', flexShrink: 0 }}>{o.fill}%</span>
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: o.dday <= 14 ? 'var(--accent)' : 'var(--faint)', flexShrink: 0 }}>D-{o.dday}</span>
          </div>
        </div>
        {Icon('chevR', { size: 16, color: 'var(--faint)' })}
      </div>
      {next && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 11, paddingTop: 11, borderTop: '1px solid var(--hair)' }}>
          <button onClick={() => onToggleStep(o.id, next.id, false)} className="tm-tap" aria-label="다음 단계 완료"
            style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0, border: 'none', cursor: 'pointer', padding: 0,
              background: 'transparent', boxShadow: 'inset 0 0 0 2px var(--faint)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{next.text}</div>
            <div style={{ fontSize: 10.5, color: 'var(--faint)', marginTop: 1 }}>다음 단계 · 인증하려면 경로에서</div>
          </div>
          <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: STAT_C[next.stat] || 'var(--accent)', flexShrink: 0 }}>+{next.xp}</span>
        </div>
      )}
    </Card>
  );
}
