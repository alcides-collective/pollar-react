export function CcAttribution() {
  return (
    <section className="mt-8 mb-4 pt-6 border-t border-divider text-center">
      <a
        href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
        target="_blank"
        rel="license noopener noreferrer"
        className="group inline-flex items-center gap-3 text-content-faint hover:text-content-subtle transition-colors"
      >
        <div className="flex items-center gap-0.5 shrink-0 text-base">
          <i className="ri-creative-commons-line" />
          <i className="ri-creative-commons-by-line" />
          <i className="ri-creative-commons-nc-line" />
          <i className="ri-creative-commons-sa-line" />
        </div>
        <span className="text-xs">
          <span className="font-medium text-content-subtle group-hover:text-content transition-colors">
            CC BY-NC-SA 4.0
          </span>
          {' '}&middot; Pollar News (pollar.news)
        </span>
      </a>
    </section>
  );
}
