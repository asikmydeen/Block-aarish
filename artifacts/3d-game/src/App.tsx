import { useState } from 'react';
import Game, { type GameMode } from '@/pages/Game';

interface ModeCard {
  mode: GameMode;
  icon: string;
  title: string;
  desc: string;
  color: string;
  titleColor: string;
}

const MODES: ModeCard[] = [
  {
    mode: 'numbers',
    icon: '🔢',
    title: 'Collect Numbers',
    desc: 'Hunt for secret numbers hidden across the world and unlock 20 special powers!',
    color: '#8a4fd0',
    titleColor: '#c9a0ff',
  },
  {
    mode: 'free',
    icon: '🧱',
    title: 'Free Play',
    desc: 'Just build, explore, drive cars and fight zombies. No numbers, no powers.',
    color: '#2e8b57',
    titleColor: '#8affc1',
  },
  {
    mode: 'multi',
    icon: '🌐',
    title: 'Multiplayer',
    desc: 'Collect numbers in a shared world — see other players exploring with you!',
    color: '#1e6fd0',
    titleColor: '#7cc4ff',
  },
];

function App() {
  const [mode, setMode] = useState<GameMode | null>(null);

  if (mode) {
    return <Game key={mode} mode={mode} onMenu={() => setMode(null)} />;
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #87CEEB 0%, #4a90c2 55%, #2e5f36 55.2%, #1e401e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        gap: 28,
        padding: 16,
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 'clamp(34px, 7vw, 56px)',
            fontWeight: 'bold',
            color: '#fff',
            textShadow: '3px 3px 0 #2b2b2b, 6px 6px 0 rgba(0,0,0,0.25)',
            letterSpacing: 2,
          }}
        >
          ⛏️ CRAFTWORLD
        </div>
        <div style={{ color: '#e8f4ff', marginTop: 8, fontSize: 15, textShadow: '1px 1px 0 rgba(0,0,0,0.4)' }}>
          Pick a game mode to start
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 18,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 980,
        }}
      >
        {MODES.map(m => (
          <button
            key={m.mode}
            onClick={() => setMode(m.mode)}
            style={{
              width: 260,
              background: 'rgba(10, 15, 25, 0.82)',
              border: `3px solid ${m.color}`,
              borderRadius: 14,
              padding: '26px 20px',
              color: 'white',
              cursor: 'pointer',
              fontFamily: 'monospace',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div style={{ fontSize: 44 }}>{m.icon}</div>
            <div style={{ fontSize: 19, fontWeight: 'bold', color: m.titleColor }}>
              {m.title}
            </div>
            <div style={{ fontSize: 12, color: '#b8c4d0', lineHeight: 1.5 }}>{m.desc}</div>
            <div
              style={{
                marginTop: 6,
                background: m.color,
                borderRadius: 8,
                padding: '8px 0',
                fontWeight: 'bold',
                fontSize: 14,
              }}
            >
              PLAY
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
