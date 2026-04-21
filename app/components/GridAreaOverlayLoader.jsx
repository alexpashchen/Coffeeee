function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-black" />
  );
}

export function GridAreaOverlayLoader() {
  return (
    <div className="absolute inset-0 z-10 bg-white/45 backdrop-blur-[1px]">
      <div className="sticky top-4 flex justify-center p-4">
        <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2 shadow-sm">
          <Spinner />
          <span className="text-sm text-neutral-700">Updating products...</span>
        </div>
      </div>
    </div>
  );
}