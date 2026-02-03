import type { Event } from '../types/events';

export const getImageSource = (event: Event): string | null => {
  // Znajdź artykuł z którego pochodzi obrazek (ta sama logika co EventImage)
  if (event.imageUrl && event.articles) {
    // Najpierw szukaj artykułu z tym samym imageUrl
    const matchingArticle = event.articles.find(a => a.imageUrl === event.imageUrl);
    if (matchingArticle) return matchingArticle.source;

    // Jeśli nie znaleziono, weź pierwszy artykuł z imageUrl
    const firstWithImage = event.articles.find(a => a.imageUrl?.trim());
    if (firstWithImage) return firstWithImage.source;
  }
  return null;
};
