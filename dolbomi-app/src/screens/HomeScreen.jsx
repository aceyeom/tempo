// 홈 — the emotional dashboard (design review: quests/stats moved out).
// Who I am · my guardian · today's status (deep-links to 퀘스트) · what the
// next evolution unlocks · one derived line. The daily ACTION lives in the
// 퀘스트 tab; the stat detail lives in 프로필.
import { Icon } from '../icons';
import { Card, Tag } from '../components/ui';
import { GuardianHero, evolutionOf, BANDS } from '../components/creature/GuardianCard';
import { seoulToday } from '../data';
import { useStore } from '../store';

// "오늘의 한 줄" — derived from real data, not a hardcoded sentence (LOGIC-GAPS C1).
function aiLine(soldier, quests, stats, catalog) {
  const doneToday = quests.filter((q) => q.done);
  const topStat = doneToday.length
    ? stats.find((s) => s.key === doneToday[doneToday.length - 1].stat)
    : null;
  // nearest started, unfinished opportunity by D-day
  const near = (catalog || [])
    .filter((o) => o.started && !o.locked && o.fill < 100)
    .sort((a, b) => a.dday - b.dday)[0];
  const head = soldier.streak >= 3 ? `${soldier.streak}일 연속` : '오늘도';
  const statPart = topStat
    ? <><span style={{ color: 'var(--ink)', fontWeight: 700 }}>{topStat.mil}</span> 채웠다. </>
    : '한 걸음 더. ';
  const tail = near ? `${near.title}까지 D-${near.dday}, 페이스 좋아.` : '전역 목표가 가까워지고 있어.';
  return <>"{head} {statPart}{tail}"</>;
}

export function HomeScreen({ soldier, stats, quests, mood, showAi, creaturePath, creatureAnimal, pulseSignal, milestones, onPickPath, onOpenAvatar, onGoQuests, catalog }) {
  const online = useStore((s) => s.online);
  const done = quests.filter((q) => q.done).length;
  const checkedIn = online ? soldier.lastCheckinDate === seoulToday() : !!mood;
  const evo = evolutionOf(stats);
  const nextBand = evo.maxed ? null : BANDS.find((b) => b.label === evo.nextLabel);

  return (
    <div className="tm-rise">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, background: 'var(--surface2)', boxShadow: 'inset 0 0 0 1px var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="mono">
          <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--accent)' }}>{soldier.rankEn}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '-.02em' }}>{soldier.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{soldier.rank} · {soldier.unit}</div>
        </div>
        <Tag tone="accent" icon="trophy">{soldier.title}</Tag>
      </div>

      <div style={{ marginBottom: 14 }}>
        <GuardianHero soldier={soldier} stats={stats} creaturePath={creaturePath} creatureAnimal={creatureAnimal}
          milestones={milestones} pulseSignal={pulseSignal} onPickPath={onPickPath} variant="home" onOpenAvatar={onOpenAvatar} />
      </div>

      {/* today's status — the single tap into the daily loop */}
      <Card onClick={onGoQuests} glow={!checkedIn} pad={15} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: 'var(--surface2)', boxShadow: 'inset 0 0 0 1px var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {checkedIn && mood ? <span style={{ fontSize: 22 }}>{mood.emoji}</span> : Icon('moon', { size: 20, color: 'var(--accent)', stroke: 1.9 })}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {checkedIn ? `오늘 퀘스트 ${done} / ${quests.length} 완료` : '오늘의 체크인이 기다려'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {checkedIn
              ? (done >= quests.length && quests.length > 0 ? '오늘 밤 전부 완료 — 수호신이 자란다' : '퀘스트 탭에서 이어서 하자')
              : '60초 체크인 → 컨디션에 맞는 퀘스트 3개'}
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--positive)', fontWeight: 700, flexShrink: 0 }}>
          {Icon('flame', { size: 13, color: 'var(--positive)', stroke: 2 })}{soldier.streak}일
        </span>
        {Icon('chevR', { size: 18, color: 'var(--faint)' })}
      </Card>

      {/* what the next evolution unlocks — the roadmap pull */}
      {nextBand && (
        <Card pad={13} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: 'rgba(var(--accent-rgb),.12)',
            boxShadow: 'inset 0 0 0 1px rgba(var(--accent-rgb),.26)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon('sparkle', { size: 17, color: 'var(--accent)', stroke: 2 })}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>
              다음 진화 <span style={{ color: 'var(--accent)' }}>{evo.nextLabel}</span>까지 {Math.max(0, evo.nextMin - evo.total)} XP
            </div>
            {nextBand.rewards.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                해금: {nextBand.rewards.join(' · ')}
              </div>
            )}
          </div>
          <span className="mono" style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{evo.pct}%</span>
        </Card>
      )}

      {showAi && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0 4px 6px' }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: 'rgba(var(--accent-rgb),.12)',
            boxShadow: 'inset 0 0 0 1px rgba(var(--accent-rgb),.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon('sparkle', { size: 13, color: 'var(--accent)', stroke: 1.7 })}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--sub)', textWrap: 'pretty' }}>
              {aiLine(soldier, quests, stats, catalog)}
            </p>
            <div style={{ fontSize: 10.5, color: 'var(--faint)', marginTop: 3 }}>오늘의 한 줄</div>
          </div>
        </div>
      )}
    </div>
  );
}
