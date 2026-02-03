const changelog = [
  {
    title: "Nowy interfejs",
    description:
      "Przeprojektowany od podstaw. Szybszy, bardziej responsywny i odporny na błędy. Zoptymalizowane ładowanie treści.",
  },
  {
    title: "Konta użytkowników",
    description:
      "Zaloguj się, aby personalizować swoje doświadczenie. Twoje preferencje synchronizują się między urządzeniami.",
  },
  {
    title: "Śledzenie posłów",
    description:
      "Obserwuj wybranych posłów i bądź na bieżąco z ich aktywnością w Sejmie - głosowaniami, wystąpieniami i projektami ustaw.",
  },
  {
    title: "Ulubione kategorie",
    description:
      "Wybierz tematy, które Cię interesują. Algorytm dostosuje treści do Twoich preferencji.",
  },
  {
    title: "Powiadomienia",
    description:
      "Przeprojektowany system powiadomień. Otrzymuj alerty o ważnych wydarzeniach bez zbędnego szumu.",
  },
  {
    title: "Najnowsze wiadomości",
    description:
      "Nowy panel z najświeższymi informacjami aktualizowany w czasie rzeczywistym.",
  },
  {
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
          v3.0.0
        </span>
      </div>
      <div className="space-y-3">
        {changelog.map((item) => (
          <div key={item.title}>
            <p className="text-xs font-medium text-zinc-700">{item.title}</p>
            <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
