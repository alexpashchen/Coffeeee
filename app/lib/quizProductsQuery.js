export const QUIZ_PRODUCTS_QUERY = `#graphql
  query QuizProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      products(first: 50) {
        nodes {
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
          roast_level: metafield(namespace: "custom", key: "roast_level") {
            value
          }
          flavor_profile: metafield(namespace: "custom", key: "flavor_profile") {
            value
          }
          acidity: metafield(namespace: "custom", key: "acidity") {
            value
          }
          intensity: metafield(namespace: "custom", key: "intensity") {
            value
          }
          brew_methods: metafield(namespace: "custom", key: "brew_methods") {
            value
          }
          beginner_friendly: metafield(namespace: "custom", key: "beginner_friendly") {
            value
          }
          best_for: metafield(namespace: "custom", key: "best_for") {
            value
          }
        }
      }
    }
  }
`;

export function mapQuizProduct(product) {
  if (!product?.handle) return null;

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    url: `/products/${product.handle}`,
    image: product.featuredImage || null,
    price: product.priceRange?.minVariantPrice || null,
    roastLevel: getAliasedMetafieldValue(product, 'roast_level'),
    flavorProfile: parseListMetafield(
      getAliasedMetafieldValue(product, 'flavor_profile'),
    ),
    acidity: getAliasedMetafieldValue(product, 'acidity'),
    intensity: normalizeIntensity(getAliasedMetafieldValue(product, 'intensity')),
    brewMethods: parseListMetafield(
      getAliasedMetafieldValue(product, 'brew_methods'),
    ),
    beginnerFriendly:
      getAliasedMetafieldValue(product, 'beginner_friendly') === 'true',
    bestFor: parseListMetafield(getAliasedMetafieldValue(product, 'best_for')),
  };
}

function getAliasedMetafieldValue(product, key) {
  return product?.[key]?.value ?? null;
}

function parseListMetafield(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim().toLowerCase());
    }
  } catch {
    // ignore
  }

  return String(value)
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeIntensity(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 3;
}