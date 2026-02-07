import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useWrittenQuestions, fetchQuestionBody } from '../../hooks/useWrittenQuestions';
import { SejmApiError } from '../../components/sejm';
import { useLanguageStore } from '../../stores/languageStore';
import type { SejmWrittenQuestion } from '../../types/sejm';

type FilterOption = 'all' | 'answered' | 'pending';

export function QuestionsPage() {
  const { t } = useTranslation('sejm');
  const language = useLanguageStore((s) => s.language);
  const { questions, hasMore, loading, loadingMore, loadMore, error } = useWrittenQuestions();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<SejmWrittenQuestion | null>(null);
  const [bodyContent, setBodyContent] = useState<string | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);

  const filteredQuestions = useMemo(() => {
    if (filter === 'all') return questions;
    if (filter === 'answered') return questions.filter(q => q.replies && q.replies.length > 0);
    return questions.filter(q => !q.replies || q.replies.length === 0);
  }, [questions, filter]);

  const counts = useMemo(() => ({
    all: questions.length,
    answered: questions.filter(q => q.replies && q.replies.length > 0).length,
    pending: questions.filter(q => !q.replies || q.replies.length === 0).length,
  }), [questions]);

  const handleOpenQuestion = async (question: SejmWrittenQuestion) => {
    setSelectedQuestion(question);
    setBodyContent(null);
    setLoadingBody(true);
    try {
      const body = await fetchQuestionBody(question.num);
      setBodyContent(body);
    } catch (err) {
      setBodyContent(t('questionsPage.fetchError'));
    } finally {
      setLoadingBody(false);
    }
  };

  const closeModal = () => {
    setSelectedQuestion(null);
    setBodyContent(null);
  };

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(localeMap[language] || 'pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface animate-pulse rounded" />
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-surface animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-content-heading">{t('questionsPage.title')}</h1>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: t('questionsPage.all') },
          { value: 'answered', label: t('questionsPage.answered') },
          { value: 'pending', label: t('questionsPage.pending') },
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

      {/* Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {filteredQuestions.map((question) => {
          const hasReply = question.replies && question.replies.length > 0;
          return (
            <button
              key={question.num}
              onClick={() => handleOpenQuestion(question)}
              className="block w-full text-left rounded-lg border border-divider hover:border-divider hover:shadow-sm transition-all p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="shrink-0 bg-surface text-content text-xs font-mono px-2 py-0.5 rounded">
                  #{question.num}
                </span>
                <span
                  className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded ${
                    hasReply
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {hasReply ? t('questionsPage.answeredStatus') : t('questionsPage.pendingStatus')}
                </span>
              </div>

              <h3 className="text-sm font-medium text-content-heading leading-tight line-clamp-2 mb-2">
                {question.title}
              </h3>

              <div className="text-[11px] text-content-subtle space-y-1">
                <div>
                  <span className="text-content-faint">{t('questionsPage.to')}:</span>{' '}
                  {question.to.join(', ')}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>{formatDate(question.sentDate)}</span>
                  {hasReply && (
                    <span className="text-green-600 dark:text-green-400">
                      {question.replies!.length} {t('questionsPage.replies')}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <p className="text-center text-content-subtle py-8">
          {t('questionsPage.noResults')}
        </p>
      )}

      {hasMore && filter === 'all' && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-surface text-content rounded-md hover:bg-surface transition-colors disabled:opacity-50"
          >
            {loadingMore ? t('questionsPage.loading') : t('questionsPage.loadMore')}
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div
            className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-divider flex items-start justify-between">
              <div>
                <span className="text-xs text-content-subtle">{t('questionsPage.questionNumber', { num: selectedQuestion.num })}</span>
                <h2 className="font-medium text-content-heading mt-1">{selectedQuestion.title}</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-content-faint hover:text-content"
              >
                <i className="ri-close-line text-2xl" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {loadingBody ? (
                <div className="space-y-2">
                  <div className="h-4 bg-surface animate-pulse rounded" />
                  <div className="h-4 bg-surface animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-surface animate-pulse rounded w-1/2" />
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-content"
                  dangerouslySetInnerHTML={{ __html: bodyContent || '' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
