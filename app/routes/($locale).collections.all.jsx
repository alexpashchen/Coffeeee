import {useLoaderData, useSearchParams} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';

const SHOP_COLLECTION_HANDLE = 'all-coffee';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: `Shop`}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context, request}) {
  const {storefront} = context;
  const url = new URL(request.url);

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const sort = url.searchParams.get('sort') || 'best-selling';
  const {sortKey, reverse} = getSortValues(sort);
  const filters = parseFiltersFromSearchParams(url.searchParams);

  const data = await storefront.query(SHOP_COLLECTION_QUERY, {
    variables: {
      handle: SHOP_COLLECTION_HANDLE,
      ...paginationVariables,
      sortKey,
      reverse,
      filters,
    },
  });

  if (!data?.collection) {
    throw new Response(`Collection "${SHOP_COLLECTION_HANDLE}" not found`, {
      status: 404,
    });
  }

  return {
    collection: data.collection,
    selectedSort: sort,
    selectedFilters: filters,
  };
}

export default function ShopRoute() {
  /** @type {LoaderReturnData} */
  const {collection, selectedSort} = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const products = collection.products;
  const filters = collection.products.filters || [];

  return (
    <div className="px-4 py-8 md:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight md:text-5xl">Shop</h1>
      </header>

      <div className="mb-6 flex flex-col gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-center md:justify-between">
        <ActiveFiltersBar
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />

        <SortSelect
          selectedSort={selectedSort}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <FilterSidebar
            filters={filters}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </aside>

        <main>
          <PaginatedResourceSection
            connection={products}
            resourcesClassName="products-grid"
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        </main>
      </div>
    </div>
  );
}

function SortSelect({selectedSort, searchParams, setSearchParams}) {
  function handleChange(event) {
    const next = new URLSearchParams(searchParams);
    next.set('sort', event.target.value);
    deletePaginationParams(next);
    setSearchParams(next, {preventScrollReset: true});
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort" className="text-sm text-neutral-600">
        Sort
      </label>

      <select
        id="sort"
        value={selectedSort}
        onChange={handleChange}
        className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm"
      >
        <option value="best-selling">Best selling</option>
        <option value="newest">Newest</option>
        <option value="price-asc">Price, low to high</option>
        <option value="price-desc">Price, high to low</option>
        <option value="title-asc">Alphabetically, A-Z</option>
        <option value="title-desc">Alphabetically, Z-A</option>
      </select>
    </div>
  );
}

function FilterSidebar({filters, searchParams, setSearchParams}) {
  if (!filters.length) {
    return (
      <div className="rounded-3xl border border-neutral-200 p-5 text-sm text-neutral-500">
        No filters available. Check Search &amp; Discovery and metafield filter setup.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-neutral-200 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-medium">Filters</h2>

        <button
          type="button"
          onClick={() => clearFilters(searchParams, setSearchParams)}
          className="text-sm text-neutral-500"
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
          />
        ))}
      </div>
    </div>
  );
}

