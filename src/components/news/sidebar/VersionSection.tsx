const changelog = [
  {
    icon: "ri-layout-4-line",
    title: "Nowy interfejs",
    description:
      "Zaprojektowany na nowo. Szybszy, bardziej responsywny i odporny na błędy. Zoptymalizowane ładowanie treści.",
  },
  {
    icon: "ri-user-line",
    title: "Konta użytkowników",
    description:
      "Zaloguj się, aby personalizować swoje doświadczenie. Twoje preferencje synchronizują się między urządzeniami.",
  },
  {
    icon: "ri-user-follow-line",
    title: "Śledzenie posłów",
    description:
      "Obserwuj wybranych posłów i bądź na bieżąco z ich aktywnością w Sejmie - głosowaniami, wystąpieniami i projektami ustaw.",
  },
  {
    icon: "ri-heart-line",
    title: "Ulubione kategorie",
    description:
      "Wybierz tematy, które Cię interesują. Algorytm dostosuje treści do Twoich preferencji.",
  },
  {
    icon: "ri-bookmark-line",
    title: "Zapisane artykuły",
    description:
      "Zapisuj interesujące artykuły do przeczytania później. Twoja lista jest zawsze pod ręką.",
  },
  {
    icon: "ri-notification-3-line",
    title: "Powiadomienia",
    description:
      "Przeprojektowany system powiadomień. Otrzymuj alerty o ważnych wydarzeniach bez zbędnego szumu.",
  },
  {
    icon: "ri-flashlight-line",
    title: "Najnowsze wiadomości",
    description:
      "Nowy panel z najświeższymi informacjami aktualizowany w czasie rzeczywistym.",
  },
  {
    icon: "ri-robot-line",
    title: "Felietony AI",
    description:
      "Autorskie analizy generowane przez Gemini. Polska polityka, geopolityka i ekonomia - aktualizowane dwa razy dziennie.",
  },
];

export function VersionSection() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-900 font-semibold">Co nowego</h3>
        <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
          v0.3.0
        </span>
      </div>
      <div className="space-y-3">
        {changelog.map((item) => (
          <div key={item.title}>
            <p className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
              <i className={`${item.icon} text-zinc-400`} />
              {item.title}
            </p>
            <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5 pl-[18px]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
