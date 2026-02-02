export function ContactSection() {
  return (
    <div className="p-6">
      <h3 className="text-zinc-900 font-semibold mb-4">Kim jesteśmy</h3>
      <div className="text-sm text-zinc-600 leading-relaxed mb-6 space-y-3">
        <p>Pollar tworzą Jakub Dudek i Bartosz Kasprzycki.</p>
        <p>Jakub, programista z Krakowa, buduje całą stronę techniczną — od interfejsu po serwery — dbając, by wszystko działało szybko, sprawnie i niezawodnie.</p>
        <p>Bartosz odpowiada za produkt i marketing — pilnuje, by każda interakcja z Pollarem była intuicyjna i nie zabierała więcej czasu niż trzeba.</p>
        <p>Cel jest wspólny: pomóc ludziom być na bieżąco bez przytłaczania ich nadmiarem informacji. Projekt jest w fazie bety — jeśli masz pomysł lub zauważysz błąd, napisz.</p>
      </div>

      <h4 className="text-zinc-900 font-semibold mb-2">Masz uwagi?</h4>
      <p className="text-sm text-zinc-600 leading-relaxed mb-3">
        Chętnie wysłuchamy Twoich sugestii, pomysłów lub zgłoszeń błędów. Napisz bezpośrednio na maila.
      </p>
      <div className="flex flex-col gap-1">
        <a
          href="mailto:jakub@pollar.pl"
          className="text-sm text-zinc-900 hover:underline"
        >
          jakub@pollar.pl
        </a>
        <a
          href="mailto:bartosz@pollar.pl"
          className="text-sm text-zinc-900 hover:underline"
        >
          bartosz@pollar.pl
        </a>
      </div>
    </div>
  );
}
