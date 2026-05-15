import { useCallback, useEffect, useState } from 'react';
import { useApi, errorApiRef } from '@backstage/core-plugin-api';
import { AuditEvent, ListEventsOptions, auditApiRef } from '../../api';

export interface UseAuditEventsResult {
  items: AuditEvent[];
  hasMore: boolean;
  loading: boolean;
  error?: Error;
  refresh: () => void;
  loadMore: () => void;
}

export function useAuditEvents(
  filter: ListEventsOptions,
): UseAuditEventsResult {
  const api = useApi(auditApiRef);
  const errorApi = useApi(errorApiRef);
  const [items, setItems] = useState<AuditEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [tick, setTick] = useState(0);

  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    api
      .listEvents(filter)
      .then(page => {
        if (cancelled) return;
        setItems(page.items);
        setHasMore(page.hasMore);
        setNextCursor(page.nextCursor);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err);
        errorApi.post(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // filterKey collapses object identity churn; tick triggers manual refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, errorApi, filterKey, tick]);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loading) return;
    setLoading(true);
    try {
      const page = await api.listEvents({ ...filter, cursor: nextCursor });
      setItems(prev => [...prev, ...page.items]);
      setHasMore(page.hasMore);
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(err as Error);
      errorApi.post(err as Error);
    } finally {
      setLoading(false);
    }
  }, [api, errorApi, filter, hasMore, loading, nextCursor]);

  return { items, hasMore, loading, error, refresh, loadMore };
}
