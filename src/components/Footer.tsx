export function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div>
            <h4 className="text-white font-semibold mb-4">Rynki</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-white transition-colors">Akcje</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Waluty</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Surowce</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Obligacje</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Crypto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Sekcje</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-white transition-colors">Ekonomia</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Przemysł</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Technologia</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Polityka</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Finanse</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Media</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-white transition-colors">Na żywo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Podcasty</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Wideo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Firma</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-white transition-colors">O nas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kariera</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Reklama</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kontakt</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Prawne</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-white transition-colors">Regulamin</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Polityka prywatności</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Dostępność</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-800 mt-10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-sm">
            &copy; 2026 Pollar. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex gap-8 text-zinc-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
