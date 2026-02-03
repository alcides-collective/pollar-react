import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProStore } from '@/stores/proStore';

const features = [
  { icon: 'ri-magic-line', text: 'Spersonalizowany Daily Brief' },
  { icon: 'ri-search-line', text: 'Brak limitów wyszukiwania' },
  { icon: 'ri-government-line', text: 'Śledzenie posłów i Sejmu' },
  { icon: 'ri-download-line', text: 'Export danych CSV/PDF' },
  { icon: 'ri-archive-line', text: 'Pełne archiwum wydarzeń' },
  { icon: 'ri-eye-off-line', text: 'Brak reklam' },
  { icon: 'ri-moon-line', text: 'Dark mode' },
  { icon: 'ri-message-2-line', text: 'Priorytetowe wsparcie' },
];

export function ProModal() {
  const isOpen = useProStore((s) => s.isProModalOpen);
  const closeModal = useProStore((s) => s.closeProModal);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pollar Pro</DialogTitle>
          <DialogDescription>
            Odblokuj pełny potencjał platformy
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 my-4">
          {features.map((feature) => (
            <li key={feature.text} className="flex items-center gap-3 text-sm">
              <i className={`${feature.icon} text-zinc-400`} />
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>

        <div className="border-t pt-4">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-2xl font-semibold">13,99 zł</span>
            <span className="text-sm text-zinc-500">/ miesiąc</span>
          </div>
          <Button className="w-full" disabled>
            Wkrótce
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
