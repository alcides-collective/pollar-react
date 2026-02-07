import { useTranslation } from 'react-i18next';
import { GrainImage } from '../common/GrainImage';
import { SectionWrapper } from '../common/SectionWrapper';
import { LocalizedLink } from '../LocalizedLink';
import { AnimatedUnderline } from '../common/AnimatedUnderline';
import powiazaniaImg from '../../assets/images/discover/powiazania.webp';
import sejmImg from '../../assets/images/discover/sejm.webp';
import gieldaImg from '../../assets/images/discover/gielda.webp';

interface DiscoverLink {
  path: string;
  titleKey: string;
  descriptionKey: string;
  gradient: string;
  image?: string;
}

const DISCOVER_LINKS: DiscoverLink[] = [
  {
    path: '/powiazania',
    titleKey: 'discover.powiazania.title',
    descriptionKey: 'discover.powiazania.description',
    gradient: 'from-violet-500 to-purple-600',
    image: powiazaniaImg,
  },
  {
    path: '/sejm',
    titleKey: 'discover.sejm.title',
    descriptionKey: 'discover.sejm.description',
    gradient: 'from-red-500 to-rose-600',
    image: sejmImg,
  },
  {
    path: '/gielda',
    titleKey: 'discover.gielda.title',
    descriptionKey: 'discover.gielda.description',
    gradient: 'from-emerald-500 to-teal-600',
    image: gieldaImg,
  },
];

function DiscoverCard({ link, t }: { link: DiscoverLink; t: (key: string) => string }) {
  const title = t(link.titleKey);
  const description = t(link.descriptionKey);

  return (
    <LocalizedLink to={link.path} className="group/underline block p-6 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors h-full">
      <article>
        <div className="mb-4">
          {link.image ? (
            <GrainImage
              src={link.image}
              className="w-full aspect-video object-cover"
              groupHover
            />
          ) : (
            <div className={`bg-gradient-to-br ${link.gradient} aspect-video flex items-center justify-center`}>
              <span className="text-white text-4xl font-bold opacity-30 group-hover:opacity-50 transition-opacity">
                {title.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <span className="text-content-faint text-xs uppercase tracking-wide">{t('discover.title')}</span>
        <h3 className="text-content-heading font-semibold text-xl leading-tight">
          <AnimatedUnderline>{title}</AnimatedUnderline>
        </h3>
        <p className="text-sm text-content mt-2 leading-snug line-clamp-3">
          {description}
        </p>
      </article>
    </LocalizedLink>
  );
}

export function DiscoverSection() {
  const { t } = useTranslation('common');

  return (
    <SectionWrapper
      sectionId="discover-section"
      priority="low"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 bg-amber-50 dark:bg-amber-950/40">
        {DISCOVER_LINKS.map((link, index) => {
          const isLast = index === DISCOVER_LINKS.length - 1;
          return (
            <div
              key={link.path}
              className={`${isLast ? '' : 'border-b md:border-b-0 md:border-r'} border-divider`}
            >
              <DiscoverCard link={link} t={t} />
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
