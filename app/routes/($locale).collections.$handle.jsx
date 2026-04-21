import {useLoaderData, useNavigation, useSearchParams} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {ShopFiltersSidebar} from '~/components/ShopFiltersSidebar';
import {ActiveFiltersBar} from '~/components/ActiveFiltersBar';
import {GridAreaOverlayLoader} from '~/components/GridAreaOverlayLoader';
import {SHOP_COLLECTION_QUERY} from '~/lib/shopQuery';
import {
  parseFiltersFromSearchParams,
  getSortValues,
  deletePaginationParams,
} from '~/lib/shopFilters';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: `Shop`}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context, request, params}) {
  const {storefront} = context;
  const {handle} = params;
  const url = new URL(request.url);

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const sort = url.searchParams.get('sort') || 'best-selling';
  const filters = parseFiltersFromSearchParams(url.searchParams);
  const {sortKey, reverse} = getSortValues(sort);

  const data = await storefront.query(SHOP_COLLECTION_QUERY, {
    variables: {
      handle,
      ...paginationVariables,
      sortKey,
      reverse,
      filters,
    },
  });

  if (!data?.collection) {
    throw new Response(`Collection "${handle}" not found`, {
      status: 404,
    });
  }

  return {
    collection: data.collection,
    selectedSort: sort,
  };
}

export default function ShopRoute() {
  /** @type {LoaderReturnData} */
  const {collection, selectedSort} = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();

  const products = collection.products;
  const filters = collection.products.filters || [];
  const isLoading = navigation.state !== 'idle';

  function handleSortChange(event) {
    const next = new URLSearchParams(searchParams);
    next.set('sort', event.target.value);
    deletePaginationParams(next);
    setSearchParams(next, {preventScrollReset: true});
  }

  return (
    <div className="px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-medium tracking-[-0.04em] md:text-5xl">
            { collection.title }
          </h1>
        </header>

        <div className="mb-6 flex flex-col gap-4 border-b border-black/10 pb-6 md:flex-row md:items-center md:justify-between">
          <ActiveFiltersBar
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />

          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="text-sm text-black/60">
              Sort
            </label>

            <select
              id="sort"
              value={selectedSort}
              onChange={handleSortChange}
              className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm outline-none transition hover:border-black/20"
            >
              <option value="best-selling">Best selling</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
              <option value="title-asc">Alphabetically, A-Z</option>
              <option value="title-desc">Alphabetically, Z-A</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <ShopFiltersSidebar
              filters={filters}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              isLoading={isLoading}
            />
          </aside>

          <main>
            <div className="relative">
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

              {isLoading ? <GridAreaOverlayLoader /> : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/shop.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */