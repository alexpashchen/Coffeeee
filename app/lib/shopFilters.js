export function getSortValues(sort) {
  switch (sort) {
    case 'price-asc':
      return {sortKey: 'PRICE', reverse: false};
    case 'price-desc':
      return {sortKey: 'PRICE', reverse: true};
    case 'newest':
      return {sortKey: 'CREATED', reverse: true};
    case 'title-asc':
      return {sortKey: 'TITLE', reverse: false};
    case 'title-desc':
      return {sortKey: 'TITLE', reverse: true};
    case 'best-selling':
    default:
      return {sortKey: 'BEST_SELLING', reverse: false};
  }
}

export function parseFiltersFromSearchParams(searchParams) {
  const filters = [];

  if (searchParams.has('available')) {
    filters.push({
      available: searchParams.get('available') === 'true',
    });
  }

  for (const value of searchParams.getAll('productType')) {
    filters.push({productType: value});
  }

  for (const value of searchParams.getAll('vendor')) {
    filters.push({productVendor: value});
  }

  for (const value of searchParams.getAll('tag')) {
    filters.push({tag: value});
  }

  const min = searchParams.get('price.min');
  const max = searchParams.get('price.max');

  if (min || max) {
    filters.push({
      price: {
        ...(min ? {min: Number(min)} : {}),
        ...(max ? {max: Number(max)} : {}),
      },
    });
  }

  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith('mf.')) continue;

    const parts = key.split('.');
    const namespace = parts[1];
    const metafieldKey = parts.slice(2).join('.');

    if (!namespace || !metafieldKey) continue;

    filters.push({
      productMetafield: {
        namespace,
        key: metafieldKey,
        value,
      },
    });
  }

  return dedupeFilters(filters);
}

export function dedupeFilters(filters) {
  const seen = new Set();

  return filters.filter((filter) => {
    const normalized = JSON.stringify(filter);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export function toggleFilterValue(searchParams, setSearchParams, parsedInput) {
  if (!parsedInput || typeof parsedInput !== 'object') return;

  const next = new URLSearchParams(searchParams);

  if ('available' in parsedInput) {
    const key = 'available';
    const value = String(parsedInput.available);

    if (next.get(key) === value) next.delete(key);
    else next.set(key, value);
  } else if ('productType' in parsedInput) {
    toggleMultiValue(next, 'productType', parsedInput.productType);
  } else if ('productVendor' in parsedInput) {
    toggleMultiValue(next, 'vendor', parsedInput.productVendor);
  } else if ('tag' in parsedInput) {
    toggleMultiValue(next, 'tag', parsedInput.tag);
  } else if ('price' in parsedInput) {
    const min = parsedInput.price?.min;
    const max = parsedInput.price?.max;

    if (min != null) next.set('price.min', String(min));
    else next.delete('price.min');

    if (max != null) next.set('price.max', String(max));
    else next.delete('price.max');
  } else if ('productMetafield' in parsedInput) {
    const {namespace, key, value} = parsedInput.productMetafield;
    toggleMultiValue(next, `mf.${namespace}.${key}`, String(value));
  }

  deletePaginationParams(next);
  setSearchParams(next, {preventScrollReset: true});
}

export function toggleMultiValue(searchParams, key, value) {
  const values = searchParams.getAll(key);
  const exists = values.includes(value);

  searchParams.delete(key);

  const nextValues = exists
    ? values.filter((item) => item !== value)
    : [...values, value];

  nextValues.forEach((item) => searchParams.append(key, item));
}

export function isFilterValueActive(searchParams, parsedInput) {
  if (!parsedInput || typeof parsedInput !== 'object') return false;

  if ('available' in parsedInput) {
    return searchParams.get('available') === String(parsedInput.available);
  }

  if ('productType' in parsedInput) {
    return searchParams.getAll('productType').includes(parsedInput.productType);
  }

  if ('productVendor' in parsedInput) {
    return searchParams.getAll('vendor').includes(parsedInput.productVendor);
  }

  if ('tag' in parsedInput) {
    return searchParams.getAll('tag').includes(parsedInput.tag);
  }

  if ('price' in parsedInput) {
    const min = parsedInput.price?.min;
    const max = parsedInput.price?.max;
    const currentMin = searchParams.get('price.min');
    const currentMax = searchParams.get('price.max');

    return (
      (currentMin ?? '') === (min != null ? String(min) : '') &&
      (currentMax ?? '') === (max != null ? String(max) : '')
    );
  }

  if ('productMetafield' in parsedInput) {
    const {namespace, key, value} = parsedInput.productMetafield;
    return searchParams.getAll(`mf.${namespace}.${key}`).includes(String(value));
  }

  return false;
}

export function getActiveFilterChips(searchParams) {
  const chips = [];
  let priceAdded = false;

  for (const [key, value] of searchParams.entries()) {
    if (key === 'sort') continue;
    if (isPaginationParam(key)) continue;

    if (key === 'price.min' || key === 'price.max') {
      if (priceAdded) continue;

      const min = searchParams.get('price.min');
      const max = searchParams.get('price.max');

      if (min || max) {
        chips.push({
          key: 'price',
          value: 'range',
          label: `Price: ${min || 'Any'} - ${max || 'Any'}`,
        });
        priceAdded = true;
      }

      continue;
    }

    if (key.startsWith('mf.')) {
      const parts = key.split('.');
      const label = prettifyLabel(parts.slice(2).join('.'));
      chips.push({key, value, label: `${label}: ${prettifyLabel(value)}`});
      continue;
    }

    chips.push({
      key,
      value,
      label: `${prettifyLabel(key)}: ${prettifyLabel(value)}`,
    });
  }

  return chips;
}

export function removeActiveChip(searchParams, setSearchParams, key, value) {
  const next = new URLSearchParams(searchParams);

  if (key === 'price') {
    next.delete('price.min');
    next.delete('price.max');
  } else {
    const current = next.getAll(key);
    next.delete(key);
    current
      .filter((item) => item !== value)
      .forEach((item) => next.append(key, item));
  }

  deletePaginationParams(next);
  setSearchParams(next, {preventScrollReset: true});
}

export function clearFilters(searchParams, setSearchParams) {
  const next = new URLSearchParams();
  const sort = searchParams.get('sort');

  if (sort) next.set('sort', sort);

  setSearchParams(next, {preventScrollReset: true});
}

export function isPaginationParam(key) {
  return (
    key === 'cursor' ||
    key === 'direction' ||
    key === 'startCursor' ||
    key === 'endCursor'
  );
}

export function deletePaginationParams(searchParams) {
  searchParams.delete('cursor');
  searchParams.delete('direction');
  searchParams.delete('startCursor');
  searchParams.delete('endCursor');
}

export function prettifyLabel(value) {
  if (value === 'true') return 'Yes';
  if (value === 'false') return 'No';

  return String(value)
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}