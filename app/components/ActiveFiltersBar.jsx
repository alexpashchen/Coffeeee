import {
  getActiveFilterChips,
  removeActiveChip,
} from '~/lib/shopFilters';
import Collections from '~/routes/($locale).collections._index';

/**
 * @param {{
 *   searchParams: URLSearchParams,
 *   setSearchParams: Function
 * }} props
 */
export function ActiveFiltersBar({searchParams, setSearchParams}) {
  const chips = getActiveFilterChips(searchParams);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() =>
            removeActiveChip(searchParams, setSearchParams, chip.key, chip.value)
          }
          className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm transition hover:border-neutral-500"
        >
          {chip.label} ×
        </button>
      ))}
    </div>
  );
}