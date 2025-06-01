'use client'

import TrackerLoading from '@/app/(user)/tracker/loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { db } from '@/lib/firebase'
import { BankAccount, BillReminder, Budget, ExpenseCategory, RecurringItem, Transaction } from '@/lib/types'
import { cn } from '@/lib/utils'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { motion } from 'framer-motion'
import {
    ArrowDown,
    ArrowUp,
    Calendar,
    CreditCard,
    Plus,
    Receipt,
    RefreshCw,
    Repeat,
    Search,
    Target,
    TrendingDown,
    TrendingUp,
    Wallet
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ManualEntry from './manual'

interface FinancialData {
    transactions: Transaction[]
    budgets: Budget[]
    billReminders: BillReminder[]
    recurringItems: RecurringItem[]
    bankAccounts: BankAccount[]
}

export default function TrackerPage() {
    const { user, loading, isAuthenticated } = useAuth()
    const router = useRouter()

    // Data states
    const [financialData, setFinancialData] = useState<FinancialData>({
        transactions: [],
        budgets: [],
        billReminders: [],
        recurringItems: [],
        bankAccounts: []
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false)

    // Filter and view states
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30')
    const [activeTab, setActiveTab] = useState('transactions')

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth')
        }
    }, [loading, isAuthenticated, router])

    useEffect(() => {
        if (user) {
            fetchFinancialData()
        }
    }, [user])

    const fetchFinancialData = async () => {
        if (!user) return

        setIsLoading(true)
        try {
            // Fetch all financial data from Firestore
            const [transactions, budgets, billReminders, recurringItems, bankAccounts] = await Promise.all([
                fetchTransactions(user.id),
                fetchBudgets(user.id),
                fetchBillReminders(user.id),
                fetchRecurringItems(user.id),
                fetchBankAccounts(user.id)
            ])

            setFinancialData({
                transactions,
                budgets,
                billReminders,
                recurringItems,
                bankAccounts
            })
        } catch (error) {
            console.error('Error fetching financial data:', error)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
        try {
            const q = query(
                collection(db, 'transactions'),
                where('userId', '==', userId),
                orderBy('date', 'desc')
            )
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Transaction))
        } catch (error) {
            console.error('Error fetching transactions:', error)
            return []
        }
    }

    const fetchBudgets = async (userId: string): Promise<Budget[]> => {
        try {
            const q = query(
                collection(db, 'budgets'),
                where('userId', '==', userId),
                orderBy('startDate', 'desc')
            )
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Budget))
        } catch (error) {
            console.error('Error fetching budgets:', error)
            return []
        }
    }

    const fetchBillReminders = async (userId: string): Promise<BillReminder[]> => {
        try {
            const q = query(
                collection(db, 'billReminders'),
                where('userId', '==', userId),
                orderBy('dueDate', 'asc')
            )
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as BillReminder))
        } catch (error) {
            console.error('Error fetching bill reminders:', error)
            return []
        }
    }

    const fetchRecurringItems = async (userId: string): Promise<RecurringItem[]> => {
        try {
            const q = query(
                collection(db, 'recurringItems'),
                where('userId', '==', userId),
                orderBy('nextDueDate', 'asc')
            )
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as RecurringItem))
        } catch (error) {
            console.error('Error fetching recurring items:', error)
            return []
        }
    }

    const fetchBankAccounts = async (userId: string): Promise<BankAccount[]> => {
        try {
            const q = query(
                collection(db, 'bankAccounts'),
                where('userId', '==', userId)
            )
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as BankAccount))
        } catch (error) {
            console.error('Error fetching bank accounts:', error)
            return []
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await fetchFinancialData()
    }

    const handleManualEntryComplete = () => {
        // Refresh data after adding new item
        fetchFinancialData()
    }

    const getCategoryIcon = (category: ExpenseCategory) => {
        const icons = {
            food: '🍽️',
            transport: '🚗',
            housing: '🏠',
            utilities: '⚡',
            entertainment: '🎬',
            salary: '💰',
            savings: '💰',
            health: '🏥',
            education: '📚',
            debt: '💳',
            other: '📦'
        }
        return icons[category] || '📦'
    }

    const getStatusBadge = (status: BillReminder['status']) => {
        const variants = {
            paid: 'bg-emerald-100 text-emerald-800',
            unpaid: 'bg-orange-100 text-orange-800',
            overdue: 'bg-red-100 text-red-800'
        }
        return variants[status]
    }

    const getFrequencyIcon = (frequency: RecurringItem['frequency']) => {
        const icons = {
            weekly: '📅',
            biweekly: '📆',
            monthly: '🗓️'
        }
        return icons[frequency]
    }

    const filteredTransactions = financialData.transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory
        const withinTimeRange = selectedTimeRange === 'all' ||
            new Date(transaction.date) >= new Date(Date.now() - parseInt(selectedTimeRange) * 24 * 60 * 60 * 1000)
        return matchesSearch && matchesCategory && withinTimeRange
    })

    const totalBalance = financialData.bankAccounts.reduce((sum, account) => sum + account.balance, 0)
    const monthlyIncome = financialData.transactions
        .filter(t => t.type === 'income' && new Date(t.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
        .reduce((sum, t) => sum + t.amount, 0)
    const monthlyExpenses = financialData.transactions
        .filter(t => t.type === 'expense' && new Date(t.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
        .reduce((sum, t) => sum + t.amount, 0)

    if (!user) {
        return null
    }

    return (
        <div className='flex-1 space-y-6 rounded-3xl'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>Financial Tracker</h1>
                    <p className='text-muted-foreground'>
                        Track and manage your transactions, budgets, bills, and recurring items
                    </p>
                </div>
                <div className='flex gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className=' hover:bg-card'
                    >
                        <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
                        Refresh
                    </Button>
                    <Button
                        size='sm'
                        className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500'
                        onClick={() => setIsManualEntryOpen(true)}
                    >
                        <Plus className='w-4 h-4 mr-2' />
                        Add Entry
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <TrackerLoading />
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <Card className='bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl rounded-3xl'>
                            <CardContent className='p-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-emerald-100'>Total Balance</p>
                                        <p className='text-3xl font-bold mt-2'>
                                            ${totalBalance.toLocaleString()}
                                        </p>
                                        <div className='flex items-center gap-1 mt-2'>
                                            <TrendingUp className='w-3 h-3' />
                                            <span className='text-sm'>Across all accounts</span>
                                        </div>
                                    </div>
                                    <Wallet className='w-8 h-8 opacity-80' />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                            <CardContent className='p-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-muted-foreground'>Monthly Income</p>
                                        <p className='text-3xl font-bold mt-2 text-emerald-600'>
                                            +${monthlyIncome.toLocaleString()}
                                        </p>
                                        <div className='flex items-center gap-1 mt-2'>
                                            <ArrowUp className='w-3 h-3 text-emerald-500' />
                                            <span className='text-sm text-muted-foreground'>This month</span>
                                        </div>
                                    </div>
                                    <TrendingUp className='w-8 h-8 text-emerald-500' />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                            <CardContent className='p-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-muted-foreground'>Monthly Expenses</p>
                                        <p className='text-3xl font-bold mt-2 text-red-600'>
                                            -${monthlyExpenses.toLocaleString()}
                                        </p>
                                        <div className='flex items-center gap-1 mt-2'>
                                            <ArrowDown className='w-3 h-3 text-red-500' />
                                            <span className='text-sm text-muted-foreground'>This month</span>
                                        </div>
                                    </div>
                                    <TrendingDown className='w-8 h-8 text-red-500' />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                        <TabsList className='grid w-full grid-cols-4 h-20 rounded-3xl'>
                            <TabsTrigger className='rounded-3xl border-none' value='transactions'>
                                <div className='flex items-center gap-2'>
                                    <Receipt className='w-4 h-4' />
                                    Transactions
                                </div>
                            </TabsTrigger>
                            <TabsTrigger className='rounded-3xl border-none' value='budgets'>
                                <div className='flex items-center gap-2'>
                                    <Target className='w-4 h-4' />
                                    Budgets
                                </div>
                            </TabsTrigger>
                            <TabsTrigger className='rounded-3xl border-none' value='bills'>
                                <div className='flex items-center gap-2'>
                                    <Calendar className='w-4 h-4' />
                                    Bills & Reminders
                                </div>
                            </TabsTrigger>
                            <TabsTrigger className='rounded-3xl border-none' value='recurring'>
                                <div className='flex items-center gap-2'>
                                    <Repeat className='w-4 h-4' />
                                    Recurring Items
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value='transactions' className='space-y-6'>
                            {/* Filters */}
                            <Card className='p-4 bg-background rounded-3xl'>
                                <div className='flex flex-wrap gap-4'>
                                    <div className='flex-1 min-w-[200px]'>
                                        <div className='relative'>
                                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                                            <Input
                                                placeholder='Search transactions...'
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className='border-none p-4 pl-10 bg-none ring-0 rounded-3xl'
                                            />
                                        </div>
                                    </div>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className='w-[180px]'>
                                            <SelectValue placeholder='Category' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>All Categories</SelectItem>
                                            <SelectItem value='food'>Food</SelectItem>
                                            <SelectItem value='transport'>Transport</SelectItem>
                                            <SelectItem value='housing'>Housing</SelectItem>
                                            <SelectItem value='utilities'>Utilities</SelectItem>
                                            <SelectItem value='entertainment'>Entertainment</SelectItem>
                                            <SelectItem value='salary'>Salary</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                                        <SelectTrigger className='w-[140px]'>
                                            <SelectValue placeholder='Time Range' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='7'>Last 7 days</SelectItem>
                                            <SelectItem value='30'>Last 30 days</SelectItem>
                                            <SelectItem value='90'>Last 3 months</SelectItem>
                                            <SelectItem value='all'>All time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </Card>

                            {/* Transactions List */}
                            <Card className='bg-background rounded-3xl'>
                                <CardHeader>
                                    <CardTitle>All Transactions</CardTitle>
                                    <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-3'>
                                        {filteredTransactions.length === 0 ? (
                                            <div className='text-center py-8 text-muted-foreground'>
                                                <Receipt className='w-12 h-12 mx-auto mb-3 opacity-50' />
                                                <p className='text-sm'>No transactions found</p>
                                                <p className='text-xs'>Add your first transaction to get started!</p>
                                            </div>
                                        ) : (
                                            filteredTransactions.map((transaction) => (
                                                <motion.div
                                                    key={transaction.id}
                                                    className='flex items-center justify-between p-4 rounded-3xl bg-card transition-colors duration-200'
                                                    whileHover={{ scale: 1.01 }}
                                                >
                                                    <div className='flex items-center gap-4'>
                                                        <div className='text-2xl'>
                                                            {transaction.category && getCategoryIcon(transaction.category)}
                                                        </div>
                                                        <div>
                                                            <p className='font-medium'>{transaction.description}</p>
                                                            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                                                <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                                                {transaction.category && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <Badge variant='outline' className='text-xs'>
                                                                            {transaction.category}
                                                                        </Badge>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        'text-lg font-semibold',
                                                        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                                                    )}>
                                                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value='budgets' className='space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                {financialData.budgets.length === 0 ? (
                                    <div className='col-span-full text-center py-8 text-muted-foreground'>
                                        <Target className='w-12 h-12 mx-auto mb-3 opacity-50' />
                                        <p className='text-sm'>No budgets found</p>
                                        <p className='text-xs'>Create your first budget to track spending!</p>
                                    </div>
                                ) : (
                                    financialData.budgets.map((budget) => {
                                        // Calculate spent amount based on transactions
                                        const spentAmount = financialData.transactions
                                            .filter(t => t.type === 'expense' &&
                                                new Date(t.date) >= new Date(budget.startDate) &&
                                                new Date(t.date) <= new Date(budget.endDate))
                                            .reduce((sum, t) => sum + t.amount, 0)

                                        const progressPercentage = Math.min((spentAmount / budget.amount) * 100, 100)
                                        const remainingAmount = Math.max(budget.amount - spentAmount, 0)

                                        return (
                                            <Card key={budget.id} className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                                                <CardHeader>
                                                    <CardTitle className='flex items-center gap-2'>
                                                        <Target className='w-5 h-5 text-emerald-500' />
                                                        {budget.name}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className='space-y-4'>
                                                        <div className='flex justify-between items-center'>
                                                            <span className='text-2xl font-bold text-emerald-600'>
                                                                ${budget.amount.toLocaleString()}
                                                            </span>
                                                            <Badge variant='outline' className='bg-card text-emerald-600 '>
                                                                Active
                                                            </Badge>
                                                        </div>
                                                        <div className='w-full bg-emerald-200 rounded-full h-3'>
                                                            <div
                                                                className='bg-emerald-600 h-3 rounded-full transition-all duration-300'
                                                                style={{ width: `${progressPercentage}%` }}
                                                            />
                                                        </div>
                                                        <p className='text-sm text-muted-foreground'>
                                                            {progressPercentage.toFixed(1)}% used • ${remainingAmount.toLocaleString()} remaining
                                                        </p>
                                                        <div className='text-sm text-muted-foreground'>
                                                            Spent: ${spentAmount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value='bills' className='space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {financialData.billReminders.length === 0 ? (
                                    <div className='col-span-full text-center py-8 text-muted-foreground'>
                                        <Calendar className='w-12 h-12 mx-auto mb-3 opacity-50' />
                                        <p className='text-sm'>No bill reminders found</p>
                                        <p className='text-xs'>Add bill reminders to stay on top of payments!</p>
                                    </div>
                                ) : (
                                    financialData.billReminders.map((bill) => (
                                        <Card key={bill.id} className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                                            <CardHeader>
                                                <CardTitle className='flex items-center justify-between'>
                                                    <span className='flex items-center gap-2'>
                                                        <CreditCard className='w-5 h-5 text-emerald-500' />
                                                        {bill.name}
                                                    </span>
                                                    <Badge className={cn('text-xs', getStatusBadge(bill.status))}>
                                                        {bill.status}
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className='space-y-3'>
                                                    <p className='text-2xl font-bold text-emerald-600'>
                                                        ${bill.amount.toLocaleString()}
                                                    </p>
                                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                                        <Calendar className='w-4 h-4' />
                                                        <span>Due: {new Date(bill.dueDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <Button
                                                        size='sm'
                                                        className='w-full bg-emerald-600 hover:bg-emerald-700'
                                                        disabled={bill.status === 'paid'}
                                                    >
                                                        {bill.status === 'paid' ? 'Paid' : 'Mark as Paid'}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value='recurring' className='space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {financialData.recurringItems.length === 0 ? (
                                    <div className='col-span-full text-center py-8 text-muted-foreground'>
                                        <Repeat className='w-12 h-12 mx-auto mb-3 opacity-50' />
                                        <p className='text-sm'>No recurring items found</p>
                                        <p className='text-xs'>Set up recurring income or expenses!</p>
                                    </div>
                                ) : (
                                    financialData.recurringItems.map((item) => (
                                        <Card key={item.id} className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                                            <CardHeader>
                                                <CardTitle className='flex items-center justify-between'>
                                                    <span className='flex items-center gap-2'>
                                                        <Repeat className='w-5 h-5 text-emerald-500' />
                                                        {item.name}
                                                    </span>
                                                    <Badge variant='outline' className={cn(
                                                        'text-xs',
                                                        item.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                                                    )}>
                                                        {item.type}
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className='space-y-3'>
                                                    <p className={cn(
                                                        'text-2xl font-bold',
                                                        item.type === 'income' ? 'text-emerald-600' : 'text-orange-600'
                                                    )}>
                                                        ${item.amount.toLocaleString()}
                                                    </p>
                                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                                        <span className='text-lg'>{getFrequencyIcon(item.frequency)}</span>
                                                        <span className='capitalize'>{item.frequency}</span>
                                                    </div>
                                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                                        <Calendar className='w-4 h-4' />
                                                        <span>Next: {new Date(item.nextDueDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </>
            )}

            {/* Manual Entry Modal */}
            <ManualEntry
                user={user}
                isOpen={isManualEntryOpen}
                onClose={() => setIsManualEntryOpen(false)}
                onComplete={handleManualEntryComplete}
            />
        </div>
    )
} 