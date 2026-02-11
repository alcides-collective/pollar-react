import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useBlogPosts, type BlogPostSummary } from '../../hooks/useBlogPosts';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';

function formatDate(dateStr: string, lang: string) {
  return new Date(dateStr).toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function BlogCard({ post }: { post: BlogPostSummary }) {
  const lang = useRouteLanguage();
  return (
    <LocalizedLink
      to={`/blog/${post.slug}`}
      className="group block bg-surface hover:bg-muted border border-divider transition-colors"
    >
      {post.coverImage?.url && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5">
        <h2 className="text-lg font-medium text-content-heading group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-content line-clamp-3 mb-3">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-content-subtle">
          <span>{post.author?.name}</span>
          <span className="w-1 h-1 rounded-full bg-content-faint" />
          <span>{formatDate(post.publishedAt || post.createdAt, lang)}</span>
          <span className="w-1 h-1 rounded-full bg-content-faint" />
          <span>{post.readingTimeMinutes} min</span>
        </div>
      </div>
    </LocalizedLink>
  );
}

function FeaturedPost({ post }: { post: BlogPostSummary }) {
  const lang = useRouteLanguage();
  return (
    <LocalizedLink
      to={`/blog/${post.slug}`}
      className="group block bg-surface hover:bg-muted border border-divider transition-colors"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {post.coverImage?.url && (
          <div className="aspect-[16/9] md:aspect-auto overflow-hidden">
            <img
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <span className="text-xs font-medium text-primary mb-3 uppercase tracking-wider">Blog</span>
          <h2 className="text-2xl md:text-3xl font-medium text-content-heading group-hover:text-primary transition-colors mb-3 leading-tight">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-content mb-4 line-clamp-3">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-content-subtle">
            <span>{post.author?.name}</span>
            <span className="w-1 h-1 rounded-full bg-content-faint" />
            <span>{formatDate(post.publishedAt || post.createdAt, lang)}</span>
            <span className="w-1 h-1 rounded-full bg-content-faint" />
            <span>{post.readingTimeMinutes} min</span>
          </div>
        </div>
      </div>
    </LocalizedLink>
  );
}

export function BlogListPage() {
  const { t } = useTranslation('common');
  const [allPosts, setAllPosts] = useState<BlogPostSummary[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const LIMIT = 12;

  const { posts, total, loading } = useBlogPosts(LIMIT, offset);

  useDocumentHead({
    title: 'Blog',
    description: 'Blog Pollar - artykuły, analizy i komentarze',
    ogImageType: 'blog',
  });

  // Append new posts
  useEffect(() => {
    if (posts.length > 0) {
      setAllPosts(prev => {
        const existingSlugs = new Set(prev.map(p => p.slug));
        const newPosts = posts.filter(p => !existingSlugs.has(p.slug));
        return [...prev, ...newPosts];
      });
      setHasMore(allPosts.length + posts.length < total);
    } else if (!loading && offset === 0) {
      setHasMore(false);
    }
  }, [posts, total, loading]);

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setOffset(prev => prev + LIMIT);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const featured = allPosts[0];
  const rest = allPosts.slice(1);

  return (
    <section className="max-w-[1400px] mx-auto px-0 lg:px-6 pb-10 -mt-3">
      <div className="border border-divider">
        {/* Header */}
        <div className="px-6 py-8 border-b border-divider">
          <h1 className="text-3xl md:text-4xl font-medium text-content-heading tracking-tight">Blog</h1>
          <p className="text-content-subtle mt-2">{t('blog.subtitle', 'Artykuły, analizy i komentarze')}</p>
        </div>

        {/* Featured post */}
        {featured && (
          <div className="border-b border-divider">
            <FeaturedPost post={featured} />
          </div>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <div
                key={post.slug}
                className={`${i % 3 !== 2 ? 'lg:border-r' : ''} ${i % 2 !== 1 ? 'md:border-r lg:border-r-0' : ''} border-b border-divider`}
              >
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size={32} />
          </div>
        )}

        {/* Empty state */}
        {!loading && allPosts.length === 0 && (
          <div className="text-center py-16">
            <i className="ri-article-line text-4xl text-content-faint mb-4 block" />
            <p className="text-content-subtle">{t('blog.noPostsYet', 'Brak artykułów')}</p>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="h-1" />
      </div>
    </section>
  );
}
