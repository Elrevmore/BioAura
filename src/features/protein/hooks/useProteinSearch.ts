import { useEffect, useRef, useState } from 'react';
import { searchProteins } from '../services/rcsbSearchService';
import { ProteinSearchError } from '../types/protein-discovery.types';
import type { ProteinSearchResult } from '../types/protein-discovery.types';

const SEARCH_DEBOUNCE_MS = 300;

export interface ProteinSearchState {
  query: string;
  setQuery: (query: string) => void;
  results: ProteinSearchResult[];
  isSearching: boolean;
  error: string | null;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof ProteinSearchError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Protein search failed';
}

/**
 * Debounced protein discovery search — independent from loaded protein state.
 */
export function useProteinSearch(): ProteinSearchState {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProteinSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      searchRequestIdRef.current += 1;
      setResults([]);
      setError(null);
      setIsSearching(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const requestId = ++searchRequestIdRef.current;

      setIsSearching(true);
      setError(null);

      void searchProteins(trimmed)
        .then((hits) => {
          if (requestId !== searchRequestIdRef.current) {
            return;
          }

          setResults(hits);
          setIsSearching(false);
        })
        .catch((searchError: unknown) => {
          if (requestId !== searchRequestIdRef.current) {
            return;
          }

          setResults([]);
          setError(toErrorMessage(searchError));
          setIsSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
  };
}
