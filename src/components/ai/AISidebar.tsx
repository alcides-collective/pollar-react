import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, MessageSquare, PanelLeftClose, PanelLeft } from 'lucide-react';
import {
  useAIStore,
  useAIConversations,
  useAICurrentConversationId,
  useAISidebarOpen,
  type Conversation,
} from '../../stores/aiStore';

type DateGroupKey = 'today' | 'yesterday' | 'last7Days' | 'last30Days' | 'older';

// Group conversations by date
function groupConversationsByDate(
  conversations: Conversation[],
  t: (key: string) => string
) {
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;
  const monthAgo = today - 30 * 86400000;

  const groupKeys: DateGroupKey[] = ['today', 'yesterday', 'last7Days', 'last30Days', 'older'];
  const groups: { key: DateGroupKey; label: string; conversations: Conversation[] }[] = groupKeys.map(key => ({
    key,
    label: t(`sidebar.dateGroups.${key}`),
    conversations: [],
  }));

  for (const conv of conversations) {
    const date = conv.updatedAt;
    if (date >= today) {
      groups[0].conversations.push(conv);
    } else if (date >= yesterday) {
      groups[1].conversations.push(conv);
    } else if (date >= weekAgo) {
      groups[2].conversations.push(conv);
    } else if (date >= monthAgo) {
      groups[3].conversations.push(conv);
    } else {
      groups[4].conversations.push(conv);
    }
  }

  return groups.filter((g) => g.conversations.length > 0);
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  deleteLabel: string;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  deleteLabel,
}: ConversationItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className={`
        w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left
        transition-colors duration-150 group relative
        ${isActive
          ? 'bg-divider dark:bg-zinc-700'
          : 'hover:bg-surface dark:hover:bg-zinc-800'
        }
      `}
    >
      <MessageSquare className="w-4 h-4 shrink-0 text-content-subtle dark:text-zinc-400" />
      <span className="flex-1 text-sm text-content dark:text-zinc-200 truncate">
        {conversation.title}
      </span>
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 p-1 rounded hover:bg-divider dark:hover:bg-zinc-600
                     text-content-faint hover:text-red-500 dark:hover:text-red-400
                     transition-colors duration-150"
          aria-label={deleteLabel}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </button>
  );
}

export function AISidebar() {
  const { t } = useTranslation('ai');
  const conversations = useAIConversations();
  const currentId = useAICurrentConversationId();
  const isOpen = useAISidebarOpen();
  const {
    createConversation,
    selectConversation,
    deleteConversation,
    toggleSidebar,
  } = useAIStore();

  const groupedConversations = groupConversationsByDate(conversations, t);

  const closeSidebarOnMobile = useCallback(() => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      toggleSidebar();
    }
  }, [toggleSidebar]);

  const handleNewChat = () => {
    createConversation();
    closeSidebarOnMobile();
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    closeSidebarOnMobile();
  };

  // Collapsed state - show toggle column on desktop only (on mobile, header has the toggle)
  if (!isOpen) {
    return (
      <div className="hidden md:flex flex-col items-center h-full py-3 px-2 border-r border-divider dark:border-zinc-800 bg-surface dark:bg-zinc-900">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-surface dark:hover:bg-zinc-800
                     text-content-subtle dark:text-zinc-400 transition-colors duration-150"
          aria-label={t('sidebar.openPanel')}
        >
          <PanelLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNewChat}
          className="mt-2 p-2 rounded-lg hover:bg-surface dark:hover:bg-zinc-800
                     text-content-subtle dark:text-zinc-400 transition-colors duration-150"
          aria-label={t('sidebar.newConversation')}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={toggleSidebar}
      />

      {/* Sidebar panel - fixed overlay on mobile, inline on desktop */}
      <div className="fixed left-0 top-0 z-50 h-full w-72
                      md:relative md:z-auto md:w-64
                      flex flex-col border-r border-divider dark:border-zinc-800
                      bg-surface dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-divider dark:border-zinc-800">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-surface dark:hover:bg-zinc-800
                       text-content-subtle dark:text-zinc-400 transition-colors duration-150"
            aria-label={t('sidebar.closePanel')}
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
          <button
            onClick={handleNewChat}
            className="p-2 rounded-lg hover:bg-surface dark:hover:bg-zinc-800
                       text-content-subtle dark:text-zinc-400 transition-colors duration-150"
            aria-label={t('sidebar.newConversation')}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {groupedConversations.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-content-faint dark:text-zinc-500">
                {t('sidebar.noConversations')}
              </p>
              <button
                onClick={handleNewChat}
                className="mt-3 text-sm text-content dark:text-zinc-400 hover:text-content-heading dark:hover:text-zinc-200
                           transition-colors duration-150"
              >
                {t('sidebar.startNewConversation')}
              </button>
            </div>
          ) : (
            groupedConversations.map((group) => (
              <div key={group.key} className="mb-4">
                <h3 className="px-3 py-1.5 text-xs font-medium text-content-faint dark:text-zinc-500 uppercase tracking-wider">
                  {group.label}
                </h3>
                <div className="flex flex-col gap-0.5">
                  {group.conversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === currentId}
                      onSelect={() => handleSelectConversation(conv.id)}
                      onDelete={() => deleteConversation(conv.id)}
                      deleteLabel={t('sidebar.deleteConversation')}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
