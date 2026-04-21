import {Link} from 'react-router';

/**
 * @param {{
 *   title?: string;
 *   subtitle?: string;
 *   ctaLabel?: string;
 *   ctaTo?: string;
 * }} props
 */
export function QuizPromoBlock({
  title = "Don’t know what to choose?",
  subtitle = 'Take our quick quiz and get a coffee recommendation based on your taste, roast preference, and brew method.',
  ctaLabel = 'Take the quiz',
  ctaTo = '/quiz',
}) {
  return (
    <section className="px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[32px] border border-stone-200 bg-[#f6f1eb]">
          <div className="grid gap-8 px-6 py-10 md:grid-cols-[1.15fr_0.85fr] md:px-10 md:py-12 lg:px-14 lg:py-16">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex rounded-full border border-stone-300 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-600">
                Coffee quiz
              </p>

              <h2 className="max-w-xl text-3xl font-medium leading-tight tracking-tight text-stone-900 md:text-4xl lg:text-5xl">
                {title}
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-stone-600 md:text-base">
                {subtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to={ctaTo}
                  className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  {ctaLabel}
                </Link>

                <span className="text-sm text-stone-500">
                  Personalized picks in 1 minute
                </span>
              </div>
            </div>

            <div className="flex items-center justify-start md:justify-end">
              <div className="w-full max-w-sm rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                      Recommended for you
                    </p>
                    <h3 className="mt-2 text-2xl font-medium tracking-tight text-stone-900">
                      Smooth & balanced
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700">
                      Chocolate
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700">
                      Nuts
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700">
                      Medium roast
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-stone-600">
                    A curated match for espresso lovers and anyone who prefers a rich, approachable cup without too much acidity.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-stone-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">
                        Roast
                      </p>
                      <p className="mt-2 text-sm font-medium text-stone-900">
                        Medium
                      </p>
                    </div>

                    <div className="rounded-2xl bg-stone-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">
                        Best for
                      </p>
                      <p className="mt-2 text-sm font-medium text-stone-900">
                        Espresso
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-[#f8f5f1] px-4 py-3">
                    <p className="text-xs text-stone-500">Quiz result preview</p>
                    <p className="mt-1 text-sm font-medium text-stone-800">
                      We’ll help you find the right coffee without overthinking it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        </div>
      </div>
    </section>
  );
}