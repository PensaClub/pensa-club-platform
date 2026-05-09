import { createContext, useContext, useCallback, useMemo } from 'react';
import { useAuthContext } from './UserContext';
import { crawlerServiceFactory } from '../Services/crawlerService';
import { notify } from '../../utils/notify.jsx';

export const CrawlerContext = createContext();

/**
 * Provider for the Bot Crawler admin module (Phase 1, MVP, RSS-only).
 *
 * Every method is wrapped in useCallback + try/catch. Errors are surfaced
 * with a toast so the UI never silently swallows them, but we re-throw so
 * the caller can react (e.g. close a modal only on success). Read-only
 * listing methods return safe empty envelopes on failure to keep tables
 * mountable.
 */
export const CrawlerProvider = ({ children }) => {
  const { token } = useAuthContext();
  const crawlerService = useMemo(() => crawlerServiceFactory(token), [token]);

  // ---------- Bots ----------
  const listBots = useCallback(async (params = {}) => {
    try {
      return await crawlerService.listBots(params);
    } catch (error) {
      console.error('CrawlerContext.listBots error:', error);
      notify('error', error);
      return { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  }, [crawlerService]);

  const getBot = useCallback(async (id) => {
    try {
      return await crawlerService.getBot(id);
    } catch (error) {
      console.error('CrawlerContext.getBot error:', error);
      notify('error', error);
      throw error;
    }
  }, [crawlerService]);

  const createBot = useCallback(async (payload) => {
    try {
      const response = await crawlerService.createBot(payload);
      return response;
    } catch (error) {
      console.error('CrawlerContext.createBot error:', error);
      notify('error', error);
      throw error;
    }
  }, [crawlerService]);

  const updateBot = useCallback(async (id, payload) => {
    try {
      const response = await crawlerService.updateBot(id, payload);
      return response;
    } catch (error) {
      console.error('CrawlerContext.updateBot error:', error);
      notify('error', error);
      throw error;
    }
  }, [crawlerService]);

  const deleteBot = useCallback(async (id) => {
    try {
      const response = await crawlerService.deleteBot(id);
      return response;
    } catch (error) {
      console.error('CrawlerContext.deleteBot error:', error);
      notify('error', error);
      throw error;
    }
  }, [crawlerService]);

  const runBotNow = useCallback(async (id) => {
    try {
      const response = await crawlerService.runBotNow(id);
      return response;
    } catch (error) {
      console.error('CrawlerContext.runBotNow error:', error);
      notify('error', error);
      throw error;
    }
  }, [crawlerService]);

  const clearBotFindings = useCallback(async (id) => {
    try {
      const response = await crawlerService.clearBotFindings(id);
      return response;
    } catch (error) {
      console.error('CrawlerContext.clearBotFindings error:', error);
      notify('error', error);
      throw error;
    }
  }, [crawlerService]);

  // ---------- Sources ----------
  const listSources = useCallback(async (botId) => {
    try {
      return await crawlerService.listSources(botId);
    } catch (error) {
      console.error('CrawlerContext.listSources error:', error);
      notify('error', error);
      return [];
    }
  }, [crawlerService]);

  const createSource = useCallback(async (botId, payload) => {
    try {
      const response = await crawlerService.createSource(botId, payload);
      return response;
    } catch (error) {
      console.error('CrawlerContext.createSource error:', error);
      notify('error', error);
      throw error;
    }
  }, [crawlerService]);

  const updateSource = useCallback(async (id, payload) => {
    try {
      const response = await crawlerService.updateSource(id, payload);
      return response;
    } catch (error) {
      console.error('CrawlerContext.updateSource error:', error);
      notify('error', error);
      throw error;
    }
  }, [crawlerService]);

  const deleteSource = useCallback(async (id) => {
    try {
      const response = await crawlerService.deleteSource(id);
      return response;
    } catch (error) {
      console.error('CrawlerContext.deleteSource error:', error);
      notify('error', error);
      throw error;
    }
  }, [crawlerService]);

  /**
   * Validate a source URL WITHOUT persisting. Returns the backend body
   * verbatim so callers can branch on `ok`, `code`, `samples`, `robots`.
   * On a non-2xx response the requester throws the parsed JSON body —
   * we catch it and return a normalized envelope with `ok: false` so the
   * modal never has to wrap the call in its own try/catch.
   *
   * NOTE: we deliberately do NOT toast on failure here — validation errors
   * are part of the UX flow and rendered inline as red error cards.
   */
  const validateSourceUrl = useCallback(async (payload) => {
    try {
      const response = await crawlerService.validateSourceUrl(payload || {});
      return response;
    } catch (error) {
      console.error('CrawlerContext.validateSourceUrl error:', error);
      // Backend error shape: { ok: false, code, message, ... }. Network /
      // unexpected errors fall through to a generic envelope.
      if (error && typeof error === 'object' && 'ok' in error) {
        return error;
      }
      return {
        ok: false,
        code: 'NETWORK_ERROR',
        message: error?.message || 'Network error',
      };
    }
  }, [crawlerService]);

  /**
   * Re-validate an existing source by id. Returns { item, validation }
   * on success. On failure we still return a normalized object so the
   * row can render the error inline.
   */
  const revalidateSource = useCallback(async (id) => {
    try {
      const response = await crawlerService.revalidateSource(id);
      return response;
    } catch (error) {
      console.error('CrawlerContext.revalidateSource error:', error);
      notify('error', error);
      if (error && typeof error === 'object' && 'ok' in error) {
        return error;
      }
      return {
        ok: false,
        code: 'NETWORK_ERROR',
        message: error?.message || 'Network error',
      };
    }
  }, [crawlerService]);

  // ---------- Findings ----------
  const listFindings = useCallback(async (params = {}) => {
    try {
      return await crawlerService.listFindings(params);
    } catch (error) {
      console.error('CrawlerContext.listFindings error:', error);
      notify('error', error);
      return { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  }, [crawlerService]);

  const updateFindingStatus = useCallback(async (id, payload) => {
    try {
      const response = await crawlerService.updateFindingStatus(id, payload);
      return response;
    } catch (error) {
      console.error('CrawlerContext.updateFindingStatus error:', error);
      notify('error', error);
      throw error;
    }
  }, [crawlerService]);

  // ---------- Runs ----------
  const listRuns = useCallback(async (botId, limit = 20) => {
    try {
      return await crawlerService.listRuns(botId, limit);
    } catch (error) {
      console.error('CrawlerContext.listRuns error:', error);
      notify('error', error);
      return [];
    }
  }, [crawlerService]);

  const contextValue = useMemo(() => ({
    listBots,
    getBot,
    createBot,
    updateBot,
    deleteBot,
    runBotNow,
    clearBotFindings,
    listSources,
    createSource,
    updateSource,
    deleteSource,
    validateSourceUrl,
    revalidateSource,
    listFindings,
    updateFindingStatus,
    listRuns,
  }), [
    listBots, getBot, createBot, updateBot, deleteBot, runBotNow, clearBotFindings,
    listSources, createSource, updateSource, deleteSource,
    validateSourceUrl, revalidateSource,
    listFindings, updateFindingStatus, listRuns,
  ]);

  return (
    <CrawlerContext.Provider value={contextValue}>
      {children}
    </CrawlerContext.Provider>
  );
};

export const useCrawlerContext = () => {
  const context = useContext(CrawlerContext);
  if (!context) {
    throw new Error('useCrawlerContext must be used within CrawlerProvider');
  }
  return context;
};
