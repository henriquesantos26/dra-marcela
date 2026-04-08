import React from 'react';

const BackgroundIdentity = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: 'black' }}>
      {/* Glows periféricos */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[200px] opacity-20"
        style={{ background: '#a855f7' }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[200px] opacity-15"
        style={{ background: '#a855f7' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[250px] opacity-[0.08]"
        style={{ background: '#a855f7' }}
      />

      {/* Texto de fundo gigante */}
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <span
          className="text-[18vw] font-black uppercase leading-none tracking-tighter"
          style={{ color: 'rgba(255,255,255,0.02)' }}
        >
          MARKETING
        </span>
        <span
          className="text-[22vw] font-black uppercase leading-none tracking-tighter"
          style={{ color: 'rgba(255,255,255,0.02)' }}
        >
          7 ZION
        </span>
      </div>

      {/* Vinheta */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
};

export default BackgroundIdentity;
