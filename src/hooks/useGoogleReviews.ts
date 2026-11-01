import { useEffect, useState } from 'react';
import type { Testimonial } from '../components/TestimonialSlider';
import { reviews, GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from '../data/reviews';

// Set both in .env (see .env.example). Without them the page shows the hand-written list in data/reviews.ts.
const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined;
const PLACE_ID = import.meta.env.VITE_GOOGLE_PLACE_ID as string | undefined;

// Each visitor asks Google at most once per 12 hours, to stay inside the Places API free tier
const CACHE_KEY = 'google-reviews-v1';
const CACHE_MS = 12 * 60 * 60 * 1000;

interface PlaceReview {
  rating: number;
  publishTime?: string;
  text?: { text: string };
  originalText?: { text: string };
  authorAttribution?: { displayName: string; photoUri?: string };
}

interface PlaceDetails {
  rating?: number;
  userRatingCount?: number;
  reviews?: PlaceReview[];
}

const normalise = (name: string) => name.toLowerCase().replace(/\s+/g, ' ').trim();

const readCache = (): PlaceDetails | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < CACHE_MS ? data : null;
  } catch {
    return null;
  }
};

const writeCache = (data: PlaceDetails) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Storage blocked (private window etc.): just fetch again next visit
  }
};

const fetchPlace = async (): Promise<PlaceDetails> => {
  const res = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY!,
      'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
    },
  });
  if (!res.ok) throw new Error(`Places API ${res.status}`);
  return res.json();
};

// Google reviews that aren't already in data/reviews.ts go first, newest at the top
const mergeReviews = (google: PlaceReview[] = []): Testimonial[] => {
  const known = new Set(reviews.map((r) => normalise(r.name)));
  const fresh = google
    .filter((r) => r.authorAttribution?.displayName && !known.has(normalise(r.authorAttribution.displayName)))
    .sort((a, b) => (b.publishTime ?? '').localeCompare(a.publishTime ?? ''))
    .map((r) => ({
      name: r.authorAttribution!.displayName,
      event: 'Google Review',
      text: r.originalText?.text ?? r.text?.text ?? '',
      rating: r.rating,
      image: r.authorAttribution!.photoUri ?? '',
    }))
    .filter((r) => r.text);
  return [...fresh, ...reviews];
};

export const useGoogleReviews = () => {
  const [place, setPlace] = useState<PlaceDetails | null>(readCache);

  useEffect(() => {
    if (place || !API_KEY || !PLACE_ID) return;
    let cancelled = false;
    fetchPlace()
      .then((data) => {
        writeCache(data);
        if (!cancelled) setPlace(data);
      })
      .catch(() => {
        // Keep showing the built-in list if Google can't be reached
      });
    return () => {
      cancelled = true;
    };
  }, [place]);

  return {
    rating: place?.rating ?? GOOGLE_RATING,
    count: place?.userRatingCount ?? GOOGLE_REVIEW_COUNT,
    testimonials: mergeReviews(place?.reviews),
  };
};
