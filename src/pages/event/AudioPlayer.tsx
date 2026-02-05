import { useState, useRef, useEffect, useCallback } from 'react';

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

function getVolumeIcon(volume: number): string {
  if (volume === 0) return 'ri-volume-mute-fill';
  if (volume < 0.5) return 'ri-volume-down-fill';
  return 'ri-volume-up-fill';
}

export function AudioPlayer({ audioUrl, small = false, fullWidth = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekRef = useRef<HTMLButtonElement>(null);
  const volumeTrackRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingSeek, setIsDraggingSeek] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isDraggingSeek) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleLoadedData = () => {
      if (audio.duration && !isNaN(audio.duration) && duration === 0) {
        setDuration(audio.duration);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => setError('Nie można załadować audio');

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [duration, isDraggingSeek]);

  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  const updateSeekFromEvent = useCallback(
    (clientX: number) => {
      const audio = audioRef.current;
      const seekEl = seekRef.current;
      if (!audio || !seekEl || duration === 0) return;

      const rect = seekEl.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percentage * duration;
      setCurrentTime(newTime);
      audio.currentTime = newTime;
    },
    [duration]
  );

  const updateVolumeFromEvent = useCallback((clientY: number) => {
    const trackEl = volumeTrackRef.current;
    if (!trackEl) return;

    const rect = trackEl.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = 1 - y / rect.height;
    const newVolume = Math.max(0, Math.min(1, percentage));
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  useEffect(() => {
    if (!isDraggingSeek) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateSeekFromEvent(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDraggingSeek(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSeek, updateSeekFromEvent]);

  useEffect(() => {
    if (!isDraggingVolume) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateVolumeFromEvent(e.clientY);
    };

    const handleMouseUp = () => {
      setIsDraggingVolume(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingVolume, updateVolumeFromEvent]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeekMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if ((e.target as HTMLElement).closest('i')) return;
    setIsDraggingSeek(true);
    updateSeekFromEvent(e.clientX);
  };

  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingVolume(true);
    updateVolumeFromEvent(e.clientY);
  };

  const handleVolumeMouseEnter = () => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    setShowVolumeSlider(true);
  };

  const handleVolumeMouseLeave = () => {
    if (isDraggingVolume) return;
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 300);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <div
        className={`inline-flex items-center rounded border border-red-300 bg-red-50 text-red-600 ${
          small ? 'gap-1.5 px-2 py-1 text-xs' : 'gap-2 px-3 py-1.5 text-sm'
        } ${fullWidth ? 'w-full' : ''}`}
      >
        <i className={`ri-error-warning-fill ${small ? 'text-sm' : ''}`} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${small ? 'gap-1' : 'gap-1.5'} ${fullWidth ? 'w-full' : ''}`}>
      <button
        ref={seekRef}
        onMouseDown={handleSeekMouseDown}
        onDoubleClick={togglePlay}
        className={`inline-flex items-center rounded border border-zinc-300 hover:border-zinc-400 transition-colors select-none ${
          small ? 'gap-1.5 px-2 py-1 text-xs' : 'gap-2 px-3 py-1.5 text-sm'
        } ${fullWidth ? 'flex-1' : ''} ${isDraggingSeek ? 'cursor-grabbing' : 'cursor-pointer'}`}
        style={{
          background: `linear-gradient(to right, rgba(59, 130, 246, 0.15) ${progress}%, transparent ${progress}%)`,
        }}
      >
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        <i
          className={`${small ? 'text-sm' : ''} ${isPlaying ? 'ri-pause-fill text-blue-600' : 'ri-play-fill text-zinc-600'} cursor-pointer`}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        />
        <span className={`font-mono text-zinc-600 ${small ? 'text-[10px]' : 'text-xs'}`}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </button>

      <div
        className="relative"
        onMouseEnter={handleVolumeMouseEnter}
        onMouseLeave={handleVolumeMouseLeave}
      >
        <button
          className={`inline-flex items-center justify-center rounded border border-zinc-300 hover:border-zinc-400 transition-colors text-zinc-600 ${
            small ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
          }`}
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
        >
          <i className={getVolumeIcon(volume)} />
        </button>

        {showVolumeSlider && (
          <div
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 rounded border border-zinc-300 bg-white shadow-sm flex items-center justify-center ${
              small ? 'w-6 h-20 py-2' : 'w-8 h-24 py-3'
            }`}
            onMouseEnter={handleVolumeMouseEnter}
            onMouseLeave={handleVolumeMouseLeave}
          >
            <div
              ref={volumeTrackRef}
              className={`relative rounded-full bg-zinc-200 select-none ${
                small ? 'w-1 h-full' : 'w-1.5 h-full'
              } ${isDraggingVolume ? 'cursor-grabbing' : 'cursor-pointer'}`}
              onMouseDown={handleVolumeMouseDown}
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-full bg-blue-500"
                style={{ height: `${volume * 100}%` }}
              />
              <div
                className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-blue-600 shadow-sm ${
                  small ? 'w-2 h-2' : 'w-2.5 h-2.5'
                } ${isDraggingVolume ? 'scale-125' : ''} transition-transform`}
                style={{ bottom: `calc(${volume * 100}% - ${small ? '4px' : '5px'})` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
