'use client'

import Header from '@/app/(user)/header'
import Sidebar from '@/app/(user)/sidebar'
import Bgr from '@/app/(user)/stats/bgr'
import { useAuth } from '@/hooks/use-auth'
import { ReactNode } from 'react'

interface UserLayoutProps {
    children: ReactNode
}

export default function UserLayout({ children }: UserLayoutProps) {
    const { user } = useAuth()



    return (
        <div className='flex min-h-screen h-screen '>
            <Bgr />
            <Sidebar user={user || undefined} />

            {/* Main Content */}
            <div className='flex-1 flex flex-col overflow-y-scroll'>
                {user && <Header user={user} />}
                {/* Page Content */}
                <main className='flex-1 p-6 bg-card mx-4 space-y-6 rounded-3xl'>
                    {children}
                </main>
            </div>
        </div>
    )
}
