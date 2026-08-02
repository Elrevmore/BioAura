import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useContext, useId, type ReactNode } from 'react';
import { GlassPanel, HudPanelHeader, LoadingSpinner } from '@shared/components';
import { useProteinSearch } from '../hooks/useProteinSearch';
import type { ProteinSearchState } from '../hooks/useProteinSearch';
import type { ProteinSearchResult } from '../types/protein-discovery.types';

const ProteinSearchContext = createContext<ProteinSearchState | null>(null);

function useProteinSearchContext(): ProteinSearchState {
  const context = useContext(ProteinSearchContext);
  if (!context) {
    throw new Error('ProteinSearchPanel must be used within ProteinSearchProvider');
  }
  return context;
}

const PANEL_BASE_CLASS = 'z-10 w-full';

interface ProteinSearchProviderProps {
  children: ReactNode;
}

/** Shares one debounced search session across rail and floating panel layouts. */
export function ProteinSearchProvider({ children }: ProteinSearchProviderProps) {
  const search = useProteinSearch();

  return (
    <ProteinSearchContext.Provider value={search}>{children}</ProteinSearchContext.Provider>
  );
}

interface ProteinSearchPanelProps {
  /** Called when the user selects a search result. Does not load structure by itself. */
  onSelect?: (result: ProteinSearchResult) => void;
  variant: 'floating' | 'rail';
  className?: string;
}

interface SearchResultItemProps {
  result: ProteinSearchResult;
  onSelect?: (result: ProteinSearchResult) => void;
}

function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect?.(result)}
        className="w-full border-b border-aura-border/40 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-aura-cyan/5 focus-visible:ring-2 focus-visible:ring-aura-cyan/50 focus-visible:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium text-aura-text">{result.title}</p>
          <span className="shrink-0 font-mono text-[10px] text-aura-cyan">
            {result.pdbId}
          </span>
        </div>
        {result.organism && (
          <p className="mt-1 text-[10px] leading-relaxed text-aura-text-muted">
            {result.organism}
          </p>
        )}
        {result.experimentalMethod && (
          <p className="mt-0.5 text-[10px] leading-relaxed text-aura-text-muted/80">
            {result.experimentalMethod}
          </p>
        )}
      </button>
    </li>
  );
}

/**
 * Protein discovery search panel — debounced RCSB lookup with glass HUD styling.
 * Selection is delegated to the parent via `onSelect`; does not load structures.
 */
export function ProteinSearchPanel({
  onSelect,
  variant,
  className = '',
}: ProteinSearchPanelProps) {
  const { query, setQuery, results, isSearching, error } = useProteinSearchContext();
  const inputId = useId();
  const listId = useId();
  const trimmedQuery = query.trim();

  const positionClass =
    variant === 'rail'
      ? `${PANEL_BASE_CLASS} w-full`
      : `${PANEL_BASE_CLASS} pointer-events-auto absolute top-[7.5rem] right-4 left-4 sm:hidden`;

  const showIdle = !trimmedQuery && !isSearching && !error;
  const showSearching = Boolean(trimmedQuery) && isSearching;
  const showError = Boolean(trimmedQuery) && !isSearching && Boolean(error);
  const showNoResults =
    Boolean(trimmedQuery) && !isSearching && !error && results.length === 0;
  const showResults =
    Boolean(trimmedQuery) && !isSearching && !error && results.length > 0;

  return (
    <div className={`${positionClass} ${className}`}>
      <GlassPanel
        variant="strong"
        glow="cyan"
        className="w-full overflow-hidden lg:w-64"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <HudPanelHeader title="Protein Search" subtitle="RCSB PDB discovery" />

        <div className="border-b border-aura-border px-3 py-3">
          <label htmlFor={inputId} className="sr-only">
            Search proteins by name or PDB ID
          </label>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or PDB ID…"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border border-aura-border bg-aura-bg/60 px-3 py-2 text-xs text-aura-text placeholder:text-aura-text-muted/70 focus:border-aura-cyan/50 focus:ring-2 focus:ring-aura-cyan/20 focus:outline-none"
            aria-controls={listId}
            aria-describedby={`${listId}-status`}
          />
        </div>

        <div
          id={`${listId}-status`}
          className="max-h-[min(14rem,32vh)] overflow-y-auto overflow-x-hidden px-1 py-2"
          role="region"
          aria-live="polite"
          aria-label="Protein search results"
        >
          <AnimatePresence mode="wait">
            {showIdle && (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-4 text-center text-[10px] leading-relaxed text-aura-text-muted"
              >
                Search the PDB archive by protein name or 4-character entry ID.
              </motion.p>
            )}

            {showSearching && (
              <motion.div
                key="searching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-6"
              >
                <LoadingSpinner size="sm" label="Searching" />
              </motion.div>
            )}

            {showError && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-4"
                role="alert"
              >
                <p className="text-xs font-medium text-aura-error">Search failed</p>
                <p className="mt-1 text-[10px] leading-relaxed text-aura-text-muted">
                  {error}
                </p>
              </motion.div>
            )}

            {showNoResults && (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-4 text-center text-[10px] leading-relaxed text-aura-text-muted"
              >
                No matching structures found for &ldquo;{trimmedQuery}&rdquo;.
              </motion.p>
            )}

            {showResults && (
              <motion.ul
                key="results"
                id={listId}
                role="listbox"
                aria-label="Protein search results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {results.map((result) => (
                  <SearchResultItem
                    key={result.pdbId}
                    result={result}
                    onSelect={onSelect}
                  />
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </GlassPanel>
    </div>
  );
}
