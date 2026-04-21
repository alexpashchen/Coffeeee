import {useEffect, useMemo, useState} from 'react';
import {
  deletePaginationParams,
  safeJsonParse,
} from '~/lib/shopFilters';

const PRICE_DEBOUNCE_MS = 500;

/**
 * @param {{
 *   filter: any,
 *   searchParams: URLSearchParams,
 *   setSearchParams: Function,
 *   isLoading: boolean
 * }} props
 */
export function PriceRangeFilter({
  filter,
  searchParams,
  setSearchParams,
  isLoading,
}) {
  const parsedInput = safeJsonParse(filter.values?.[0]?.input);

  const minHint = parsedInput?.price?.min ?? 0;
  const maxHint = parsedInput?.price?.max ?? '';

  const appliedMin = searchParams.get('price.min') ?? '';
  const appliedMax = searchParams.get('price.max') ?? '';

  const [minValue, setMinValue] = useState(appliedMin);
  const [maxValue, setMaxValue] = useState(appliedMax);

  useEffect(() => {
    setMinValue(appliedMin);
    setMaxValue(appliedMax);
  }, [appliedMin, appliedMax]);

  const hasError = useMemo(() => {
    if (minValue === '' || maxValue === '') return false;
    return Number(minValue) > Number(maxValue);
  }, [minValue, maxValue]);

  useEffect(() => {
    if (isLoading || hasError) return;

    const currentMin = searchParams.get('price.min') ?? '';
    const currentMax = searchParams.get('price.max') ?? '';

    if (minValue === currentMin && maxValue === currentMax) return;

    const timeoutId = setTimeout(() => {
      const next = new URLSearchParams(searchParams);

      const normalizedMin = minValue.trim();
      const normalizedMax = maxValue.trim();

      const numericMin = normalizedMin !== '' ? Number(normalizedMin) : null;
      const numericMax = normalizedMax !== '' ? Number(normalizedMax) : null;

      if (numericMin != null && !Number.isNaN(numericMin)) {
        next.set('price.min', String(numericMin));
      } else {
        next.delete('price.min');
      }

      if (numericMax != null && !Number.isNaN(numericMax)) {
        next.set('price.max', String(numericMax));
      } else {
        next.delete('price.max');
      }

      deletePaginationParams(next);
      setSearchParams(next, {
        preventScrollReset: true,
        replace: true,
      });
    }, PRICE_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [minValue, maxValue, hasError, isLoading, searchParams, setSearchParams]);

  function clearPrice() {
    const next = new URLSearchParams(searchParams);
    next.delete('price.min');
    next.delete('price.max');
    deletePaginationParams(next);
    setSearchParams(next, {
      preventScrollReset: true,
      replace: true,
    });

    setMinValue('');
    setMaxValue('');
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">{filter.label}</h3>

        {appliedMin || appliedMax ? (
          <button
            type="button"
            onClick={clearPrice}
            className="text-xs text-neutral-500 transition hover:text-black"
          >
            Reset
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="priceMin" className="mb-1 block text-xs text-neutral-500">
              Min
            </label>
            <input
              id="priceMin"
              name="priceMin"
              type="number"
              inputMode="numeric"
              value={minValue}
              onChange={(event) => setMinValue(event.target.value)}
              placeholder={String(minHint)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label htmlFor="priceMax" className="mb-1 block text-xs text-neutral-500">
              Max
            </label>
            <input
              id="priceMax"
              name="priceMax"
              type="number"
              inputMode="numeric"
              value={maxValue}
              onChange={(event) => setMaxValue(event.target.value)}
              placeholder={String(maxHint)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-black"
            />
          </div>
        </div>

        {hasError ? (
          <p className="text-xs text-red-500">
            Min price cannot be greater than max price.
          </p>
        ) : (
          <p className="text-xs text-neutral-500">
            Updates automatically after you stop typing.
          </p>
        )}
      </div>
    </section>
  );
}