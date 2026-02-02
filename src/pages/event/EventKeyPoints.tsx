import type { KeyPoint } from '../../types/events';
import { sanitizeAndProcessInlineHtml } from '../../utils/text';

interface EventKeyPointsProps {
  keyPoints: KeyPoint[];
}

export function EventKeyPoints({ keyPoints }: EventKeyPointsProps) {
  if (!keyPoints || keyPoints.length === 0) return null;

  return (
    <section className="key-points px-6 py-6 border-t border-zinc-200">
      <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Kluczowe punkty
      </h2>
      <ul className="space-y-4">
        {keyPoints.map((point, index) => (
          <li key={index} className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium flex items-center justify-center">
              {index + 1}
            </span>
            <div className="key-point-content">
              <h3 className="key-point-title text-zinc-900 mb-1">
                {point.title}
              </h3>
              <p
                className="text-sm text-zinc-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeAndProcessInlineHtml(point.description) }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
