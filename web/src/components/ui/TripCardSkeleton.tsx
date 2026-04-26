import { Card } from "./Card";
import { Skeleton } from "./Skeleton";

export function TripCardSkeleton() {
  return (
    <Card className="p-0 overflow-hidden border-none shadow-sm animate-pulse">
      <div className="flex flex-col md:flex-row">
        <div className="flex-grow p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-1/2 h-0.5" />
            <Skeleton className="w-16 h-8" />
          </div>
          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>
        <div className="bg-slate-50 md:w-64 p-8 flex flex-col items-center justify-center gap-4">
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-full h-14 rounded-xl" />
        </div>
      </div>
    </Card>
  );
}
