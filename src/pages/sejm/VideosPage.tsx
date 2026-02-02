import { useState, useMemo } from 'react';
import { useVideos, useTodayVideos } from '../../hooks/useVideos';
import { SejmApiError } from '../../components/sejm';
import type { SejmVideo } from '../../types/sejm';

type FilterOption = 'all' | 'sitting' | 'committee';

export function VideosPage() {
  const { videos, loading, error } = useVideos(100);
  const { videos: todayVideos } = useTodayVideos();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [selectedVideo, setSelectedVideo] = useState<SejmVideo | null>(null);

  const filteredVideos = useMemo(() => {
    if (filter === 'all') return videos;
    return videos.filter(v => v.type === filter);
  }, [videos, filter]);

  const counts = useMemo(() => ({
    all: videos.length,
    sitting: videos.filter(v => v.type === 'sitting').length,
    committee: videos.filter(v => v.type === 'committee').length,
  }), [videos]);

  const closeModal = () => {
    setSelectedVideo(null);
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-zinc-100 animate-pulse rounded" />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    sitting: 'Posiedzenie',
    committee: 'Komisja',
    other: 'Inne',
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-zinc-900">Transmisje</h1>

      {/* Today's broadcasts */}
      {todayVideos.length > 0 && (
        <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
          <h2 className="text-sm font-medium text-green-900 mb-3 flex items-center gap-2">
            <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded animate-pulse">
              Dziś
            </span>
            Transmisje na żywo
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {todayVideos.map((video) => (
              <button
                key={video.unid}
                onClick={() => setSelectedVideo(video)}
                className="text-left p-3 bg-white rounded-lg border border-green-200 hover:border-green-300 transition-colors"
              >
                <h3 className="text-sm font-medium text-zinc-900 line-clamp-2">{video.title}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {formatDateTime(video.startDateTime)}
                  {video.room && ` · ${video.room}`}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Wszystkie' },
          { value: 'sitting', label: 'Posiedzenia' },
          { value: 'committee', label: 'Komisje' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as FilterOption)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === option.value
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {option.label}
            <span className="ml-1 text-xs opacity-70">
              ({counts[option.value as FilterOption]})
            </span>
          </button>
        ))}
      </div>

      {/* Videos grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (
          <button
            key={video.unid}
            onClick={() => setSelectedVideo(video)}
            className="text-left rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">▶️</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                video.type === 'sitting' ? 'bg-blue-100 text-blue-700' :
                video.type === 'committee' ? 'bg-purple-100 text-purple-700' :
                'bg-zinc-100 text-zinc-600'
              }`}>
                {typeLabels[video.type]}
              </span>
            </div>
            <h3 className="text-sm font-medium text-zinc-900 line-clamp-2">{video.title}</h3>
            <p className="text-xs text-zinc-500 mt-2">
              {formatDateTime(video.startDateTime)}
            </p>
            {video.room && (
              <p className="text-xs text-zinc-400 mt-1">Sala: {video.room}</p>
            )}
          </button>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <p className="text-center text-zinc-500 py-8">
          Brak transmisji do wyświetlenia
        </p>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div
            className="bg-white rounded-lg max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-200 flex items-start justify-between">
              <div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  selectedVideo.type === 'sitting' ? 'bg-blue-100 text-blue-700' :
                  selectedVideo.type === 'committee' ? 'bg-purple-100 text-purple-700' :
                  'bg-zinc-100 text-zinc-600'
                }`}>
                  {typeLabels[selectedVideo.type]}
                </span>
                <h2 className="font-medium text-zinc-900 mt-1">{selectedVideo.title}</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video bg-black">
              {selectedVideo.playerLinkIFrame ? (
                <iframe
                  src={selectedVideo.playerLinkIFrame}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : selectedVideo.videoLink ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.videoLink)}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Brak dostępnego video</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
