import {Link} from 'react-router';

export function ShopByCategory({title = 'Shop by Category', collections}) {
  const items = collections || []; 
  if (!items.length) return null;

  return (
    <section className="bg-[#f5f1ea] px-4 py-14 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-neutral-500">
              Collections
            </p>
            <h2 className="text-3xl font-medium tracking-tight text-neutral-900 md:text-4xl">
              {title}
            </h2>
          </div>

          <Link
            to="/collections"
            className="inline-flex items-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            All Collections
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.handle}`}
              className="group overflow-hidden rounded-3xl border border-black/5 bg-white transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
            >
              <div className="aspect-[4/4.6] overflow-hidden bg-[#ebe4d8]">
                {collection.image?.url ? (
                  <img
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center">
                    <span className="text-sm uppercase tracking-[0.2em] text-neutral-500">
                      {collection.title}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900">
                    {collection.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Explore collection
                  </p>
                </div>

                <span className="text-lg text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}