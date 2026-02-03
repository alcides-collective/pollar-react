import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Event } from '../../types/events';
import { tabContentAnimation } from '@/lib/animations';
import { EventImage } from '../common/EventImage';

interface CategoryTabsProps {
  groups: Array<[string, Event[]]>;
}

export function CategoryTabs({ groups }: CategoryTabsProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const selectedGroup = groups[selectedTab];

  if (groups.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-2 md:flex md:items-center md:border-b border-zinc-200">
        {groups.map(([_, events], index) => (
          <button
            key={index}
            onClick={() => setSelectedTab(index)}
            className={`relative text-xs md:text-sm px-4 py-3 md:px-6 md:py-4 transition-colors border-b md:border-b-0 border-r border-zinc-200 even:border-r-0 md:even:border-r md:last:border-r-0 ${
              selectedTab === index
                ? 'text-zinc-900 font-bold bg-zinc-50'
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {events[0]?.metadata?.ultraShortHeadline || events[0]?.category}
            {selectedTab === index && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 hidden md:block"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>

      <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }}>
        <AnimatePresence mode="wait">
          {selectedGroup && (
            <motion.div
              key={selectedTab}
              className="flex flex-col md:flex-row"
              variants={tabContentAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {selectedGroup[1][0] && (
                <Link to={`/event/${selectedGroup[1][0].id}`} className="group flex gap-4 md:flex-[2] p-6 border-b md:border-b-0 md:border-r border-zinc-200">
                  <article className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-80 md:shrink-0 overflow-hidden">
                      <EventImage
                        event={selectedGroup[1][0]}
                        className="w-full aspect-video object-cover"
                        hoverScale={1.03}
                      />
                    </div>
                    <div>
                      <span className="text-zinc-400 text-xs">{selectedGroup[1][0].category}</span>
                      <h4 className="text-zinc-900 font-semibold text-xl leading-tight group-hover:underline">
                        {selectedGroup[1][0].title}
                      </h4>
                      <p className="text-sm text-zinc-600 mt-2 leading-snug">
                        {selectedGroup[1][0].lead}
                      </p>
                    </div>
                  </article>
                </Link>
              )}
              <div className="flex-1 divide-y divide-zinc-200">
                {selectedGroup[1].slice(1).map((event) => (
                  <Link
                    key={event.id}
                    to={`/event/${event.id}`}
                    className="group block p-6 hover:bg-zinc-50 transition-colors"
                  >
                    <h4 className="text-zinc-600 text-sm leading-tight group-hover:underline">
                      {event.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
