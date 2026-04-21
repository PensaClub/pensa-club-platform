// src/components/hooks/useTrackContentView.js
//
// Fires a single POST /track/view when mounted with a valid (type, id).
// The backend handles bot filtering + 30-min dedupe per IP, so extra
// client-side throttling is unnecessary.

import { useEffect, useRef } from 'react';
import { contentViewServiceFactory } from '../Services/contentViewService';

const ALLOWED_TYPES = new Set([
  'article',
  'seminar',
  'course',
  'initiative',
  'project',
  'publication',
  'club',
]);

export const useTrackContentView = (contentType, contentId) => {
  const firedKeyRef = useRef(null);

  useEffect(() => {
    if (!contentType || !ALLOWED_TYPES.has(contentType)) return;
    const parsedId = Number(contentId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) return;

    const key = `${contentType}:${parsedId}`;
    if (firedKeyRef.current === key) return;
    firedKeyRef.current = key;

    const auth = (() => {
      try {
        const raw = localStorage.getItem('auth');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();
    const token = auth?.token || null;

    const service = contentViewServiceFactory(token);
    service
      .trackView({ contentType, contentId: parsedId })
      .catch(() => {
        // Swallow — tracking failures must never affect UX.
      });
  }, [contentType, contentId]);
};
