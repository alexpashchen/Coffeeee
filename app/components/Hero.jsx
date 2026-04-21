import {Link} from 'react-router';

export function Hero({
  title = 'Great Coffee,\nEvery Day.',
  subtitle = 'Freshly roasted specialty beans, sourced from the best coffee regions.',
  primaryCta = {
    label: 'Shop Now',
    to: '/collections/all',
  },
  secondaryCta = {
    label: 'Browse Coffee',
    to: '/collections/coffee',
  },
  image = {
    src: '/hero-coffee.png',
    alt: 'Cup of coffee and coffee beans',
  },
  icons = {
    icon1: {
      src: '/flame.png',
      alt: 'Freshly Roasted',
    },
    icon2: {
      src: '/world.png',    
      alt: 'Sourced Globally',
    },
    icon3: {
      src: '/beans.png',    
      alt: 'Premium Quality',
    }
  }
}) {
  const titleLines = title.split('\n');

  return (
    <section className="relative overflow-hidden bg-[#120c08] text-white px-4 md:px-8 lg:px-12">
      <img
        src={image.src}
        alt={image.alt}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className=" absolute inset-0 bg-[linear-gradient(90deg,rgba(18,12,8,0.96)_0%,rgba(18,12,8,0.88)_22%,rgba(18,12,8,0.56)_48%,rgba(18,12,8,0.16)_72%,rgba(18,12,8,0.06)_100%)]" />

      <div className="relative z-10 flex min-h-[720px] items-center  py-14   max-w-7xl mx-auto">
        <div className="max-w-[560px]">
          <h1 className="text-[52px] font-semibold leading-[0.95] tracking-[-0.04em] sm:text-[68px] lg:text-[86px]">
            {titleLines.map((line, index) => (
              <span key={`${line}-${index}`} className="block">
                {index === 1 ? (
                  <span className="text-[#c78a4a]">{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <p className="mt-8 max-w-[520px] text-base leading-7 text-white/75 sm:text-lg">
            {subtitle}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to={primaryCta.to}
              className="inline-flex min-h-[60px] items-center justify-center rounded-full bg-[#d8a15f] px-8 text-lg font-medium text-white transition hover:opacity-90"
            >
              {primaryCta.label}
            </Link>

            <Link
              to={secondaryCta.to}
              className="inline-flex min-h-[60px] items-center justify-center rounded-full border border-[#8a5a2b] px-8 text-lg font-medium text-white transition hover:bg-white/5"
            >
              {secondaryCta.label}
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="mt-1 h-10">
                <img
                    src={icons.icon1.src}
                    alt={icons.icon1.alt}
                    className="inset-0 h-full w-full"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Freshly Roasted</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="mt-1 h-10">
                <img
                    src={icons.icon2.src}
                    alt={icons.icon2.alt}
                    className="inset-0 h-full w-full"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Sourced Globally</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="mt-1 h-10">
                <img
                    src={icons.icon3.src}
                    alt={icons.icon3.alt}
                    className="inset-0 h-full w-full"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Premium Quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}