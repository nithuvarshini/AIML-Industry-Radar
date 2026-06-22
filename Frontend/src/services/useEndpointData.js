import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchEndpoint } from './api';
import { MOCK } from './mockData';
import * as normalizers from './normalizers';

const NORMALIZER_MAP = {
  'top-skills': (d) => normalizers.normalizeTopSkills(d),
  dashboard: (d) => normalizers.normalizeDashboard(d),
  'skill-insights': (d) => normalizers.normalizeSkillInsights(d),
  'role-analysis': (d) => normalizers.normalizeRoleAnalysis(d),
  recommendations: (d) => normalizers.normalizeRecommendations(d),
  roadmap: (d) => normalizers.normalizeRoadmap(d),
};

const MOCK_MAP = {
  'top-skills': MOCK['top-skills'],
  dashboard: MOCK.dashboard,
  'skill-insights': MOCK['skill-insights'],
  'role-analysis': MOCK['role-analysis'],
  recommendations: MOCK.recommendations,
  roadmap: MOCK.roadmap,
};

/**
 * Fetch a backend endpoint, normalize the result, and expose loading/error state.
 * If the request fails, falls back to mock data with `isFallback: true` so the
 * dashboard remains usable while the API is offline.
 */
export function useEndpointData(path) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const abortRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('loading');
    setError(null);
    setIsFallback(false);

    (async () => {
      try {
        const raw = await fetchEndpoint(`/${path}`, { signal: controller.signal });
        const normalizer = NORMALIZER_MAP[path];
        const normalized = normalizer ? normalizer(raw) : raw;
        setData(normalized);
        setStatus('success');
      } catch (err) {
        if (controller.signal.aborted) return;
        const normalizer = NORMALIZER_MAP[path];
        const fallback = normalizer ? normalizer(MOCK_MAP[path]) : MOCK_MAP[path];
        setData(fallback);
        setError(err.message || 'Failed to load data from the backend.');
        setIsFallback(true);
        setStatus('success');
      } finally {
        if (!controller.signal.aborted && abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    })();

    return () => controller.abort();
  }, [path, reloadKey]);

  return { status, data, error, isFallback, reload };
}
