import { useState, useMemo } from 'react';
import { useWrittenQuestions, fetchQuestionBody } from '../../hooks/useWrittenQuestions';
import { SejmApiError } from '../../components/sejm';
import type { SejmWrittenQuestion } from '../../types/sejm';

type FilterOption = 'all' | 'answered' | 'pending';

export function QuestionsPage() {
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
      setBodyContent('Nie udało się pobrać treści zapytania.');
    } finally {
      setLoadingBody(false);
    }
  };

  const closeModal = () => {
    setSelectedQuestion(null);
    setBodyContent(null);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pl-PL', {
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
        <div className="h-8 w-48 bg-zinc-100 animate-pulse rounded" />
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-zinc-900">Zapytania poselskie</h1>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Wszystkie' },
          { value: 'answered', label: 'Odpowiedziane' },
          { value: 'pending', label: 'Oczekujące' },
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

      {/* Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {filteredQuestions.map((question) => {
          const hasReply = question.replies && question.replies.length > 0;
          return (
            <button
              key={question.num}
              onClick={() => handleOpenQuestion(question)}
              className="block w-full text-left rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="shrink-0 bg-zinc-100 text-zinc-600 text-xs font-mono px-2 py-0.5 rounded">
                  #{question.num}
                </span>
                <span
                  className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded ${
                    hasReply
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {hasReply ? 'Odpowiedziano' : 'Oczekuje'}
                </span>
              </div>

              <h3 className="text-sm font-medium text-zinc-900 leading-tight line-clamp-2 mb-2">
                {question.title}
              </h3>

              <div className="text-[11px] text-zinc-500 space-y-1">
                <div>
                  <span className="text-zinc-400">Do:</span>{' '}
                  {question.to.join(', ')}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>{formatDate(question.sentDate)}</span>
                  {hasReply && (
                    <span className="text-green-600">
                      {question.replies!.length} odpowiedzi
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <p className="text-center text-zinc-500 py-8">
          Brak zapytań do wyświetlenia
        </p>
      )}

      {hasMore && filter === 'all' && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-zinc-100 text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Ładowanie...' : 'Załaduj więcej'}
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-200 flex items-start justify-between">
              <div>
                <span className="text-xs text-zinc-500">Zapytanie #{selectedQuestion.num}</span>
                <h2 className="font-medium text-zinc-900 mt-1">{selectedQuestion.title}</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <i className="ri-close-line text-2xl" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {loadingBody ? (
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-100 animate-pulse rounded" />
                  <div className="h-4 bg-zinc-100 animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-zinc-100 animate-pulse rounded w-1/2" />
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-zinc-700"
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
