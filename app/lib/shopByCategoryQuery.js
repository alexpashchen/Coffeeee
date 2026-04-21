export const SHOP_BY_CATEGORY_QUERY = `#graphql
  query ShopByCategory(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    espresso: collection(handle: "espresso") {
      id
      title
      handle
      image { 
        url
        altText
      }
    }
    pourOver: collection(handle: "pour-over") {
      id
      title
      handle
      image {
        url
        altText
      }
    }
    decaf: collection(handle: "decaf") {
      id
      title
      handle
      image {
        url
        altText
      }
    }
    bestSellers: collection(handle: "best-sellers") {
      id
      title
      handle
      image {
        url
        altText
      }
    }
  }
`;