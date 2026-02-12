import { API_BASE } from '@/config/api';

export async function subscribeToNewsletter(email: string): Promise<void> {
  const response = await fetch(`${API_BASE}/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Subscription failed');
  }
}
