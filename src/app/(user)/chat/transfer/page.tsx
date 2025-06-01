'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, CheckCircle, Coins, Copy, ExternalLink, Send, Wallet, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// Interface for parsed transfer command
interface TransferCommand {
    amount: number
    currency: string
    toAddress: string
    originalMessage: string
}

// Interface for transfer status
interface TransferStatus {
    status: 'idle' | 'pending' | 'success' | 'error'
    message: string
    signature?: string
}

export default function TransferPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const currentAccount = useCurrentAccount()
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

    // State management
    const [message, setMessage] = useState('')
    const [parsedCommand, setParsedCommand] = useState<TransferCommand | null>(null)
    const [transferStatus, setTransferStatus] = useState<TransferStatus>({
        status: 'idle',
        message: ''
    })
    const [copied, setCopied] = useState(false)

    // Parse transfer command from message
    const parseTransferCommand = useCallback((input: string): TransferCommand | null => {
        // Regex patterns for SUI transfer commands
        const patterns = [
            /send\s+(\d+(?:\.\d+)?)\s+(sui)\s+to\s+(?:this\s+address\s+)?([a-zA-Z0-9]{64,66})/i,
            /transfer\s+(\d+(?:\.\d+)?)\s+(sui)\s+to\s+([a-zA-Z0-9]{64,66})/i,
            /pay\s+(\d+(?:\.\d+)?)\s+(sui)\s+to\s+([a-zA-Z0-9]{64,66})/i
        ]

        for (const pattern of patterns) {
            const match = input.match(pattern)
            if (match) {
                const [, amountStr, currency, address] = match
                const amount = parseFloat(amountStr)

                // Validate amount
                if (isNaN(amount) || amount <= 0) {
                    return null
                }

                // Validate SUI address format (should start with 0x and be 64-66 chars)
                if (!address.startsWith('0x') || (address.length !== 64 && address.length !== 66)) {
                    return null
                }

                return {
                    amount,
                    currency: currency.toUpperCase(),
                    toAddress: address,
                    originalMessage: input
                }
            }
        }
        return null
    }, [])

    // Execute SUI transfer
    const executeSuiTransfer = useCallback(async (command: TransferCommand) => {
        if (!currentAccount) {
            setTransferStatus({
                status: 'error',
                message: 'Wallet not connected'
            })
            return
        }

        try {
            setTransferStatus({
                status: 'pending',
                message: 'Creating SUI transaction...'
            })

            // Convert SUI to MIST (1 SUI = 10^9 MIST)
            const amountInMist = Math.floor(command.amount * 1_000_000_000)

            // Create a new transaction
            const transaction = new Transaction()

            // Add transfer coins transaction
            transaction.transferObjects([
                transaction.splitCoins(transaction.gas, [amountInMist])
            ], command.toAddress)

            setTransferStatus({
                status: 'pending',
                message: 'Please approve the transaction in your Slush wallet...'
            })

            // Sign and execute transaction using the hook
            signAndExecuteTransaction(
                {
                    transaction,
                    chain: 'sui:testnet', // Using testnet now
                },
                {
                    onSuccess: (result) => {
                        setTransferStatus({
                            status: 'success',
                            message: `Transfer successful! Transaction: ${result.digest}`,
                            signature: result.digest
                        })
                        toast.success('SUI transfer completed successfully!')
                    },
                    onError: (error) => {
                        console.error('Transfer failed:', error)
                        const errorMessage = error instanceof Error ? error.message : 'Transfer failed. Please try again.'
                        setTransferStatus({
                            status: 'error',
                            message: errorMessage
                        })
                        toast.error('Transfer failed: ' + errorMessage)
                    }
                }
            )

        } catch (error) {
            console.error('Transfer failed:', error)
            const errorMessage = error instanceof Error ? error.message : 'Transfer failed. Please try again.'
            setTransferStatus({
                status: 'error',
                message: errorMessage
            })
            toast.error('Transfer failed: ' + errorMessage)
        }
    }, [currentAccount, signAndExecuteTransaction])

    // Handle transfer execution
    const executeTransfer = useCallback(async (command: TransferCommand) => {
        if (!currentAccount) {
            setTransferStatus({
                status: 'error',
                message: 'Please connect your Slush wallet first'
            })
            return
        }

        switch (command.currency) {
            case 'SUI':
                await executeSuiTransfer(command)
                break
            default:
                setTransferStatus({
                    status: 'error',
                    message: `${command.currency} transfers are not supported yet. Only SUI transfers are currently available.`
                })
        }
    }, [currentAccount, executeSuiTransfer])

    // Handle message input change
    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setMessage(value)

        // Parse the message for transfer commands
        const command = parseTransferCommand(value)
        setParsedCommand(command)

        // Clear previous status when typing
        if (transferStatus.status !== 'idle') {
            setTransferStatus({ status: 'idle', message: '' })
        }
    }

    // Handle transfer button click
    const handleTransfer = async () => {
        if (!parsedCommand) return
        await executeTransfer(parsedCommand)
    }

    // Copy address to clipboard
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            toast.success('Address copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Failed to copy address')
        }
    }

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth')
        }
    }, [loading, user, router])

    // Show loading while authentication is being determined
    if (loading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-600 font-medium'>Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6'>
            <div className='max-w-6xl mx-auto'>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-center mb-8'
                >
                    <div className='flex items-center justify-center gap-3 mb-4'>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => router.back()}
                            className='absolute left-4 top-4 md:relative md:left-0 md:top-0'
                        >
                            <ArrowLeft className='h-4 w-4 mr-2' />
                            Back
                        </Button>
                        <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg'>
                            <Send className='h-8 w-8 text-white' />
                        </div>
                    </div>
                    <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                        SUI Transfer Station
                    </h1>
                    <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
                        Send SUI with simple commands like &lsquo;send 0.2 SUI to [address]&rsquo;
                    </p>
                    <div className='mt-4 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full inline-flex items-center gap-2 text-blue-700 text-sm'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
                        Running on Sui Testnet
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Input Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className='border-2 border-blue-200 shadow-xl bg-white/80 backdrop-blur-sm'>
                            <CardHeader className='pb-4'>
                                <CardTitle className='flex items-center gap-2 text-xl'>
                                    <Coins className='h-5 w-5 text-blue-600' />
                                    Transfer Command
                                </CardTitle>
                                <CardDescription className='text-base'>
                                    Type your SUI transfer request in natural language
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='relative'>
                                    <textarea
                                        value={message}
                                        onChange={handleMessageChange}
                                        placeholder='Try: "send 0.2 SUI to 0x1234...abcd for me"'
                                        className='w-full p-4 border-2 border-gray-200 rounded-xl resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50 text-lg'
                                    />
                                    <div className='absolute bottom-3 right-3 text-xs text-gray-400'>
                                        {message.length}/200
                                    </div>
                                </div>

                                {/* Parsed Command Display */}
                                <AnimatePresence>
                                    {parsedCommand && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className='p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl'
                                        >
                                            <h4 className='font-semibold text-blue-800 mb-3 flex items-center gap-2'>
                                                <CheckCircle className='h-4 w-4' />
                                                Detected Transfer
                                            </h4>
                                            <div className='space-y-3'>
                                                <div className='flex items-center justify-between'>
                                                    <span className='text-blue-700'>Amount:</span>
                                                    <span className='font-bold text-lg text-blue-900'>
                                                        {parsedCommand.amount} {parsedCommand.currency}
                                                    </span>
                                                </div>
                                                <div className='space-y-2'>
                                                    <span className='text-blue-700'>To Address:</span>
                                                    <div className='flex items-center gap-2 p-2 bg-white rounded-lg border'>
                                                        <span className='font-mono text-xs text-gray-600 flex-1 break-all'>
                                                            {parsedCommand.toAddress}
                                                        </span>
                                                        <Button
                                                            size='sm'
                                                            variant='ghost'
                                                            onClick={() => copyToClipboard(parsedCommand.toAddress)}
                                                            className='h-6 w-6 p-0'
                                                        >
                                                            {copied ? <CheckCircle className='h-3 w-3' /> : <Copy className='h-3 w-3' />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action Button */}
                                <Button
                                    onClick={handleTransfer}
                                    disabled={!parsedCommand || !currentAccount || transferStatus.status === 'pending'}
                                    className={cn(
                                        'w-full h-12 text-lg font-semibold rounded-xl transition-all',
                                        (!parsedCommand || !currentAccount)
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                                    )}
                                >
                                    {transferStatus.status === 'pending'
                                        ? (
                                            <div className='flex items-center gap-2'>
                                                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                                Processing...
                                            </div>
                                        )
                                        : !currentAccount
                                            ? 'Connect Wallet First'
                                            : 'Execute SUI Transfer'
                                    }
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Wallet & Status Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className='space-y-6'
                    >
                        {/* Wallet Status */}
                        <Card className='border-2 border-indigo-200 shadow-xl bg-white/80 backdrop-blur-sm'>
                            <CardHeader className='pb-4'>
                                <CardTitle className='flex items-center gap-2 text-xl'>
                                    <Wallet className='h-5 w-5 text-indigo-600' />
                                    Slush Wallet
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {currentAccount ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className='space-y-4'
                                    >
                                        <div className='flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg'>
                                            <CheckCircle className='h-5 w-5 text-green-600' />
                                            <span className='font-semibold text-green-800'>Connected</span>
                                        </div>
                                        <div className='space-y-2'>
                                            <label className='text-sm font-medium text-gray-700'>Wallet Address:</label>
                                            <div className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg border'>
                                                <span className='font-mono text-xs text-gray-600 flex-1 break-all'>
                                                    {currentAccount.address}
                                                </span>
                                                <Button
                                                    size='sm'
                                                    variant='ghost'
                                                    onClick={() => copyToClipboard(currentAccount.address)}
                                                >
                                                    {copied ? <CheckCircle className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className='space-y-4'>
                                        <div className='flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg'>
                                            <X className='h-5 w-5 text-gray-500' />
                                            <span className='text-gray-600'>Not Connected</span>
                                        </div>
                                        <div className='w-full [&>button]:w-full [&>button]:h-12 [&>button]:text-lg [&>button]:font-semibold [&>button]:rounded-xl'>
                                            <ConnectButton />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Transfer Status */}
                        <AnimatePresence>
                            {transferStatus.status !== 'idle' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                >
                                    <Card className={cn(
                                        'border-2 shadow-xl bg-white/80 backdrop-blur-sm',
                                        transferStatus.status === 'success' && 'border-green-200',
                                        transferStatus.status === 'error' && 'border-red-200',
                                        transferStatus.status === 'pending' && 'border-blue-200'
                                    )}>
                                        <CardHeader className='pb-4'>
                                            <CardTitle className='flex items-center gap-2 text-xl'>
                                                {transferStatus.status === 'success' ? (
                                                    <CheckCircle className='h-5 w-5 text-green-600' />
                                                ) : transferStatus.status === 'error' ? (
                                                    <AlertCircle className='h-5 w-5 text-red-600' />
                                                ) : (
                                                    <div className='h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                                                )}
                                                Transaction Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            <p className={cn(
                                                'text-base leading-relaxed',
                                                transferStatus.status === 'success' && 'text-green-700',
                                                transferStatus.status === 'error' && 'text-red-700',
                                                transferStatus.status === 'pending' && 'text-blue-700'
                                            )}>
                                                {transferStatus.message}
                                            </p>

                                            {transferStatus.signature && (
                                                <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                                                    <div className='flex items-center gap-2 mb-2'>
                                                        <ExternalLink className='h-4 w-4 text-blue-600' />
                                                        <span className='font-medium text-blue-800'>Transaction Hash</span>
                                                    </div>
                                                    <div className='font-mono text-xs text-blue-600 mb-3 break-all bg-white p-2 rounded border'>
                                                        {transferStatus.signature}
                                                    </div>
                                                    <a
                                                        href={`https://testnet.suivision.xyz/txblock/${transferStatus.signature}`}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors'
                                                    >
                                                        View on Sui Explorer
                                                        <ExternalLink className='h-4 w-4' />
                                                    </a>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Instructions */}
                        <Card className='border-2 border-purple-200 shadow-xl bg-white/80 backdrop-blur-sm'>
                            <CardHeader className='pb-4'>
                                <CardTitle className='text-xl text-purple-800'>How to Use</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3 text-gray-700'>
                                <div className='flex items-start gap-3'>
                                    <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5'>1</div>
                                    <span>Type natural language like &quot;send 0.5 SUI to [address]&quot;</span>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5'>2</div>
                                    <span>Connect your Slush wallet when prompted</span>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5'>3</div>
                                    <span>Review the parsed transaction details</span>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5'>4</div>
                                    <span>Click execute and approve in your wallet</span>
                                </div>
                                <div className='mt-4 p-3 bg-card rounded-3xl text-emerald-800'>
                                    <strong>Note:</strong> Running on Sui Testnet. Make sure you have testnet SUI for gas fees.
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
