import {PriceRangeFilter} from './PriceRangeFilter';
import {
  clearFilters,
  safeJsonParse,
  isFilterValueActive,
  toggleFilterValue,
} from '~/lib/shopFilters';

/**
 * @param {{
 *   filters: any[],
 *   searchParams: URLSearchParams,
 *   setSearchParams: Function,
 *   isLoading: boolean
 * }} props
 */
export function ShopFiltersSidebar({
  filters,
  searchParams,
  setSearchParams,
  isLoading,
}) {
  if (!filters.length) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        No filters available. Check Search &amp; Discovery and metafield filter setup.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-medium">Filters</h2>

        <button
          type="button"
          onClick={() => clearFilters(searchParams, setSearchParams)}
          className="text-sm text-neutral-500 transition hover:text-black"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-6">
        {filters.map((filter) => (
          <FilterGroup
            key={filter.id}
            filter={filter}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}

function FilterGroup({filter, searchParams, setSearchParams, isLoading}) {
  if (!filter?.values?.length) return null;

  if (filter.type === 'PRICE_RANGE') {
    return (
      <PriceRangeFilter
        filter={filter}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        isLoading={isLoading}
      />
    );
  }

  return (
    <section>
      <h3 className="mb-3 text-sm font-medium">{filter.label}</h3>

      <div className="flex flex-wrap gap-2">
        {filter.values.map((value) => {
          const parsedInput = safeJsonParse(value.input);
          const active = isFilterValueActive(searchParams, parsedInput);

          return (
            <button
              key={value.id}
              type="button"
              onClick={() =>
                toggleFilterValue(searchParams, setSearchParams, parsedInput)
              }
              className={[
                'rounded-full border px-3 py-1.5 text-sm transition',
                active
                  ? 'border-black bg-black text-white shadow-sm'
                  : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500',
                isLoading ? 'pointer-events-none opacity-70' : '',
              ].join(' ')}
            >
              {value.label}
              {typeof value.count === 'number' ? ` (${value.count})` : ''}
            </button>
          );
        })}
      </div>
    </section>
  );
}