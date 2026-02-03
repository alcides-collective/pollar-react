import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { GrainImage } from '../common/GrainImage';
import powiazaniaImg from '../../assets/images/discover/powiazania.webp';
import sejmImg from '../../assets/images/discover/sejm.webp';
import gieldaImg from '../../assets/images/discover/gielda.webp';

interface DiscoverLink {
  path: string;
  title: string;
  description: string;
  gradient: string;
  image?: string;
}

const DISCOVER_LINKS: DiscoverLink[] = [
  {
    path: '/powiazania',
    title: 'Powiązania',
    description: 'Codzienna gra słowna. Znajdź ukryte połączenia między słowami i pogrupuj je w kategorie.',
    gradient: 'from-violet-500 to-purple-600',
    image: powiazaniaImg,
  },
  {
    path: '/sejm',
    title: 'Sejm',
    description: 'Śledź głosowania, projekty ustaw i aktywność posłów. Pełna transparentność prac parlamentu.',
    gradient: 'from-red-500 to-rose-600',
    image: sejmImg,
  },
  {
    path: '/gielda',
    title: 'Giełda',
    description: 'Notowania, analizy i prognozy rynkowe. Bądź na bieżąco z sytuacją na GPW.',
    gradient: 'from-emerald-500 to-teal-600',
    image: gieldaImg,
  },
];

function DiscoverCard({ link }: { link: DiscoverLink }) {
  return (
    <Link to={link.path} className="group block p-6 hover:bg-amber-100 transition-colors h-full">
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
                {link.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <span className="text-zinc-400 text-xs uppercase tracking-wide">Odkryj</span>
        <h3 className="text-zinc-900 font-semibold text-xl leading-tight group-hover:underline">
          {link.title}
        </h3>
        <p className="text-sm text-zinc-600 mt-2 leading-snug line-clamp-3">
          {link.description}
        </p>
      </article>
    </Link>
  );
}

export function DiscoverSection() {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 bg-amber-50"
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      {DISCOVER_LINKS.map((link, index) => {
        const isLast = index === DISCOVER_LINKS.length - 1;
        return (
          <motion.div
            key={link.path}
            className={`${isLast ? '' : 'border-b md:border-b-0 md:border-r'} border-zinc-200`}
            variants={staggerItem}
          >
            <DiscoverCard link={link} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
