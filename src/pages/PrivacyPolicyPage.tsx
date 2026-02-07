import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { LocalizedLink } from '@/components/LocalizedLink';
import { GrainImage } from '../components/common/GrainImage';
import privacyImg from '../assets/images/privacy.webp';

const bold = <strong />;

const SECTION_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11'] as const;

function stripNumber(title: string): string {
  return title.replace(/^\d+\.\s*/, '');
}

export function PrivacyPolicyPage() {
  const { t } = useTranslation('privacy');
  const [activeSection, setActiveSection] = useState<string>(SECTION_IDS[0]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-10% 0px -70% 0px' }
    );

    const el = contentRef.current;
    if (el) {
      SECTION_IDS.forEach(id => {
        const section = el.querySelector(`#${id}`);
        if (section) observer.observe(section);
      });
    }

    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const sections = SECTION_IDS.map(id => ({
    id,
    title: t(`${id}.title`),
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6 text-zinc-900">{t('title')}</h1>
        <GrainImage
          src={privacyImg}
          alt={t('imageAlt')}
          className="w-full aspect-[21/9] object-cover rounded-2xl not-prose"
        />
      </div>

      {/* Intro */}
      <div className="max-w-3xl mb-12 text-[15px] leading-relaxed">
        <p className="text-zinc-600 mb-3">{t('intro.p1')}</p>
        <p className="text-zinc-600 mb-3">
          <Trans i18nKey="intro.p2" ns="privacy" components={{ bold, pollarLink: <a href="https://pollar.news" className="text-red-600 hover:underline" /> }} />
        </p>
        <p className="text-zinc-600">{t('intro.p3')}</p>
      </div>

      {/* Mobile navigation */}
      <div className="lg:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-zinc-200 -mx-6 px-6 py-3 mb-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${
                activeSection === s.id
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {stripNumber(s.title)}
            </button>
          ))}
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-10 lg:gap-16">
        {/* Desktop sidebar */}
        <nav className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24 space-y-0.5">
            {sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`group w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-baseline gap-3 ${
                  activeSection === s.id
                    ? 'bg-zinc-900 text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <span className={`text-xs tabular-nums ${activeSection === s.id ? 'text-zinc-400' : 'text-zinc-300 group-hover:text-zinc-400'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {stripNumber(s.title)}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div ref={contentRef} className="flex-1 min-w-0 text-[15px] leading-relaxed">
          {/* Section 1 */}
          <section id="s1" className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">{t('s1.title')}</h2>
            <p className="text-zinc-600 mb-3">
              <Trans i18nKey="s1.p1" ns="privacy" components={{ bold }} />
            </p>
            <p className="text-zinc-600 mb-3">{t('s1.p2')}</p>
            <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
              <li>{t('s1.item1')}</li>
              <li>{t('s1.item2')}</li>
              <li>{t('s1.item3')}</li>
              <li>{t('s1.item4')}</li>
            </ul>
            <p className="text-zinc-600">
              <Trans i18nKey="s1.contact" ns="privacy" components={{ bold }} />
            </p>
          </section>

          {/* Section 2 */}
          <section id="s2" className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">{t('s2.title')}</h2>
            <p className="text-zinc-600 mb-3">
              <Trans i18nKey="s2.p1" ns="privacy" components={{ bold }} />
            </p>
            <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
              <li><Trans i18nKey="s2.directItem1" ns="privacy" components={{ bold }} /></li>
              <li><Trans i18nKey="s2.directItem2" ns="privacy" components={{ bold }} /></li>
              <li><Trans i18nKey="s2.directItem3" ns="privacy" components={{ bold }} /></li>
              <li><Trans i18nKey="s2.directItem4" ns="privacy" components={{ bold }} /></li>
            </ul>
            <p className="text-zinc-600 mb-3">
              <Trans i18nKey="s2.p2" ns="privacy" components={{ bold }} />
            </p>
            <ul className="list-disc pl-6 text-zinc-600">
              <li><Trans i18nKey="s2.indirectItem1" ns="privacy" components={{ bold }} /></li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="s3" className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">{t('s3.title')}</h2>
            <p className="text-zinc-600 mb-4">{t('s3.p1')}</p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s3.website.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
              <li>{t('s3.website.item1')}</li>
              <li>{t('s3.website.item2')}</li>
              <li>{t('s3.website.item3')}</li>
            </ul>
            <p className="text-zinc-500 italic mb-4">{t('s3.website.note')}</p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s3.apps.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
              <li>{t('s3.apps.item1')}</li>
              <li>{t('s3.apps.item2')}</li>
              <li>{t('s3.apps.item3')}</li>
              <li>{t('s3.apps.item4')}</li>
            </ul>
            <p className="text-zinc-500 italic mb-4">{t('s3.apps.note')}</p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s3.newsletter.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
              <li>{t('s3.newsletter.item1')}</li>
            </ul>
            <p className="text-zinc-500 italic mb-4">{t('s3.newsletter.note')}</p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s3.social.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
              <li>{t('s3.social.item1')}</li>
              <li>{t('s3.social.item2')}</li>
            </ul>
            <p className="text-zinc-500 italic mb-4">{t('s3.social.note')}</p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s3.author.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 space-y-1.5">
              <li>{t('s3.author.item1')}</li>
              <li>{t('s3.author.item2')}</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="s4" className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">{t('s4.title')}</h2>
            <p className="text-zinc-600 mb-4">{t('s4.p1')}</p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s4.website.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4">
              <li>{t('s4.website.item1')}</li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s4.apps.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-1.5">
              <li><Trans i18nKey="s4.apps.item1" ns="privacy" components={{ bold }} /></li>
              <li><Trans i18nKey="s4.apps.item2" ns="privacy" components={{ bold }} /></li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s4.newsletter.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4">
              <li>{t('s4.newsletter.item1')}</li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s4.social.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4">
              <li>{t('s4.social.item1')}</li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s4.author.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600">
              <li>{t('s4.author.item1')}</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="s5" className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">{t('s5.title')}</h2>
            <p className="text-zinc-600 mb-4">{t('s5.p1')}</p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s5.website.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-1.5">
              <li>{t('s5.website.item1')}</li>
              <li>{t('s5.website.item2')}</li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s5.apps.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-1.5">
              <li>{t('s5.apps.item1')}</li>
              <li>{t('s5.apps.item2')}</li>
              <li>{t('s5.apps.item3')}</li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s5.newsletter.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4">
              <li>{t('s5.newsletter.item1')}</li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s5.social.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-1.5">
              <li>{t('s5.social.item1')}</li>
              <li>{t('s5.social.item2')}</li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s5.author.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600">
              <li>{t('s5.author.item1')}</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="s6" className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">{t('s6.title')}</h2>
            <p className="text-zinc-600 mb-4">{t('s6.p1')}</p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s6.website.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4">
              <li>{t('s6.website.item1')}</li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s6.newsletter.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4">
              <li>{t('s6.newsletter.item1')}</li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s6.social.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4">
              <li>{t('s6.social.item1')}</li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s6.author.title')}</h3>
            <ul className="list-disc pl-6 text-zinc-600 mb-4">
              <li>{t('s6.author.item1')}</li>
            </ul>

            <p className="text-zinc-600 mb-3">
              <Trans i18nKey="s6.noDataSharing" ns="privacy" components={{ bold }} />
            </p>
            <p className="text-zinc-600">{t('s6.transfers')}</p>
          </section>

          {/* Section 7 */}
          <section id="s7" className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">{t('s7.title')}</h2>
            <p className="text-zinc-600 mb-3">{t('s7.p1')}</p>
            <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
              <li><Trans i18nKey="s7.item1" ns="privacy" components={{ bold }} /></li>
              <li><Trans i18nKey="s7.item2" ns="privacy" components={{ bold }} /></li>
              <li><Trans i18nKey="s7.item3" ns="privacy" components={{ bold }} /></li>
              <li><Trans i18nKey="s7.item4" ns="privacy" components={{ bold }} /></li>
              <li><Trans i18nKey="s7.item5" ns="privacy" components={{ bold }} /></li>
              <li><Trans i18nKey="s7.item6" ns="privacy" components={{ bold }} /></li>
              <li><Trans i18nKey="s7.item7" ns="privacy" components={{ bold }} /></li>
              <li><Trans i18nKey="s7.item8" ns="privacy" components={{ bold }} /></li>
            </ul>
            <p className="text-zinc-600">
              <Trans i18nKey="s7.contact" ns="privacy" components={{ bold }} />
            </p>
          </section>

          {/* Section 8 */}
          <section id="s8" className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">{t('s8.title')}</h2>
            <p className="text-zinc-600 mb-4">{t('s8.p1')}</p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s8.fbStats.title')}</h3>
            <p className="text-zinc-600 mb-3">{t('s8.fbStats.p1')}</p>
            <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-1">
              <li><a href="https://pl-pl.facebook.com/privacy/explanation" className="text-red-600 hover:underline">{t('s8.fbStats.fbLink')}</a></li>
              <li><a href="https://pl-pl.facebook.com/help/instagram/519522125107875" className="text-red-600 hover:underline">{t('s8.fbStats.igLink')}</a></li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s8.ga.title')}</h3>
            <p className="text-zinc-600 mb-4">
              <Trans i18nKey="s8.ga.p1" ns="privacy" components={{ gaLink: <a href="https://policies.google.com/technologies/partner-sites?hl=pl" className="text-red-600 hover:underline" /> }} />
            </p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s8.gads.title')}</h3>
            <p className="text-zinc-600 mb-4">
              <Trans i18nKey="s8.gads.p1" ns="privacy" components={{ gadsLink: <a href="https://policies.google.com/technologies/ads?hl=pl" className="text-red-600 hover:underline" /> }} />
            </p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s8.fbPixel.title')}</h3>
            <p className="text-zinc-600 mb-4">
              <Trans i18nKey="s8.fbPixel.p1" ns="privacy" components={{ fbPixelLink: <a href="https://pl-pl.facebook.com/help/443357099140264?helpref=about_content" className="text-red-600 hover:underline" /> }} />
            </p>

            <h3 className="font-semibold mt-6 mb-3 text-zinc-800">{t('s8.fbAds.title')}</h3>
            <p className="text-zinc-600">
              <Trans i18nKey="s8.fbAds.p1" ns="privacy" components={{ fbAdsLink: <a href="https://www.facebook.com/privacy/policy" className="text-red-600 hover:underline" /> }} />
            </p>
          </section>

          {/* Section 9 */}
          <section id="s9" className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">{t('s9.title')}</h2>
            <p className="text-zinc-600 mb-3">{t('s9.p1')}</p>
            <ul className="list-disc pl-6 text-zinc-600 space-y-1">
              <li><a href="https://pl-pl.facebook.com/privacy/explanation" className="text-red-600 hover:underline">{t('s9.fbLink')}</a></li>
              <li>
                <a href="https://policies.google.com/privacy?hl=pl" className="text-red-600 hover:underline">{t('s9.ytPrivacy')}</a>
                {' '}
                <a href="https://www.youtube.com/t/terms_dataprocessing" className="text-red-600 hover:underline">{t('s9.ytTerms')}</a>
              </li>
              <li><a href="https://www.tiktok.com/legal/privacy-policy?lang=pl" className="text-red-600 hover:underline">{t('s9.tiktokLink')}</a></li>
            </ul>
          </section>

          {/* Section 10 - Cookies */}
          <section id="s10" className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">{t('s10.title')}</h2>
            <p className="text-zinc-600 mb-3">{t('s10.p1')}</p>
            <p className="text-zinc-600 mb-3">{t('s10.p2')}</p>
            <p className="text-zinc-600 mb-3">{t('s10.p3')}</p>
            <p className="text-zinc-600 mb-3">
              <Trans i18nKey="s10.p4" ns="privacy" components={{ bold }} />
            </p>
            <p className="text-zinc-600 mb-4">{t('s10.p5')}</p>

            <div className="overflow-x-auto rounded-lg border border-zinc-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="border-b border-zinc-200 px-3 py-2.5 text-left font-semibold text-zinc-900">{t('s10.tableHeaders.name')}</th>
                    <th className="border-b border-zinc-200 px-3 py-2.5 text-left font-semibold text-zinc-900">{t('s10.tableHeaders.domain')}</th>
                    <th className="border-b border-zinc-200 px-3 py-2.5 text-left font-semibold text-zinc-900">{t('s10.tableHeaders.description')}</th>
                    <th className="border-b border-zinc-200 px-3 py-2.5 text-left font-semibold text-zinc-900">{t('s10.tableHeaders.retention')}</th>
                    <th className="border-b border-zinc-200 px-3 py-2.5 text-left font-semibold text-zinc-900">{t('s10.tableHeaders.technology')}</th>
                    <th className="border-b border-zinc-200 px-3 py-2.5 text-left font-semibold text-zinc-900">{t('s10.tableHeaders.type')}</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-600">
                  <CookieRow name="_ga" domain=".pollar.pl" cookieKey="ga" t={t} tech="Cookie" />
                  <CookieRow name="_ga_*" domain=".pollar.pl" cookieKey="gaStar" t={t} tech="Cookie" />
                  <CookieRow name="guest_id_marketing" domain=".twitter.com" cookieKey="guestIdMarketing" t={t} tech="Cookie" />
                  <CookieRow name="guest_id_ads" domain=".twitter.com" cookieKey="guestIdAds" t={t} tech="Cookie" />
                  <CookieRow name="personalization_id" domain=".twitter.com" cookieKey="personalizationId" t={t} tech="Cookie" />
                  <CookieRow name="guest_id" domain=".twitter.com" cookieKey="guestId" t={t} tech="Cookie" />
                  <CookieRow name="muc_ads" domain=".t.co" cookieKey="mucAds" t={t} tech="Cookie" />
                  <CookieRow name="cookie-consent" domain="pollar.pl" cookieKey="cookieConsent" t={t} tech="localStorage" />
                  <CookieRow name="pollar_uid" domain="pollar.pl" cookieKey="pollarUid" t={t} tech="localStorage" />
                  <CookieRow name="pollar-visitor-id" domain="pollar.pl" cookieKey="pollarVisitorId" t={t} tech="localStorage" />
                  <CookieRow name="pollar-language" domain="pollar.pl" cookieKey="pollarLanguage" t={t} tech="localStorage" />
                  <CookieRow name="stock-watchlist" domain="pollar.pl" cookieKey="stockWatchlist" t={t} tech="localStorage" />
                  <CookieRow name="pollar.powiazania" domain="pollar.pl" cookieKey="pollarPowiazania" t={t} tech="localStorage" />
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 11 */}
          <section id="s11" className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900">{t('s11.title')}</h2>
            <p className="text-zinc-600 mb-3">{t('s11.p1')}</p>
            <p className="text-zinc-600 mb-3">{t('s11.p2')}</p>
            <p className="text-zinc-600 font-semibold">{t('s11.effectiveDate')}</p>
          </section>

          {/* Cookie settings footer */}
          <section className="mt-12 pt-8 border-t border-zinc-200">
            <div className="bg-zinc-50 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-1">{t('cookieSettingsFooter.title')}</h3>
                <p className="text-sm text-zinc-600">{t('cookieSettingsFooter.description')}</p>
              </div>
              <LocalizedLink
                to="/cookies"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
              >
                {t('cookieSettingsFooter.button')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </LocalizedLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

interface CookieRowProps {
  name: string;
  domain: string;
  cookieKey: string;
  t: (key: string) => string;
  tech: string;
}

function CookieRow({ name, domain, cookieKey, t, tech }: CookieRowProps) {
  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-3 py-2">{name}</td>
      <td className="px-3 py-2">{domain}</td>
      <td className="px-3 py-2">{t(`s10.cookies.${cookieKey}.description`)}</td>
      <td className="px-3 py-2">{t(`s10.cookies.${cookieKey}.retention`)}</td>
      <td className="px-3 py-2">{tech}</td>
      <td className="px-3 py-2">{t(`s10.cookies.${cookieKey}.type`)}</td>
    </tr>
  );
}
