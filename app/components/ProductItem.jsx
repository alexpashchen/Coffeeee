import {Image, Money} from '@shopify/hydrogen';
import {Link} from 'react-router';

/**
 * @param {{
 *   product: {
 *     id: string;
 *     handle: string;
 *     title: string;
 *     featuredImage?: any;
 *     priceRange?: {
 *       minVariantPrice?: any;
 *     };
 *   };
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({product, loading = 'lazy'}) {
  const image = product.featuredImage;
  const price = product.priceRange?.minVariantPrice;

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group block text-inherit no-underline"
      prefetch="intent"
    >
      <div className="overflow-hidden rounded-[24px] bg-stone-100">
        {image ? (
          <Image
            data={image}
            aspectRatio="1/1"
            loading={loading}
            className="block h-auto w-full transition duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="aspect-square w-full bg-stone-200" />
        )}
      </div>

      <div className="px-1 pt-4">
        <h3 className="text-base font-medium leading-[1.35]">
          {product.title}
        </h3>

        {price ? (
          <div className="mt-2 text-sm text-black/65">
            <Money data={price} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}