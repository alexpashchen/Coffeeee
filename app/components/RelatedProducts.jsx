import {Link} from 'react-router';
import {ProductItem} from '~/components/ProductItem';

/**
 * @param {{
 *   title?: string;
 *   products?: Array<any>;
 * }}
 */
export function RelatedProducts({
  title = 'You may also like',
  products = [],
}) {
  if (!products?.length) return null;

  return (
    <section className="px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-neutral-500">
              Discover more
            </p>
            <h2 className="text-2xl font-medium tracking-tight text-neutral-900 md:text-4xl">
              {title}
            </h2>
          </div>

          <Link
            to="/collections/all-coffee"
            className="hidden border-b border-neutral-900 pb-1 text-sm font-medium text-neutral-900 transition-opacity duration-200 hover:opacity-60 md:inline-block"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6 md:gap-y-10">
          {products.slice(0, 4).map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              loading="lazy"
            />
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Link
            to="/collections/all-coffee"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-neutral-900 px-6 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-900 hover:text-white"
          >
            View all
          </Link>
        </div>
      </div>
    </section>
  );
}