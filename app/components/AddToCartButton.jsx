import {CartForm} from '@shopify/hydrogen';

/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   disabled?: boolean;
 *   lines: Array<{merchandiseId: string; quantity: number}>;
 *   onClick?: () => void;
 *   className?: string;
 * }}
 */
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className = '',
}) {
  return (
    <CartForm
      route="/cart"
      inputs={{
        lines,
      }}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher) => {
        const isLoading = fetcher.state !== 'idle';
        const isDisabled = disabled || isLoading;

        return (
          <button
            type="submit"
            onClick={onClick}
            disabled={isDisabled}
            className={className}
          >
            {isLoading ? 'Adding...' : children}
          </button>
        );
      }}
    </CartForm>
  );
}