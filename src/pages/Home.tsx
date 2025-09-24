import { useState, useEffect } from 'react';
import { SearchSection } from '../components/features/search/SearchSection';
import { TokenTable } from '../components/features/tokens/TokenTable';
import { Select } from '../components/ui/Select';
import { DEFAULT_FILTERS, SORT_OPTIONS, DEFAULT_SORT, type SortValue } from '../types/filters';

export function Home() {
  const [searchTerm, setSearchTerm] = useState(() => {
    // Restore search term from sessionStorage
    return sessionStorage.getItem('tokenSearchTerm') || '';
  });

  const [sortBy, setSortBy] = useState<SortValue>(() => {
    // Restore sort option from sessionStorage
    const saved = sessionStorage.getItem('tokenSortBy') as SortValue;
    return saved && saved in SORT_OPTIONS ? saved : DEFAULT_SORT;
  });

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Save search term and sort option to sessionStorage when they change
  useEffect(() => {
    sessionStorage.setItem('tokenSearchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem('tokenSortBy', sortBy);
  }, [sortBy]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8 animate-slide-up">
        <h1 className="text-4xl md:text-6xl font-bold text-gradient-primary mb-4 animate-float">
          Welcome to LaunchPad
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up">
          Discover, create, and trade the next big meme coins on Solana.
          Join the revolution of decentralized finance.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-xl p-3 animate-scale-in shadow-sm relative z-10 isolate">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1" style={{ zIndex: 2 }}>
            <SearchSection
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
          <div className="flex items-center lg:w-auto" style={{ zIndex: 1 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortValue)}
              className="bg-background/50 backdrop-blur-sm border-border/50 focus:ring-primary/50 hover:bg-background/70"
            >
              {Object.entries(SORT_OPTIONS).map(([value, option]) => (
                <option key={value} value={value}>{option.label}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Token Table */}
      <div className="animate-slide-up">
        <TokenTable searchTerm={searchTerm} sortBy={sortBy} filters={filters} />
      </div>
    </div>
  );
}
