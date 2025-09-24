import { Search, Filter, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Select } from '../../ui/Select';
import { FILTER_OPTIONS, DEFAULT_FILTERS, type Filters } from '../../../types/filters';

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function SearchSection({ searchTerm, onSearchChange, filters, onFiltersChange }: SearchSectionProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(filters);
  const filtersRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update pending filters when props change
  useEffect(() => {
    setPendingFilters(filters);
  }, [filters]);

  // Apply filters and close panel
  const handleApplyFilters = () => {
    onFiltersChange(pendingFilters);
    setShowFilters(false);
  };

  // Check if filters are active (different from defaults)
  const areFiltersActive = Object.entries(filters).some(([key, value]) =>
    value !== DEFAULT_FILTERS[key as keyof Filters]
  );

  // Clear all filters
  const handleClearFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
    setShowFilters(false);
  };

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  return (
    <div className="w-full relative" ref={filtersRef}>
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-2.5 hover:bg-card/70 transition-all duration-200">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search tokens..."
              className="w-full h-7 bg-transparent text-foreground placeholder-muted-foreground border-0 focus:outline-none focus:ring-0 pl-10 pr-4 text-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button
            ref={buttonRef}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-all duration-200 relative ${
              showFilters
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-accent-foreground hover:bg-accent/80'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Filters</span>
            {areFiltersActive && (
              <div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background"
                style={{ backgroundColor: 'rgb(0, 255, 255)' }}
              ></div>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div
            ref={filtersRef}
            className="absolute top-full left-0 right-0 z-[9999] mt-2 bg-card border border-[#eee]/20 rounded-xl shadow-2xl p-4 animate-in slide-in-from-top-2 duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-2 data-[state=closed]:fade-out-0"
            style={{ transform: 'translateZ(0)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Price Range
                </label>
                <Select
                  value={pendingFilters.priceRange}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, priceRange: e.target.value as keyof typeof FILTER_OPTIONS.priceRange })}
                >
                  {Object.entries(FILTER_OPTIONS.priceRange).map(([value, option]) => (
                    <option key={value} value={value}>{option.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Market Cap
                </label>
                <Select
                  value={pendingFilters.marketCap}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, marketCap: e.target.value as keyof typeof FILTER_OPTIONS.marketCap })}
                >
                  {Object.entries(FILTER_OPTIONS.marketCap).map(([value, option]) => (
                    <option key={value} value={value}>{option.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Volume
                </label>
                <Select
                  value={pendingFilters.volume}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, volume: e.target.value as keyof typeof FILTER_OPTIONS.volume })}
                >
                  {Object.entries(FILTER_OPTIONS.volume).map(([value, option]) => (
                    <option key={value} value={value}>{option.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Time Frame
                </label>
                <Select
                  value={pendingFilters.timeFrame}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, timeFrame: e.target.value as keyof typeof FILTER_OPTIONS.timeFrame })}
                >
                  {Object.entries(FILTER_OPTIONS.timeFrame).map(([value, option]) => (
                    <option key={value} value={value}>{option.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
