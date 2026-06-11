// First-run teaching surfaces (design review: "no guides explain the app").
//  · FirstRunGuide — a one-time, 4-card walkthrough of the core loop, shown
//    right after onboarding. Ends by routing into the 퀘스트 tab so the user
//    learns the loop by doing it once.
//  · TipBanner — a dismissible one-time explainer pinned to a screen's top.
// Both persist their "seen" state in localStorage.
import React from 'react';
import { Icon } from '../icons';
import { Btn } from './ui';

const seen = (key) => { try { return !!localStorage.getItem(key); } catch { return true; } };
const markSeen = (key) => { try { localStorage.setItem(key, '1'); } catch { /* ignore */ } };

export const GUIDE_KEY = 'dolbomi_guide_v1';
export const guideSeen = () => seen(GUIDE_KEY);

const GUIDE_STEPS = [
  {
    icon: 'sparkle',
    title: '모든 경험치는 0에서 시작한다',
    body: '여섯 능력치도, 수호신도 비어 있는 채로 시작해. 여기 보이는 모든 성장은 네가 실제로 한 일의 기록이야 — 전역하는 날, 그게 증명서가 된다.',
  },
  {
    icon: 'moon',
    title: '매일 밤의 리듬',
    body: '하루 한 번 60초 체크인으로 컨디션을 알려주면, 오늘 밤의 퀘스트가 에너지에 맞춰 뽑혀. 지친 날엔 5분짜리만 — 그것도 완전한 1승이야.',
  },
  {
    icon: 'target',
    title: '기회 레이더',
    body: '자격증·대회·적금 같은 진짜 프로그램들이 단계별 경로로 준비돼 있어. 단계를 끝내면 능력치가 오르고, 인증하면 +50% 보너스. 포상휴가도 여기서 노린다.',
  },
  {
    icon: 'zap',
    title: '수호신이 너를 따라 진화한다',
    body: '경험치가 쌓일수록 대리석 몸이 발끝부터 황금으로 물들고, 단계가 오를 때마다 보상이 해금돼. 이제 첫 퀘스트를 깨보자 — 2분이면 돼.',
  },
];

export function FirstRunGuide({ onDone }) {
  const [step, setStep] = React.useState(0);
  const s = GUIDE_STEPS[step];
  const last = step === GUIDE_STEPS.length - 1;
  const finish = () => { markSeen(GUIDE_KEY); onDone(); };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 85, background: 'rgba(6,8,11,.72)', backdropFilter: 'blur(6px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'tmFade .25s both' }}>
      <div key={step} style={{ background: 'var(--bg)', borderRadius: '26px 26px 0 0', padding: '26px 24px 34px',
        boxShadow: '0 -1px 0 var(--line), 0 -20px 60px rgba(0,0,0,.5)', animation: 'tmRise .4s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 22 }}>
          {GUIDE_STEPS.map((_, i) => (
            <span key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 999, transition: 'all .3s',
              background: i <= step ? 'var(--accent)' : 'var(--line)' }} />
          ))}
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(var(--accent-rgb),.13)', boxShadow: 'inset 0 0 0 1px rgba(var(--accent-rgb),.3)' }}>
          {Icon(s.icon, { size: 26, color: 'var(--accent)', stroke: 1.9 })}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', textAlign: 'center' }}>{s.title}</h2>
        <p style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.6, textAlign: 'center', margin: '10px 0 22px', textWrap: 'pretty' }}>{s.body}</p>
        <Btn onClick={() => (last ? finish() : setStep(step + 1))}>
          {last ? '첫 퀘스트 하러 가기' : '다음'}
        </Btn>
        {!last && (
          <button onClick={finish} className="tm-tap" style={{ width: '100%', marginTop: 12, border: 'none', background: 'transparent',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: 'var(--faint)', fontWeight: 600 }}>
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}

export function TipBanner({ id, icon = 'info', title, text }) {
  const key = `dolbomi_tip_${id}`;
  const [hidden, setHidden] = React.useState(() => seen(key));
  if (hidden) return null;
  return (
    <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '12px 13px', marginBottom: 14,
      borderRadius: 'var(--r-md)', background: 'rgba(var(--accent-rgb),.09)', boxShadow: 'inset 0 0 0 1px rgba(var(--accent-rgb),.24)' }}>
      {Icon(icon, { size: 17, color: 'var(--accent)', stroke: 2 })}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2, lineHeight: 1.5, textWrap: 'pretty' }}>{text}</div>
      </div>
      <button onClick={() => { markSeen(key); setHidden(true); }} className="tm-tap" aria-label="닫기"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
        {Icon('x', { size: 15, color: 'var(--faint)', stroke: 2 })}
      </button>
    </div>
  );
}
