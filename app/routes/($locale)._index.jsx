import {useLoaderData} from 'react-router';
import {MockShopNotice} from '~/components/MockShopNotice';
import {Hero} from '~/components/Hero';
import {FeaturedCollection} from '~/components/FeaturedCollection';
import {FEATURED_COLLECTION_QUERY} from '~/lib/featuredCollectionQuery';
import {SHOP_BY_CATEGORY_QUERY} from '~/lib/shopByCategoryQuery';
import {ShopByCategory} from '~/components/ShopByCategory';
import {QuizPromoBlock} from '~/components/QuizPromoBlock';

/**
 * @type {Route.MetaFunction}
 */ 
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const [featuredCollection, shopByCategory] = await Promise.all([
    storefront.query(FEATURED_COLLECTION_QUERY, {
      variables: {
        handle: 'featured-collection',
      },
    }),
    storefront.query(SHOP_BY_CATEGORY_QUERY),
  ]);
  
  const categoryCollections = [
    shopByCategory.espresso,
    shopByCategory.pourOver,
    shopByCategory.decaf,
    shopByCategory.bestSellers,
  ].filter(Boolean);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollection: featuredCollection?.collection || null,
    categoryCollections: categoryCollections || null,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData() {
  
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home"> 
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero />
      <FeaturedCollection collection={data.featuredCollection}/>
      <ShopByCategory collections={data.categoryCollections} />
      <QuizPromoBlock />
    </div>
  );
}




/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
