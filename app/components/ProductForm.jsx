import {AddToCartButton} from './AddToCartButton';

export function ProductForm({productOptions, selectedVariant}) {
  return (
    <div className="space-y-6">
      {productOptions.map((option) => (
        <div key={option.name}>
          <h3 className="mb-3 text-sm font-medium text-[#1d1d1b]">
            {option.name}
          </h3>

          <div className="flex flex-wrap gap-2">
            {option.optionValues.map((value) => {
              const isActive = value.name === option.selectedValue;
              const isUnavailable = !value.firstSelectableVariant?.availableForSale;

              return (
                <a
                  key={value.name}
                  href={value.to}
                  prefetch="intent"
                  className={[
                    'inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-sm transition',
                    isActive
                      ? 'border-[#1d1d1b] bg-[#1d1d1b] text-white'
                      : 'border-[#d9d0c3] bg-[#f8f5f0] text-[#1d1d1b] hover:border-[#1d1d1b]',
                    isUnavailable
                      ? 'pointer-events-none opacity-40 line-through'
                      : '',
                  ].join(' ')}
                >
                  {value.name}
                </a>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-t border-[#ece3d7] pt-5">
        <AddToCartButton
          disabled={!selectedVariant?.availableForSale}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                  },
                ]
              : []
          }
          className="flex min-h-[56px] w-full items-center justify-center rounded-full bg-[#1d1d1b] px-6 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#b8afa3] disabled:text-white"
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
      </div>
    </div>
  );
}