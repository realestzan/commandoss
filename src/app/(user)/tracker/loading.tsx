import { Skeleton } from "@/components/ui/skeleton"

export default function TrackerLoading() {
    return (
        <div className='flex-1 space-y-6 rounded-3xl'>
            {/* Header Skeleton */}
            <div className='flex items-center justify-between'>
                <div>
                    <Skeleton className='h-9 w-64 mb-2' />
                    <Skeleton className='h-5 w-96' />
                </div>
                <div className='flex gap-2'>
                    <Skeleton className='h-9 w-24' />
                    <Skeleton className='h-9 w-32' />
                </div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Total Balance Card */}
                <div className='bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl rounded-3xl p-6'>
                    <div className='flex items-center justify-between'>
                        <div className='space-y-3'>
                            <Skeleton className='h-4 w-24 bg-emerald-400' />
                            <Skeleton className='h-9 w-32 bg-emerald-400' />
                            <div className='flex items-center gap-1'>
                                <Skeleton className='h-3 w-3 bg-emerald-400' />
                                <Skeleton className='h-3 w-28 bg-emerald-400' />
                            </div>
                        </div>
                        <Skeleton className='h-8 w-8 bg-emerald-400' />
                    </div>
                </div>

                {/* Monthly Income Card */}
                <div className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl p-6'>
                    <div className='flex items-center justify-between'>
                        <div className='space-y-3'>
                            <Skeleton className='h-4 w-28' />
                            <Skeleton className='h-9 w-36' />
                            <div className='flex items-center gap-1'>
                                <Skeleton className='h-3 w-3' />
                                <Skeleton className='h-3 w-20' />
                            </div>
                        </div>
                        <Skeleton className='h-8 w-8' />
                    </div>
                </div>

                {/* Monthly Expenses Card */}
                <div className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl p-6'>
                    <div className='flex items-center justify-between'>
                        <div className='space-y-3'>
                            <Skeleton className='h-4 w-32' />
                            <Skeleton className='h-9 w-40' />
                            <div className='flex items-center gap-1'>
                                <Skeleton className='h-3 w-3' />
                                <Skeleton className='h-3 w-20' />
                            </div>
                        </div>
                        <Skeleton className='h-8 w-8' />
                    </div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className='space-y-6'>
                <div className='grid w-full grid-cols-4 h-20 rounded-3xl bg-card p-1'>
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className='h-full rounded-3xl' />
                    ))}
                </div>

                {/* Filters Skeleton */}
                <div className='p-4 bg-background rounded-3xl border'>
                    <div className='flex flex-wrap gap-4'>
                        <div className='flex-1 min-w-[200px]'>
                            <Skeleton className='h-12 w-full rounded-3xl' />
                        </div>
                        <Skeleton className='h-12 w-[180px] rounded-xl' />
                        <Skeleton className='h-12 w-[140px] rounded-xl' />
                    </div>
                </div>

                {/* Content Area Skeleton */}
                <div className='bg-background rounded-3xl border'>
                    {/* Card Header */}
                    <div className='p-6 border-b'>
                        <Skeleton className='h-6 w-36 mb-2' />
                        <Skeleton className='h-4 w-48' />
                    </div>

                    {/* Card Content */}
                    <div className='p-6'>
                        <div className='space-y-3'>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className='flex items-center justify-between p-4 rounded-3xl bg-card'>
                                    <div className='flex items-center gap-4'>
                                        <Skeleton className='h-10 w-10 rounded-full' />
                                        <div className='space-y-2'>
                                            <Skeleton className='h-4 w-32' />
                                            <div className='flex items-center gap-2'>
                                                <Skeleton className='h-3 w-20' />
                                                <span className='text-muted-foreground'>•</span>
                                                <Skeleton className='h-5 w-16 rounded-full' />
                                            </div>
                                        </div>
                                    </div>
                                    <Skeleton className='h-6 w-20' />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}