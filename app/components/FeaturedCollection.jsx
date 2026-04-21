import {Image, Money} from '@shopify/hydrogen';
import {Link} from 'react-router';


export function FeaturedCollection({collection}) {
  if (!collection || !collection.products?.nodes?.length) return null;

  const products = collection.products.nodes;

  return (
    <section className="px-4 py-14 md:px-8 lg:px-12">
      <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-black/50">
            Featured collection
          </p>

          <h2 className="text-3xl font-medium tracking-[-0.04em] md:text-5xl">
            {collection.title}
          </h2>

          {collection.description ? (
            <p className="mt-3 text-sm leading-6 text-black/65 md:text-base">
              {collection.description}
            </p>
          ) : null}
        </div>

        <Link
          to={`/collections/${collection.handle}`}
          className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm transition duration-200 hover:border-black/20 hover:bg-black/[0.03]"
        >
          View collection
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
        {products.map((product) => {
          const image = product.featuredImage;
          const price = product.priceRange?.minVariantPrice;

          return (
            <Link
              key={product.id}
              to={`/products/${product.handle}`}
              className="group block text-inherit no-underline"
            >
              <div className="overflow-hidden rounded-[24px] bg-stone-100">
                {image ? (
                  <Image
                    data={image}
                    aspectRatio="1/1"
                    className="block h-auto w-full transition duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
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
        })}
      </div>
    </section>
  );
}