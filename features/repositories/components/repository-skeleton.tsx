import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"

export function RepositoryCardSkeleton() {
    return (
        <Card className="flex flex-col h-full border-border/60">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2 w-full">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-3/4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-3">
                <div className="space-y-2 mb-4">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t bg-muted/20">
                <div className="flex w-full items-center justify-between gap-3">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </CardFooter>
        </Card>
    )
}

export function RepositoryListSkeleton() {
    return (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <RepositoryCardSkeleton key={i} />
            ))}
        </div>
    )
}