import { useState } from 'react';
import type { Event } from '../../types/events';

interface CategoryTabsProps {
  groups: Array<[string, Event[]]>;
}

export function CategoryTabs({ groups }: CategoryTabsProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const selectedGroup = groups[selectedTab];

  if (groups.length === 0) return null;

  return (
    <div>
      <div className="flex items-center border-b border-zinc-200">
        {groups.map(([_, events], index) => (
          <button
            key={index}
            onClick={() => setSelectedTab(index)}
            className={`text-sm px-6 py-4 transition-colors border-r border-zinc-200 last:border-r-0 ${
              selectedTab === index
                ? 'text-zinc-900 font-bold bg-zinc-50'
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {events[0]?.metadata?.ultraShortHeadline || events[0]?.category}
          </button>
        ))}
      </div>

      {selectedGroup && (
        <div className="flex">
          {selectedGroup[1][0] && (
            <article className="group cursor-pointer flex gap-4 flex-[2] p-6 border-r border-zinc-200">
              {selectedGroup[1][0].imageUrl && (
                <div className="w-80 shrink-0">
                  <img
                    src={selectedGroup[1][0].imageUrl}
                    alt=""
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}
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
          )}
          <div className="flex-1 divide-y divide-zinc-200">
            {selectedGroup[1].slice(1).map((event) => (
              <article
                key={event.id}
                className="group cursor-pointer p-6 hover:bg-zinc-50 transition-colors"
              >
                <h4 className="text-zinc-600 text-sm leading-tight group-hover:underline">
                  {event.title}
                </h4>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