function FilterGroup({filter, searchParams, setSearchParams}) {
  if (!filter?.values?.length) return null;

  if (filter.type === 'PRICE_RANGE') {
    return (
      <PriceRangeFilter
        filter={filter}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
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
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 bg-white text-neutral-800',
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

function PriceRangeFilter({filter, searchParams, setSearchParams}) {
  const parsedInput = safeJsonParse(filter.values?.[0]?.input);
  const minLimit = parsedInput?.price?.min ?? 0;
  const maxLimit = parsedInput?.price?.max ?? 0;

  const currentMin = searchParams.get('price.min') ?? '';
  const currentMax = searchParams.get('price.max') ?? '';

  function applyPriceFilter(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const min = formData.get('priceMin')?.toString().trim() ?? '';
    const max = formData.get('priceMax')?.toString().trim() ?? '';

    const next = new URLSearchParams(searchParams);

    if (min) next.set('price.min', min);
    else next.delete('price.min');

    if (max) next.set('price.max', max);
    else next.delete('price.max');

    deletePaginationParams(next);
    setSearchParams(next, {preventScrollReset: true});
  }

  function clearPrice() {
    const next = new URLSearchParams(searchParams);
    next.delete('price.min');
    next.delete('price.max');
    deletePaginationParams(next);
    setSearchParams(next, {preventScrollReset: true});
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">{filter.label}</h3>

        {currentMin || currentMax ? (
          <button
            type="button"
            onClick={clearPrice}
            className="text-xs text-neutral-500"
          >
            Reset
          </button>
        ) : null}
      </div>

      <form onSubmit={applyPriceFilter} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="priceMin" className="mb-1 block text-xs text-neutral-500">
              Min
            </label>
            <input
              id="priceMin"
              name="priceMin"
              type="number"
              min={minLimit}
              max={maxLimit}
              defaultValue={currentMin}
              placeholder={String(minLimit)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
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
              min={minLimit}
              max={maxLimit}
              defaultValue={currentMax}
              placeholder={String(maxLimit)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-full border border-black px-4 py-2 text-sm"
        >
          Apply
        </button>
      </form>
    </section>
  );
}

function ActiveFiltersBar({searchParams, setSearchParams}) {
  const chips = getActiveFilterChips(searchParams);

  if (!chips.length) {
    return <div className="text-sm text-neutral-600">All products</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() =>
            removeActiveChip(searchParams, setSearchParams, chip.key, chip.value)
          }
          className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm"
        >
          {chip.label} ×
        </button>
      ))}
    </div>
  );
}

function getSortValues(sort) {
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

function parseFiltersFromSearchParams(searchParams) {
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

function dedupeFilters(filters) {
  const seen = new Set();

  return filters.filter((filter) => {
    const normalized = JSON.stringify(filter);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function toggleFilterValue(searchParams, setSearchParams, parsedInput) {
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

function toggleMultiValue(searchParams, key, value) {
  const values = searchParams.getAll(key);
  const exists = values.includes(value);

  searchParams.delete(key);

  const nextValues = exists
    ? values.filter((item) => item !== value)
    : [...values, value];

  nextValues.forEach((item) => searchParams.append(key, item));
}

function isFilterValueActive(searchParams, parsedInput) {
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

function getActiveFilterChips(searchParams) {
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
          label: `Price: ${min || '0'} - ${max || '∞'}`,
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

function removeActiveChip(searchParams, setSearchParams, key, value) {
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

function clearFilters(searchParams, setSearchParams) {
  const next = new URLSearchParams();
  const sort = searchParams.get('sort');

  if (sort) next.set('sort', sort);

  setSearchParams(next, {preventScrollReset: true});
}

function isPaginationParam(key) {
  return (
    key === 'cursor' ||
    key === 'direction' ||
    key === 'startCursor' ||
    key === 'endCursor'
  );
}

function deletePaginationParams(searchParams) {
  searchParams.delete('cursor');
  searchParams.delete('direction');
  searchParams.delete('startCursor');
  searchParams.delete('endCursor');
}

function prettifyLabel(value) {
  if (value === 'true') return 'Yes';
  if (value === 'false') return 'No';

  return String(value)
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }

  fragment CollectionItem on Product {
    id
    handle
    title
    description

    roastLevel: metafield(namespace: "custom", key: "roast_level") {
      value
    }
    flavorNotes: metafield(namespace: "custom", key: "flavor_notes") {
      value
    }
    brewMethods: metafield(namespace: "custom", key: "brew_methods") {
      value
    }
    caffeineType: metafield(namespace: "custom", key: "caffeine_type") {
      value
    }
    beginnerFriendly: metafield(namespace: "custom", key: "beginner_friendly") {
      value
    }
    subscriptionEligible: metafield(namespace: "custom", key: "subscription_eligible") {
      value
    }
    tastingNotesShort: metafield(namespace: "custom", key: "tasting_notes_short") {
      value
    }

    featuredImage {
      id
      altText
      url
      width
      height
    }

    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
`;

const SHOP_COLLECTION_QUERY = `#graphql
  query ShopCollection(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title

      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }

        nodes {
          ...CollectionItem
        }

        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

/** @typedef {import('./+types/shop').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */