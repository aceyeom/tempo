import { Icon } from '../icons';
import { Card, Btn, SectionHeader } from '../components/ui';
import { useStore } from '../store';
import { CREATURE_PATHS } from '../components/creature/CreatureHero';

const THEMES = [{ v: 'dark', ko: '다크' }, { v: 'light', ko: '라이트' }];
const PALETTES = [{ v: '골드', sw: '#E7A33C' }, { v: '택티컬', sw: '#5A8F5A' }, { v: '스틸', sw: '#6E8AA6' }];

function Row({ children }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>;
}
function Pill({ on, onClick, children }) {
  return (
    <button onClick={onClick} className="tm-tap" style={{ flex: '1 0 auto', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700,
      background: on ? 'var(--accent)' : 'var(--surface)', color: on ? 'var(--on-accent)' : 'var(--sub)',
      boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line)' }}>{children}</button>
  );
}

export function SettingsScreen({ onOpenAdmin }) {
  const prefs = useStore((s) => s.prefs);
  const setPref = useStore((s) => s.setPref);
  const signOut = useStore((s) => s.signOut);
  const online = useStore((s) => s.online);
  const soldier = useStore((s) => s.soldier);
  const isAdmin = soldier?.role === 'admin';

  return (
    <div className="tm-rise">
      <SectionHeader caption="앱 전체에 바로 적용돼 · 다음에 와도 유지된다">화면</SectionHeader>
      <Card pad={16} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sub)', marginBottom: 8 }}>모드</div>
        <Row>
          {THEMES.map((t) => (
            <Pill key={t.v} on={prefs.theme === t.v} onClick={() => setPref('theme', t.v)}>
              {Icon(t.v === 'dark' ? 'moon' : 'sparkle', { size: 15, color: prefs.theme === t.v ? 'var(--on-accent)' : 'var(--sub)', stroke: 2 })}{t.ko}
            </Pill>
          ))}
        </Row>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sub)', margin: '16px 0 8px' }}>색</div>
        <Row>
          {PALETTES.map((p) => (
            <Pill key={p.v} on={prefs.palette === p.v} onClick={() => setPref('palette', p.v)}>
              <span style={{ width: 13, height: 13, borderRadius: 999, background: p.sw, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.2)' }} />{p.v}
            </Pill>
          ))}
        </Row>
      </Card>

      <SectionHeader caption="홈·프로필에 나타나는 너의 수호신">수호신</SectionHeader>
      <Card pad={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CREATURE_PATHS.map((p) => {
            const on = prefs.path === p.key;
            return (
              <button key={p.key} onClick={() => setPref('path', p.key)} className="tm-tap" style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px', borderRadius: 12,
                background: on ? 'rgba(var(--accent-rgb),.14)' : 'var(--surface2)', boxShadow: on ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--line)' }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: on ? 'var(--accent)' : 'var(--faint)', flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: on ? 'var(--accent)' : 'var(--ink)' }}>{p.ko}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--faint)' }}>{p.desc}</span>
                </span>
                {on && Icon('check', { size: 16, color: 'var(--accent)', stroke: 2.4 })}
              </button>
            );
          })}
        </div>
      </Card>

      <SectionHeader caption={online ? '동기화됨 · 클라우드에 안전하게 저장' : '오프라인 데모 모드'}>계정</SectionHeader>
      <Card pad={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: online ? 14 : 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface2)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
            {Icon('user', { size: 19, color: 'var(--accent)', stroke: 2 })}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{soldier?.name || '병사'}</div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>
              {soldier?.rank} · {soldier?.branch || ''}{soldier?.mos ? ` ${soldier.mos}` : ''} · {soldier?.unit}
            </div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '4px 9px', borderRadius: 999,
            background: online ? 'rgba(var(--positive-rgb),.14)' : 'var(--surface2)',
            color: online ? 'var(--positive)' : 'var(--faint)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
            {online ? '온라인' : '오프라인'}
          </span>
        </div>
        {online && <Btn tone="ghost" icon="arrowR" onClick={signOut}>로그아웃</Btn>}
      </Card>

      {isAdmin && onOpenAdmin && (
        <>
          <SectionHeader caption="장병이 공유 신청한 기회를 심사해 전체에 공개" style={{ marginTop: 16 }}>관리자</SectionHeader>
          <Card pad={16}>
            <Btn tone="soft" icon="badgeCheck" onClick={onOpenAdmin}>심사 대기열 열기</Btn>
          </Card>
        </>
      )}

      <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--faint)', marginTop: 22 }}>DOLBOMI · 프로토타입 · 데모</div>
    </div>
  );
}
