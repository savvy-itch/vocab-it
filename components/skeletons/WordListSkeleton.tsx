import { Skeleton } from '../ui/skeleton'

const numOfItems = 4;

export default function WordListSkeleton() {
  return (
    <div className="h-62.5 rounded-md border px-2 sm:px-4 py-3">
      {Array.from({ length: numOfItems }, (_, i) => i).map(i => 
        <article key={`sk-${i}`} className="flex justify-between my-1 p-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
        </article>
      )}
    </div>
  )
}
