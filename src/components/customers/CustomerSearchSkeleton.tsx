export function CustomerSearchSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="material-base flex animate-pulse gap-3 p-3">
          <div className="size-8 rounded-full bg-gray-300 md:size-9" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-gray-300" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
