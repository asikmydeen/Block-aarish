import { useState } from 'react';
import { BlockType } from '../game/terrain';
import { BLOCK_COLORS, BLOCK_NAMES, PLACEABLE_BLOCKS } from '../game/blockColors';
import * as THREE from 'three';

interface GameUIProps {
  selectedBlock: BlockType;
  onSelectBlock: (b: BlockType) => void;
  position: THREE.Vector3;
  isLocked: boolean;
}

export function GameUI({ selectedBlock, onSelectBlock, position, isLocked }: GameUIProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* Crosshair */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 24,
        height: 24,
        pointerEvents: 'none',
        zIndex: 100,
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 2,
          background: 'rgba(255,255,255,0.9)',
          transform: 'translateY(-50%)',
        }} />
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: 2,
          background: 'rgba(255,255,255,0.9)',
          transform: 'translateX(-50%)',
        }} />
      </div>

      {/* Hotbar */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 4,
        background: 'rgba(0,0,0,0.5)',
        padding: '6px 8px',
        borderRadius: 8,
        zIndex: 100,
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        {PLACEABLE_BLOCKS.map((block, i) => (
          <div
            key={block}
            onClick={() => onSelectBlock(block)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 6,
              border: selectedBlock === block
                ? '2px solid #fff'
                : '2px solid rgba(255,255,255,0.25)',
              background: BLOCK_COLORS[block],
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'transform 0.1s',
              transform: selectedBlock === block ? 'scale(1.1)' : 'scale(1)',
            }}
            title={BLOCK_NAMES[block]}
          >
            <span style={{
              position: 'absolute',
              bottom: 2,
              right: 4,
              fontSize: 10,
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'monospace',
            }}>{i + 1}</span>
          </div>
        ))}
      </div>

      {/* Selected block label */}
      <div style={{
        position: 'fixed',
        bottom: 78,
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: 12,
        fontFamily: 'monospace',
        textShadow: '1px 1px 2px black',
        background: 'rgba(0,0,0,0.3)',
        padding: '2px 8px',
        borderRadius: 4,
        zIndex: 100,
      }}>
        {BLOCK_NAMES[selectedBlock]}
      </div>

      {/* Coordinates */}
      <div style={{
        position: 'fixed',
        top: 16,
        left: 16,
        color: 'white',
        fontSize: 13,
        fontFamily: 'monospace',
        textShadow: '1px 1px 2px black',
        background: 'rgba(0,0,0,0.45)',
        padding: '6px 10px',
        borderRadius: 6,
        zIndex: 100,
        lineHeight: 1.6,
      }}>
        <div>X: {position.x.toFixed(1)}</div>
        <div>Y: {position.y.toFixed(1)}</div>
        <div>Z: {position.z.toFixed(1)}</div>
      </div>

      {/* Help button */}
      <div style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 100,
      }}>
        <button
          onClick={() => setShowHelp(h => !h)}
          style={{
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            padding: '4px 12px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: 13,
          }}
        >
          {showHelp ? 'Close' : '? Help'}
        </button>
      </div>

      {/* Help panel */}
      {showHelp && (
        <div style={{
          position: 'fixed',
          top: 52,
          right: 16,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: 8,
          zIndex: 100,
          fontFamily: 'monospace',
          fontSize: 13,
          lineHeight: 2,
          border: '1px solid rgba(255,255,255,0.15)',
          minWidth: 200,
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#aef' }}>Controls</div>
          <div>WASD — Move</div>
          <div>Space — Jump</div>
          <div>Mouse — Look around</div>
          <div>Left Click — Break block</div>
          <div>Right Click — Place block</div>
          <div>1–7 — Select block</div>
          <div>Click game — Lock mouse</div>
          <div>Esc — Unlock mouse</div>
        </div>
      )}

      {/* Click to play overlay */}
      {!isLocked && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 200,
          cursor: 'pointer',
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '24px 40px',
            borderRadius: 12,
            textAlign: 'center',
            fontFamily: 'monospace',
            border: '2px solid rgba(255,255,255,0.2)',
          }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#7CFC00' }}>
              CRAFTWORLD
            </div>
            <div style={{ fontSize: 14, color: '#aaa', marginBottom: 16 }}>
              A Minecraft-like exploration game
            </div>
            <div style={{ fontSize: 16, color: '#fff' }}>
              Click to play
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
              WASD to move • Space to jump • Click to build
            </div>
          </div>
        </div>
      )}
    </>
  );
}
