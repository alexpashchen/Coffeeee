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

export const SHOP_COLLECTION_QUERY = `#graphql
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