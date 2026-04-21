// src/components/Services/contentViewService.js
//
// Thin wrapper around the /track endpoints. Used by useTrackContentView
// hook on detail pages + by admin analytics views.

import { requestFactory } from './requester';

const apiUrl = import.meta.env.VITE_API_URL;

export const contentViewServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    trackView: async ({ contentType, contentId }) => {
      return requester.post(`${apiUrl}/track/view`, { contentType, contentId });
    },

    getTopContent: async ({ type, from, to, limit }) => {
      const params = new URLSearchParams();
      params.set('type', type);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (limit) params.set('limit', String(limit));
      return requester.get(`${apiUrl}/track/top?${params.toString()}`);
    },
  };
};
