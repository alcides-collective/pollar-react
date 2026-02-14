import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useUser } from '@/stores/authStore';
import { useFavoriteCategories, useFollowedMPIds, useUserProfile } from '@/stores/userStore';
import {
  useOnboardingStore,
  useChecklistItems,
  useChecklistProgress,
  useChecklistDismissed,
  useTourCompleted,
  useTourSkipped,
  type ChecklistItemKey,
} from '@/stores/onboardingStore';
import { updateUserOnboarding } from '@/services/userService';

const CHECKLIST_CONFIG: {
  key: ChecklistItemKey;
  icon: string;
  link?: string;
}[] = [
  { key: 'favorite_categories', icon: 'ri-star-line' },
  { key: 'ai_companion', icon: 'ri-robot-2-line', link: '/asystent' },
  { key: 'read_brief', icon: 'ri-newspaper-line', link: '/brief' },
  { key: 'follow_mp', icon: 'ri-user-follow-line', link: '/sejm/poslowie' },
  { key: 'newsletter', icon: 'ri-mail-line' },
];

function fireConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;pointer-events:none';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b', '#818cf8', '#c084fc'];
  const particles = Array.from({ length: 60 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 200,
    y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -14 - 4,
    size: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
  }));

  let frame = 0;
  const maxFrames = 90;

  function animate() {
    if (frame >= maxFrames) {
      canvas.remove();
      return;
    }
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.vy += 0.3;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      const opacity = 1 - frame / maxFrames;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.fillStyle = p.color;
      ctx!.globalAlpha = opacity;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx!.restore();
    }
    frame++;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

export function OnboardingChecklist() {
  const { t } = useTranslation('onboarding');
  const user = useUser();
  const profile = useUserProfile();
  const items = useChecklistItems();
  const { completed, total } = useChecklistProgress();
  const dismissed = useChecklistDismissed();
  const tourCompleted = useTourCompleted();
  const tourSkipped = useTourSkipped();
  const favoriteCategories = useFavoriteCategories();
  const followedMPIds = useFollowedMPIds();
  const confettiFiredRef = useRef(false);
  const mountedRef = useRef(false);

  // Auto-detect completion from user store state
  useEffect(() => {
    const store = useOnboardingStore.getState();
    if (favoriteCategories.length > 0 && !items.favorite_categories) {
      store.markChecklistItem('favorite_categories');
    }
    if (followedMPIds.length > 0 && !items.follow_mp) {
      store.markChecklistItem('follow_mp');
    }
    if (profile?.consentMarketingAcceptedAt && !items.newsletter) {
      store.markChecklistItem('newsletter');
    }
  }, [favoriteCategories, followedMPIds, profile?.consentMarketingAcceptedAt, items]);

  // Fire confetti on 100% completion
  useEffect(() => {
    if (completed === total && completed > 0 && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      fireConfetti();
    }
  }, [completed, total]);

  // Persist checklist to Firestore (skip initial mount to avoid unnecessary writes)
  useEffect(() => {
    if (!user?.uid) return;
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const state = useOnboardingStore.getState();
    updateUserOnboarding(user.uid, {
      checklistItems: state.checklistItems,
      checklistDismissed: state.checklistDismissed,
    });
  }, [items, dismissed, user?.uid]);

  const handleDismiss = useCallback(() => {
    useOnboardingStore.getState().dismissChecklist();
  }, []);

  // Don't show if:
  // - Not logged in
  // - Already dismissed
  // - User never interacted with onboarding (old user who registered before this feature)
  //   → They have no tour data and no onboarding field in Firestore
  const hasOnboardingHistory = tourCompleted || tourSkipped || profile?.onboarding != null;
  if (!user || dismissed || !hasOnboardingHistory) return null;

  // Hide after all items are completed (auto-dismiss after viewing completion state once)
  if (completed === total && completed > 0) {
    // Still show the completed state so user can see confetti + message
    // They can dismiss it manually
  }

  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <section className="bg-surface-alt border border-divider rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-content-heading">
          {t('checklist.title')}
        </h3>
        <button
          onClick={handleDismiss}
          className="text-content-subtle hover:text-content text-xs transition-colors"
        >
          {t('checklist.dismiss')}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-content-subtle">
            {t('checklist.progress', { completed, total })}
          </span>
          <span className="text-xs text-content-subtle">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="h-1.5 bg-zinc-800 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Completed message */}
      {completed === total && (
        <p className="text-xs text-emerald-500 mb-3 font-medium">
          {t('checklist.completed')}
        </p>
      )}

      {/* Checklist items */}
      <div className="space-y-1.5">
        {CHECKLIST_CONFIG.map(({ key, icon, link }) => {
          const isCompleted = items[key];
          return (
            <div
              key={key}
              className={`flex items-center gap-2.5 py-1.5 px-2 rounded-md transition-colors ${
                isCompleted ? 'opacity-60' : 'hover:bg-surface'
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : 'border border-zinc-600 text-transparent'
              }`}>
                {isCompleted && (
                  <i className="ri-check-line text-xs" />
                )}
              </div>
              <i className={`${icon} text-sm ${isCompleted ? 'text-content-subtle' : 'text-content-faint'}`} />
              <span className={`text-xs flex-1 ${
                isCompleted ? 'text-content-subtle line-through' : 'text-content'
              }`}>
                {t(`checklist.items.${key}`)}
              </span>
              {!isCompleted && link && (
                <LocalizedLink
                  to={link}
                  className="text-[10px] text-content-faint hover:text-content-heading transition-colors"
                >
                  {t(`checklist.links.${key}`)}
                </LocalizedLink>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
