import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useBlogPost } from '../../hooks/useBlogPost';
import { useBlogPosts, type BlogPostSummary } from '../../hooks/useBlogPosts';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { CcAttribution } from '../../components/common/CcAttribution';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';

// ─── TOC ─────────────────────────────────────────────────────────────

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const text = match[2].replace(/[*_`\[\]]/g, '');
    const id = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    items.push({ id, text, level: match[1].length });
  }
  return items;
}

function TableOfContents({ items }: { items: TocItem[] }) {
  const { t } = useTranslation('common');
  if (items.length === 0) return null;
  return (
    <nav className="bg-surface-alt rounded-xl border border-divider overflow-hidden">
      <div className="px-4 py-3 border-b border-divider bg-surface">
        <h2 className="text-sm font-semibold text-content-heading flex items-center gap-2">
          <i className="ri-list-ordered text-content-subtle" />
          {t('blog.tableOfContents', 'Spis treści')}
        </h2>
      </div>
      <div className="p-3 space-y-0.5">
        {items.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              history.replaceState(null, '', `#${item.id}`);
            }}
            className={`block text-sm text-content hover:text-primary transition-colors py-1 ${
              item.level === 3 ? 'pl-4' : ''
            }`}
          >
            {item.text}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ─── Share Buttons ───────────────────────────────────────────────────

function ShareButtons({ title, url }: { title: string; url: string }) {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-content-subtle">{t('blog.sharePost', 'Udostępnij')}:</span>
      <a
        href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface hover:bg-muted border border-divider transition-colors"
        title="X (Twitter)"
      >
        <i className="ri-twitter-x-line text-content" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface hover:bg-muted border border-divider transition-colors"
        title="Facebook"
      >
        <i className="ri-facebook-line text-content" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface hover:bg-muted border border-divider transition-colors"
        title="LinkedIn"
      >
        <i className="ri-linkedin-line text-content" />
      </a>
      <button
        onClick={handleCopy}
        className="h-9 px-3 flex items-center gap-1.5 rounded-lg bg-surface hover:bg-muted border border-divider transition-colors text-sm text-content"
        title={t('blog.copyLink', 'Kopiuj link')}
      >
        <i className={copied ? 'ri-check-line text-green-500' : 'ri-link'} />
        {copied ? t('blog.linkCopied', 'Skopiowano!') : t('blog.copyLink', 'Kopiuj link')}
      </button>
    </div>
  );
}

// ─── Related Posts ───────────────────────────────────────────────────

