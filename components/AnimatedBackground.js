import { useEffect } from 'react';

const GRID_ROWS = 20;
const GRID_COLS = 20;

export default function AnimatedBackground() {
    return (
        <>
            <div
                className="absolute top-0 left-0 w-full h-screen bg-[#1d1d1d] saturate-[2] overflow-hidden z-0"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                }}
            >
                {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => (
                    <div
                        key={i}
                        className="border border-cyan-900/40 bg-[#1d1d1b] transition-colors duration-200 hover:bg-cyan-400/80 hover:transition-none m-[2px]"
                        style={{
                            boxShadow: '0 0 1px #00bfff33',
                        }}
                    />
                ))}
            </div>
            <div
                className="absolute top-0 left-0 w-full h-10 bg-[#00bfff] filter blur-[60px] animate-animBack"
                style={{ animation: 'animBack 6s linear infinite' }}
            />

            <style jsx>{`
        @keyframes animBack {
          0% {
            top: -60px;
          }
          100% {
            top: 120%;
          }
        }
      `}</style>
        </>
    );
}