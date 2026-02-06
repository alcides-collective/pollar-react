import { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import type { MentionedPerson } from '../types/events';

async function fetchWikipediaImage(wikipediaUrl: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/wikipedia-image?url=${encodeURIComponent(wikipediaUrl)}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.imageUrl || null;
  } catch {
    return null;
  }
}

/**
 * Fetches Wikipedia thumbnail images for mentioned people.
 * Returns a record mapping person name → image URL.
 */
export function useWikipediaImages(mentionedPeople?: MentionedPerson[]): Record<string, string> {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!mentionedPeople?.length) return;

    let cancelled = false;

    async function loadImages() {
      const newImages: Record<string, string> = {};

      await Promise.all(
        mentionedPeople!.map(async (person) => {
          if (person.wikipediaUrl) {
            const imageUrl = await fetchWikipediaImage(person.wikipediaUrl);
            if (imageUrl) {
              newImages[person.name] = imageUrl;
            }
          }
        })
      );

      if (!cancelled) {
        setImages(newImages);
      }
    }

    loadImages();

    return () => { cancelled = true; };
  }, [mentionedPeople]);

  return images;
}
