import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '@/components/LocalizedLink';
import { motion, AnimatePresence } from 'framer-motion';
import type { Event } from '../../types/events';
import { getImageSource } from '@/lib/imageSource';
import { EventImage } from '../common/EventImage';
import { AnimateHeight } from '../common/AnimateHeight';
import { SectionWrapper } from '../common/SectionWrapper';
import { AnimatedUnderline } from '../common/AnimatedUnderline';
import { eventPath } from '../../utils/slug';

interface CategoryTabsProps {
  groups: Array<[string, Event[]]>;
}

export function CategoryTabs({ groups }: CategoryTabsProps) {
  const { t } = useTranslation('common');
  const [selectedTab, setSelectedTab] = useState(0);
  const selectedGroup = groups[selectedTab];

  if (groups.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-2 md:flex md:items-center md:border-b border-divider">
        {groups.map(([_, events], index) => (
          <button
            key={index}
            onClick={() => setSelectedTab(index)}
            className={`relative text-xs md:text-sm px-4 py-3 md:px-6 md:py-4 transition-colors border-b md:border-b-0 border-r border-divider even:border-r-0 md:even:border-r md:last:border-r-0 ${
              selectedTab === index
                ? 'text-content-heading font-bold bg-surface'
                : 'text-content-subtle hover:text-content hover:bg-surface'
            }`}
          >
            {events[0]?.metadata?.ultraShortHeadline || t(`categories.${events[0]?.category}`, { defaultValue: events[0]?.category })}
            {selectedTab === index && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary hidden md:block"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimateHeight>
        <AnimatePresence mode="wait" initial={false}>
          {selectedGroup && (
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SectionWrapper
                sectionId={`category-tabs-${selectedTab}-${selectedGroup[1][0]?.id || 'empty'}`}
                priority="auto"
              >
                <div className="flex flex-col md:flex-row">
                  {selectedGroup[1][0] && (
                <LocalizedLink to={eventPath(selectedGroup[1][0])} className="group/underline flex gap-4 md:flex-[2] p-6 border-b md:border-b-0 md:border-r border-divider">
                  <article className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-80 md:shrink-0">
                      <div className="relative">
                        <EventImage
                          event={selectedGroup[1][0]}
                          className="w-full aspect-video object-cover"
                          groupHover
                        />
                        {getImageSource(selectedGroup[1][0]) && (
                          <span className="absolute bottom-2 left-2 text-[10px] text-content/80 bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded z-10 max-w-[calc(100%-1rem)] truncate">
                            Źródło: {getImageSource(selectedGroup[1][0])}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-content-faint text-xs">{t(`categories.${selectedGroup[1][0].category}`, { defaultValue: selectedGroup[1][0].category })}</span>
                      <h4 className="text-content-heading font-semibold text-xl leading-tight">
                        <AnimatedUnderline>{selectedGroup[1][0].title}</AnimatedUnderline>
                      </h4>
                      <p className="text-sm text-content mt-2 leading-snug">
                        {selectedGroup[1][0].lead}
                      </p>
                    </div>
                  </article>
                </LocalizedLink>
              )}
              <div className="flex-1">
                {selectedGroup[1].slice(1).map((event) => (
                  <LocalizedLink
                    key={event.id}
                    to={eventPath(event)}
                    className="group/underline block p-6 hover:bg-surface transition-colors border-b border-divider"
                  >
                    <h4 className="text-content text-sm leading-tight">
                      <AnimatedUnderline>{event.title}</AnimatedUnderline>
                    </h4>
                  </LocalizedLink>
                ))}
                </div>
              </div>
              </SectionWrapper>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimateHeight>
    </div>
  );
}
