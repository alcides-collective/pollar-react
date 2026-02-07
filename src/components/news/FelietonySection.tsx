import type { Felieton, FelietonCategory } from '../../types/felieton';
import { FELIETON_CATEGORY_NAMES } from '../../types/felieton';
import { GrainImage } from '../common/GrainImage';
import { SectionWrapper } from '../common/SectionWrapper';
import { LocalizedLink } from '../LocalizedLink';
import { AnimatedUnderline } from '../common/AnimatedUnderline';
import { felietonPath } from '../../utils/slug';
import ekonomiaImg from '../../assets/images/felietony/ekonomia.webp';
import geopolitykaImg from '../../assets/images/felietony/geopolityka.webp';
import polskaPolitykImg from '../../assets/images/felietony/polska-polityka.webp';

const FELIETON_IMAGES: Record<FelietonCategory, string> = {
  'ekonomia': ekonomiaImg,
  'geopolityka': geopolitykaImg,
  'polska-polityka': polskaPolitykImg,
};

interface FelietonySectionProps {
  felietony: Felieton[];
}

function FelietonCard({ felieton }: { felieton: Felieton }) {
  const categoryName = FELIETON_CATEGORY_NAMES[felieton.category];
  const imageSrc = FELIETON_IMAGES[felieton.category];

  return (
    <LocalizedLink to={felietonPath(felieton)} className="group/underline block p-6 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors h-full">
      <article>
        <div className="mb-4">
          <GrainImage
            src={imageSrc}
            className="w-full aspect-video object-cover"
            groupHover
            width={400}
            height={225}
          />
        </div>
        <span className="text-content-faint text-xs">{categoryName}</span>
        <h3 className="text-content-heading font-semibold text-xl leading-tight">
          <AnimatedUnderline>{felieton.title}</AnimatedUnderline>
        </h3>
        <p className="text-sm text-content mt-2 leading-snug line-clamp-3">
          {felieton.lead}
        </p>
      </article>
    </LocalizedLink>
  );
}

function PlaceholderCard({ category }: { category: FelietonCategory }) {
  const categoryName = FELIETON_CATEGORY_NAMES[category];
  const imageSrc = FELIETON_IMAGES[category];

  return (
    <div className="p-6 opacity-50 h-full">
      <article>
        <div className="mb-4 grayscale">
          <GrainImage
            src={imageSrc}
            className="w-full aspect-video object-cover"
            width={400}
            height={225}
          />
        </div>
        <span className="text-content-faint text-xs">{categoryName}</span>
        <h3 className="text-content-faint font-semibold text-xl leading-tight">
          Felieton w przygotowaniu...
        </h3>
      </article>
    </div>
  );
}

export function FelietonySection({ felietony }: FelietonySectionProps) {
  const categories: FelietonCategory[] = ['ekonomia', 'geopolityka', 'polska-polityka'];

  const felietonyByCategory = new Map(
    felietony.map((f) => [f.category, f])
  );

  return (
    <SectionWrapper
      sectionId="felietony-section"
      priority="low"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 bg-sky-50 dark:bg-sky-950/40">
        {categories.map((category, index) => {
          const felieton = felietonyByCategory.get(category);
          const isLast = index === categories.length - 1;
          return (
            <div
              key={category}
              className={`${isLast ? '' : 'border-b md:border-b-0 md:border-r'} border-divider`}
            >
              {felieton ? (
                <FelietonCard felieton={felieton} />
              ) : (
                <PlaceholderCard category={category} />
              )}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
