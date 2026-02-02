import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
  small?: boolean;
  fullWidth?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ audioUrl, small = false, fullWidth = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <button
      onClick={togglePlay}
      className={`inline-flex items-center rounded border border-zinc-300 hover:border-zinc-400 transition-colors ${
        small ? 'gap-1.5 px-2 py-1 text-xs' : 'gap-2 px-3 py-1.5 text-sm'
      } ${fullWidth ? 'w-full' : ''}`}
      style={{
        background: isPlaying
          ? `linear-gradient(to right, rgba(59, 130, 246, 0.15) ${progress}%, transparent ${progress}%)`
          : 'transparent',
      }}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <i className={`${small ? 'text-sm' : ''} ${isPlaying ? 'ri-pause-fill text-blue-600' : 'ri-play-fill text-zinc-600'}`} />
      <span className={`font-mono text-zinc-600 ${small ? 'text-[10px]' : 'text-xs'}`}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </button>
  );
}
