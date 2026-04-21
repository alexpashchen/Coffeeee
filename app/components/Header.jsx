import {Suspense, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import cartIcon from '~/assets/cart-icon.svg';

/**
 * @param {HeaderProps}
 */
export function Header({header, cart, publicStoreDomain}) {
  const {shop, menu} = header;

  return (
    <header className="border-b border-black/10 bg-[#f7f6f2] px-6 lg:px-10">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center">
          <NavLink
            prefetch="intent"
            to="/"
            end
            className="text-[18px] font-semibold tracking-[-0.02em] text-black"
          >
            {shop.name}
          </NavLink>
        </div>

        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />

        <div className="flex flex-1 items-center justify-end">
          <HeaderCtas
            cart={cart}
            menu={menu}
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />
        </div>
      </div>
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const {close} = useAside();
  const items = (menu || FALLBACK_HEADER_MENU).items;

  if (viewport === 'mobile') {
    return (
      <nav className="flex flex-col gap-3" role="navigation">
        <NavLink
          end
          to="/"
          prefetch="intent"
          onClick={close}
          className={navLinkClassName}
        >
          Home
        </NavLink>

        {items.map((item) => {
          return (
            <MobileMenuItem
              key={item.id}
              item={item}
              close={close}
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
            />
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      className="hidden items-center justify-center gap-10 md:flex"
      role="navigation"
    >
      {items.map((item) => (
        <DesktopMegaMenuItem
          key={item.id}
          item={item}
          close={close}
          primaryDomainUrl={primaryDomainUrl}
          publicStoreDomain={publicStoreDomain}
        />
      ))}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'> & {
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
function HeaderCtas({cart, menu, primaryDomainUrl, publicStoreDomain}) {
  return (
    <nav className="flex items-center gap-3" role="navigation">
      <HeaderMenuMobileToggle
        menu={menu}
        primaryDomainUrl={primaryDomainUrl}
        publicStoreDomain={publicStoreDomain}
      />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}) {
  const {open} = useAside();

  return (
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black transition hover:border-black/20 md:hidden"
      onClick={() =>
        open(
          'mobile',
          <HeaderMenu
            menu={menu}
            viewport="mobile"
            primaryDomainUrl={primaryDomainUrl}
            publicStoreDomain={publicStoreDomain}
          />,
        )
      }
      aria-label="Open menu"
    >
      <span className="text-lg leading-none">☰</span>
    </button>
  );
}

function DesktopMegaMenuItem({
  item,
  close,
  primaryDomainUrl,
  publicStoreDomain,
}) {
  const normalizedUrl = normalizeMenuUrl(
    item.url,
    primaryDomainUrl,
    publicStoreDomain,
  );
  const children = item.items || [];
  const hasChildren = children.length > 0;

  if (!item.url && !hasChildren) return null;

  if (!hasChildren) {
    return (
      <NavLink
        end
        to={normalizedUrl || '#'}
        prefetch="intent"
        onClick={close}
        className={navLinkClassName}
      >
        {item.title}
      </NavLink>
    );
  }

  const groupedChildren = chunkArray(children, 6);

  return (
    <div className="group relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-medium text-black/75 transition hover:text-black"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span>{item.title}</span>
      </button>

      <div className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-[720px] -translate-x-1/2 pt-5 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center justify-between border-b border-black/6 pb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/45">
                Browse
              </p>
              <p className="mt-1 text-base font-semibold text-black">
                {item.title}
              </p>
            </div>

            {normalizedUrl ? (
              <NavLink
                to={normalizedUrl}
                prefetch="intent"
                onClick={close}
                className="text-sm font-medium text-black/60 transition hover:text-black"
              >
                View all
              </NavLink>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {groupedChildren.map((group, groupIndex) => (
              <div
                key={`${item.id}-group-${groupIndex}`}
                className="rounded-2xl bg-[#f7f6f2] p-3"
              >
                <ul className="space-y-1">
                  {group.map((child) => {
                    const childUrl = normalizeMenuUrl(
                      child.url,
                      primaryDomainUrl,
                      publicStoreDomain,
                    );

                    if (!childUrl) return null;

                    return (
                      <li key={child.id}>
                        <NavLink
                          to={childUrl}
                          prefetch="intent"
                          onClick={close}
                          className={({isActive}) =>
                            [
                              'block rounded-xl px-3 py-2 text-sm transition',
                              isActive
                                ? 'bg-white text-black'
                                : 'text-black/72 hover:bg-white hover:text-black',
                            ].join(' ')
                          }
                        >
                          {child.title}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMenuItem({
  item,
  close,
  primaryDomainUrl,
  publicStoreDomain,
  depth = 0,
}) {
  const [open, setOpen] = useState(false);

  const normalizedUrl = normalizeMenuUrl(
    item.url,
    primaryDomainUrl,
    publicStoreDomain,
  );
  const children = item.items || [];
  const hasChildren = children.length > 0;

  if (!normalizedUrl && !hasChildren) return null;

  if (!hasChildren) {
    return (
      <NavLink
        end
        to={normalizedUrl || '#'}
        prefetch="intent"
        onClick={close}
        className={({isActive}) =>
          [
            'block rounded-xl px-3 py-2 text-sm font-medium transition',
            depth > 0 ? 'ml-4' : '',
            isActive
              ? 'bg-black text-white'
              : 'text-black/80 hover:bg-black/5 hover:text-black',
          ].join(' ')
        }
      >
        {item.title}
      </NavLink>
    );
  }

  return (
    <div className={depth > 0 ? 'ml-4' : ''}>
      <div className="flex items-center gap-2">
        {normalizedUrl ? (
          <NavLink
            to={normalizedUrl}
            prefetch="intent"
            onClick={close}
            className={({isActive}) =>
              [
                'flex-1 rounded-xl px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-black text-white'
                  : 'text-black/80 hover:bg-black/5 hover:text-black',
              ].join(' ')
            }
          >
            {item.title}
          </NavLink>
        ) : (
          <div className="flex-1 rounded-xl px-3 py-2 text-sm font-medium text-black">
            {item.title}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 text-sm text-black"
          aria-expanded={open}
          aria-label={`Toggle ${item.title} submenu`}
        >
          <span className={`transition ${open ? 'rotate-180' : ''}`}>▾</span>
        </button>
      </div>

      {open ? (
        <div className="mt-2 flex flex-col gap-2">
          {children.map((child) => (
            <MobileMenuItem
              key={child.id}
              item={child}
              close={close}
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * @param {{count: number}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="cart-icon text-sm font-medium text-black/80 transition hover:text-black"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <img
        src={cartIcon}
        alt="Cart"
        className="h-5 w-5"
      />{' '}
      <span>{count}</span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);

  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function normalizeMenuUrl(url, primaryDomainUrl, publicStoreDomain) {
  if (!url) return null;

  if (
    url.includes('myshopify.com') ||
    url.includes(publicStoreDomain) ||
    url.includes(primaryDomainUrl)
  ) {
    return new URL(url).pathname;
  }

  return url;
}

function chunkArray(items, size) {
  const result = [];

  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }

  return result;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function navLinkClassName({isActive}) {
  return [
    'text-sm font-medium transition',
    isActive ? 'text-black' : 'text-black/75 hover:text-black',
  ].join(' ');
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */