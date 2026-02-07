import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useVideos, useTodayVideos } from '../../hooks/useVideos';
import { SejmApiError } from '../../components/sejm';
import { useLanguageStore } from '../../stores/languageStore';
import type { SejmVideo } from '../../types/sejm';

type FilterOption = 'all' | 'sitting' | 'committee';

export function VideosPage() {
  const { t } = useTranslation('sejm');
  const language = useLanguageStore((s) => s.language);
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

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString(localeMap[language] || 'pl-PL', {
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
        <div className="h-8 w-48 bg-surface animate-pulse rounded" />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-surface animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    sitting: t('videosPage.types.sitting'),
    committee: t('videosPage.types.committee'),
    other: t('videosPage.types.other'),
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-content-heading">{t('videosPage.title')}</h1>

      {/* Today's broadcasts */}
      {todayVideos.length > 0 && (
        <div className="rounded-lg border-2 border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-950/30 p-4">
          <h2 className="text-sm font-medium text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
            <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded animate-pulse">
              {t('videosPage.today')}
            </span>
            {t('videosPage.liveBroadcasts')}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {todayVideos.map((video) => (
              <button
                key={video.unid}
                onClick={() => setSelectedVideo(video)}
                className="text-left p-3 bg-background rounded-lg border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-colors"
              >
                <h3 className="text-sm font-medium text-content-heading line-clamp-2">{video.title}</h3>
                <p className="text-xs text-content-subtle mt-1">
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
          { value: 'all', label: t('videosPage.all') },
          { value: 'sitting', label: t('videosPage.sittings') },
          { value: 'committee', label: t('videosPage.committees') },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as FilterOption)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === option.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface text-content hover:bg-surface'
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
            className="text-left rounded-lg border border-divider hover:border-divider hover:shadow-sm transition-all p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">▶️</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                video.type === 'sitting' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' :
                video.type === 'committee' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' :
                'bg-surface text-content'
              }`}>
                {typeLabels[video.type]}
              </span>
            </div>
            <h3 className="text-sm font-medium text-content-heading line-clamp-2">{video.title}</h3>
            <p className="text-xs text-content-subtle mt-2">
              {formatDateTime(video.startDateTime)}
            </p>
            {video.room && (
              <p className="text-xs text-content-faint mt-1">{t('videosPage.room')}: {video.room}</p>
            )}
          </button>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <p className="text-center text-content-subtle py-8">
          {t('videosPage.noResults')}
        </p>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div
            className="bg-background rounded-lg max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-divider flex items-start justify-between">
              <div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  selectedVideo.type === 'sitting' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' :
                  selectedVideo.type === 'committee' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' :
                  'bg-surface text-content'
                }`}>
                  {typeLabels[selectedVideo.type]}
                </span>
                <h2 className="font-medium text-content-heading mt-1">{selectedVideo.title}</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-content-faint hover:text-content"
              >
                <i className="ri-close-line text-2xl" />
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
                  <p>{t('videosPage.noVideo')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