function RelatedPosts({ posts, currentSlug }: { posts: BlogPostSummary[]; currentSlug: string }) {
  const { t } = useTranslation('common');
  const filtered = posts.filter(p => p.slug !== currentSlug).slice(0, 3);
  if (filtered.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-divider">
      <h2 className="text-xl font-medium text-content-heading mb-6">
        {t('blog.relatedPosts', 'Więcej artykułów')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map(post => (
          <LocalizedLink
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="group block p-4 bg-surface hover:bg-muted rounded-lg border border-divider transition-colors"
          >
            {post.coverImage?.url && (
              <img
                src={post.coverImage.url}
                alt={post.coverImage.alt || post.title}
                className="w-full aspect-[16/9] object-cover rounded mb-3"
                loading="lazy"
              />
            )}
            <h3 className="font-medium text-content-heading group-hover:text-primary transition-colors line-clamp-2 mb-1">
              {post.title}
            </h3>
            <p className="text-xs text-content-subtle">
              {post.author?.name} · {post.readingTimeMinutes} min
            </p>
          </LocalizedLink>
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation('common');
  const lang = useRouteLanguage();
  const { post, loading, error } = useBlogPost(slug);
  const { posts: relatedPosts } = useBlogPosts(4);

  const toc = useMemo(() => post ? extractToc(post.content) : [], [post?.content]);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  // SEO
  useDocumentHead({
    title: post?.seo?.metaTitle || post?.title,
    description: post?.seo?.metaDescription || post?.excerpt,
    ogTitle: post?.seo?.ogTitle || post?.title,
    ogDescription: post?.seo?.ogDescription || post?.excerpt,
    ogImage: post?.seo?.ogImage || post?.coverImage?.url,
    ogImageType: 'blog',
    ogType: 'article',
    keywords: post?.seo?.keywords,
  });

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
            <div>
              <div className="h-6 w-32 bg-divider rounded mb-4" />
              <div className="h-12 w-3/4 bg-divider rounded mb-3" />
              <div className="h-12 w-1/2 bg-divider rounded mb-6" />
              <div className="h-64 w-full bg-divider rounded-lg mb-8" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-4 w-full bg-divider rounded" />
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="h-48 bg-divider rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
            <i className="ri-article-line text-2xl text-content-faint" />
          </div>
          <h1 className="text-xl font-medium text-content-heading mb-2">
            {error?.message === 'Blog post not found'
              ? t('blog.notFound', 'Post nie został znaleziony')
              : t('blog.loadError', 'Nie udało się załadować posta')}
          </h1>
          <LocalizedLink
            to="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mt-4"
          >
            <i className="ri-arrow-left-line" />
            {t('blog.backToList', 'Powrót do bloga')}
          </LocalizedLink>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString(
    lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'pl-PL',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
        {/* Main content */}
        <div className="py-8">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4 text-sm text-content-subtle">
              <LocalizedLink to="/blog" className="hover:text-primary transition-colors">Blog</LocalizedLink>
              <i className="ri-arrow-right-s-line text-content-faint" />
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-content-heading mb-5 leading-tight tracking-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-content mb-5 leading-relaxed">{post.excerpt}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-content-subtle mb-6">
              <span className="font-medium text-content">{post.author.name}</span>
              <span className="w-1 h-1 rounded-full bg-content-faint" />
              <span>{formattedDate}</span>
              <span className="w-1 h-1 rounded-full bg-content-faint" />
              <span>{post.readingTimeMinutes} {t('blog.readingTime', 'min czytania')}</span>
            </div>

            {post.coverImage?.url && (
              <img
                src={post.coverImage.url}
                alt={post.coverImage.alt || post.title}
                className="w-full aspect-[21/9] object-cover rounded-lg"
              />
            )}
          </header>

          {/* Markdown content */}
          <article className="prose prose-zinc dark:prose-invert prose-lg max-w-none
            prose-headings:scroll-mt-20 prose-headings:font-medium
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-lg prose-img:border prose-img:border-divider"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/ł/g, 'l')
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-');
                  return <h2 id={id} {...props}>{children}</h2>;
                },
                h3: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/ł/g, 'l')
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-');
                  return <h3 id={id} {...props}>{children}</h3>;
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </article>

          {/* Share */}
          <div className="mt-8 pt-6 border-t border-divider">
            <ShareButtons title={post.title} url={pageUrl} />
          </div>

          <CcAttribution />

          {/* Related posts (mobile shows below, desktop has sidebar) */}
          <div className="lg:hidden">
            <RelatedPosts posts={relatedPosts} currentSlug={post.slug} />
          </div>
        </div>

        {/* Sidebar (desktop) */}
        <div className="hidden lg:block py-8">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Author card */}
            <div className="bg-surface-alt rounded-xl border border-divider overflow-hidden">
              <div className="px-4 py-3 border-b border-divider bg-surface">
                <h2 className="text-sm font-semibold text-content-heading flex items-center gap-2">
                  <i className="ri-user-line text-content-subtle" />
                  {t('blog.author', 'Autor')}
                </h2>
              </div>
              <div className="p-4">
                <p className="font-medium text-content-heading">{post.author.name}</p>
              </div>
            </div>

            {/* Table of contents */}
            <TableOfContents items={toc} />

            {/* Related posts */}
            {relatedPosts.filter(p => p.slug !== post.slug).length > 0 && (
              <div className="bg-surface-alt rounded-xl border border-divider overflow-hidden">
                <div className="px-4 py-3 border-b border-divider bg-surface">
                  <h2 className="text-sm font-semibold text-content-heading flex items-center gap-2">
                    <i className="ri-article-line text-content-subtle" />
                    {t('blog.relatedPosts', 'Więcej artykułów')}
                  </h2>
                </div>
                <div className="p-3 space-y-2">
                  {relatedPosts
                    .filter(p => p.slug !== post.slug)
                    .slice(0, 3)
                    .map(p => (
                      <LocalizedLink
                        key={p.slug}
                        to={`/blog/${p.slug}`}
                        className="block p-3 bg-surface hover:bg-muted rounded-lg transition-colors"
                      >
                        <p className="text-sm font-medium text-content-heading line-clamp-2">{p.title}</p>
                        <p className="text-xs text-content-subtle mt-1">{p.readingTimeMinutes} min</p>
                      </LocalizedLink>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
