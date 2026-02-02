import { useState } from 'react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    // TODO: Implement actual newsletter signup
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 500);
  };

  return (
    <div className="p-6">
      <h3 className="text-zinc-900 font-semibold mb-2">Newsletter</h3>
      <p className="text-sm text-zinc-600 mb-4">
        Otrzymuj codzienny przegląd najważniejszych wydarzeń.
      </p>

      {status === 'success' ? (
        <p className="text-sm text-green-600">Dziękujemy za zapisanie się!</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Twój email"
            className="flex-1 text-sm px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:border-zinc-500 text-zinc-900 bg-white"
            required
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="text-sm px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? '...' : 'Zapisz'}
          </button>
        </form>
      )}
    </div>
  );
}
