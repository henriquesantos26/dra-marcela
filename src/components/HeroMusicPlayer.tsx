import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';

const HeroMusicPlayer = () => {
  const { content } = useSiteContent();
  const musicUrl = content.heroMusic?.url;
  const label = content.heroMusic?.label || 'Background Music';

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!musicUrl) return;
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    audio.addEventListener('ended', () => setPlaying(false));

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [musicUrl]);

  if (!musicUrl) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="hidden xl:flex items-center gap-3 absolute bottom-8 right-6 z-20">
      <button
        onClick={togglePlay}
        className="w-12 h-12 rounded-full border border-white/20 bg-white/[0.05] backdrop-blur-xl flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all group"
        aria-label={playing ? 'Pausar música' : 'Tocar música'}
      >
        {playing ? (
          <Pause className="w-5 h-5" strokeWidth={1.5} />
        ) : (
          <Play className="w-5 h-5 ml-0.5" strokeWidth={1.5} />
        )}
      </button>

      {playing && (
        <>
          {/* Animated bars */}
          <div className="flex items-end gap-[3px] h-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[3px] bg-white/40 rounded-full"
                style={{
                  animation: `musicBar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                  height: `${8 + Math.random() * 12}px`,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest max-w-[100px] truncate">
            {label}
          </span>
          <button
            onClick={toggleMute}
            className="text-white/30 hover:text-white/60 transition-colors"
            aria-label={muted ? 'Ativar som' : 'Silenciar'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </>
      )}

      <style>{`
        @keyframes musicBar {
          0% { height: 4px; }
          100% { height: 18px; }
        }
      `}</style>
    </div>
  );
};

export default HeroMusicPlayer;
