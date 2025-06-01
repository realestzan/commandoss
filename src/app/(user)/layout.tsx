'use client'

import Header from '@/app/(user)/header'
import Sidebar from '@/app/(user)/sidebar'
import Bgr from '@/app/(user)/stats/bgr'
import { useAuth } from '@/hooks/use-auth'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'

// Import dApp Kit styles
import '@mysten/dapp-kit/dist/index.css'

// Create query client for React Query
const queryClient = new QueryClient()

// Configure Sui networks
const networks = {
    devnet: { url: getFullnodeUrl('devnet') },
    testnet: { url: getFullnodeUrl('testnet') },
    mainnet: { url: getFullnodeUrl('mainnet') }
}

interface UserLayoutProps {
    children: ReactNode
}

export default function UserLayout({ children }: UserLayoutProps) {
    const { user } = useAuth()

    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networks} defaultNetwork='testnet'>
                <WalletProvider
                    slushWallet={{
                        name: 'Realfin Finance App'
                    }}
                >
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
                    <Toaster position='top-right' richColors />
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    )
}
