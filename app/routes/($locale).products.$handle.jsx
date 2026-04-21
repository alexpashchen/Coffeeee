import {useLoaderData} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {RelatedProducts} from '~/components/RelatedProducts';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [
    {title: `${data?.product?.title ?? 'Product'} | Coffee Store`},
    {
      rel: 'canonical',
      href: `/products/${data?.product?.handle}`,
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  const relatedCollectionHandle = product.collections?.nodes?.[0]?.handle;

  let relatedProducts = [];

  if (relatedCollectionHandle) {
    const relatedData = await storefront.query(RELATED_PRODUCTS_QUERY, {
      variables: {
        collectionHandle: relatedCollectionHandle,
      },
    });

    relatedProducts =
      relatedData?.collection?.products?.nodes
        ?.filter((item) => item.handle !== product.handle)
        ?.slice(0, 4) ?? [];
  }

  return {
    product,
    relatedProducts,
  };
}

function loadDeferredData() {
  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, relatedProducts} = useLoaderData();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, vendor, descriptionHtml} = product;

  const specs = [
    {label: 'Origin', value: getMetafieldValue(product.origin)},
    {label: 'Roast', value: getMetafieldValue(product.roast)},
    {label: 'Intensity', value: formatIntensity(product.intensity)},
    {label: 'Flavor notes', value: getMetafieldValue(product.flavorNotes)},
    {label: 'Brew method', value: getMetafieldValue(product.brewingMethod)},
    {
      label: 'Caffeine',
      value: formatBooleanLabel(product.decaf, 'Decaf', 'Caffeinated'),
    },
    {
      label: 'Beginner friendly',
      value: formatBooleanLabel(product.beginnerFriendly, 'Yes', 'No'),
    },
  ].filter((item) => item.value);

  return (
    <>
      <section className="bg-[#f6f2eb] text-[#1d1d1b]">
        <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:gap-14">
            <div className="self-start lg:sticky lg:top-8">
              <div className="rounded-[28px] border border-[#e8e0d4] bg-white p-4 md:p-6">
                <div className="overflow-hidden rounded-[22px] bg-[#f8f5f0]">
                  <ProductImage image={selectedVariant?.image} />
                </div>
              </div>
            </div>

            <div className="min-w-0">
              {vendor ? (
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8a7f72]">
                  {vendor}
                </p>
              ) : null}

              <h1 className="max-w-[12ch] text-3xl font-medium leading-[1.05] md:text-4xl lg:text-5xl">
                {title}
              </h1>

              <div className="mt-5">
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                />
              </div>

              {specs.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {specs.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[20px] border border-[#e8e0d4] bg-white px-4 py-4"
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a7f72]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-[#1d1d1b]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 rounded-[24px] border border-[#e8e0d4] bg-white p-5 md:p-6">
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                />
              </div>

              <div className="mt-8 rounded-[24px] border border-[#e8e0d4] bg-[#f1ebe2] p-5 md:p-6">
                <h2 className="text-base font-medium md:text-lg">
                  About this coffee
                </h2>

                <div
                  className="prose prose-sm mt-4 max-w-none text-[#5f574d] prose-p:mb-4 prose-p:leading-7 prose-ul:my-4 prose-ul:pl-5 prose-li:leading-7"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}}
                />
              </div>
            </div>
          </div>
        </div>

        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />
      </section>

      <RelatedProducts
        title="Related products"
        products={relatedProducts}
      />
    </>
  );
}

function getMetafieldValue(metafield) {
  if (!metafield?.value) return null;

  try {
    if (metafield.type?.startsWith('list.')) {
      const parsed = JSON.parse(metafield.value);
      if (Array.isArray(parsed)) return parsed.join(', ');
    }
  } catch {}

  if (metafield.value === 'true') return 'Yes';
  if (metafield.value === 'false') return 'No';

  return metafield.value;
}

function formatBooleanLabel(metafield, trueLabel, falseLabel) {
  if (!metafield?.value) return null;
  if (metafield.value === 'true') return trueLabel;
  if (metafield.value === 'false') return falseLabel;
  return metafield.value;
}

function formatIntensity(metafield) {
  if (!metafield?.value) return null;
  return `${metafield.value}/5`;
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    handle
    title
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability

    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }

    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions,
      ignoreUnknownOptions: true,
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }

    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }

    seo {
      description
      title
    }

    collections(first: 5) {
      nodes {
        handle
        title
      }
    }

    origin: metafield(namespace: "custom", key: "origin") {
      value
      type
    }
    roast: metafield(namespace: "custom", key: "roast") {
      value
      type
    }
    intensity: metafield(namespace: "custom", key: "intensity") {
      value
      type
    }
    flavorNotes: metafield(namespace: "custom", key: "flavor_notes") {
      value
      type
    }
    brewingMethod: metafield(namespace: "custom", key: "brewing_method") {
      value
      type
    }
    decaf: metafield(namespace: "custom", key: "decaf") {
      value
      type
    }
    beginnerFriendly: metafield(namespace: "custom", key: "beginner_friendly") {
      value
      type
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const RELATED_PRODUCTS_QUERY = `#graphql
  query RelatedProducts(
    $collectionHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $collectionHandle) {
      products(first: 8) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */