'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { db } from '@/lib/firebase'
import { BankAccount, BillReminder, Budget, ExpenseCategory, RecurringItem, Transaction } from '@/lib/types'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import {
    ArrowUpRight,
    Calendar,
    CreditCard,
    DollarSign,
    Plus,
    Target,
    TrendingDown,
    TrendingUp,
    Wallet
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface FinancialStats {
    overview: {
        totalBalance: number
        monthlyIncome: number
        monthlyExpenses: number
        netWorth: number
        savingsRate: number
    }
    transactions: {
        totalTransactions: number
        thisMonth: number
        avgTransactionAmount: number
        largestExpense: number
        categoryBreakdown: Record<string, number>
    }
    budgets: {
        totalBudgets: number
        activeBudgets: number
        averageUsage: number
        overBudget: number
    }
    bills: {
        upcomingBills: number
        overdueBills: number
        totalMonthlyBills: number
        nextBillAmount: number
    }
    trends: {
        monthlyTrend: Array<{
            month: string
            income: number
            expenses: number
            savings: number
        }>
        categorySpending: Array<{
            category: string
            amount: number
            percentage: number
        }>
        recentTransactions: Array<{
            id: string
            description: string
            amount: number
            type: 'income' | 'expense' | 'transfer'
            date: string
            category?: ExpenseCategory
        }>
    }
}

const StatsLoadingSkeleton = () => (
    <main className='flex-1 space-y-6 rounded-3xl'>
        {/* Page Title Skeleton */}
        <div className='flex items-center justify-between'>
            <div>
                <Skeleton className='h-9 w-64 mb-2' />
                <Skeleton className='h-5 w-96' />
            </div>
            <div className='flex gap-2'>
                <Skeleton className='h-10 w-32' />
                <Skeleton className='h-10 w-28' />
            </div>
        </div>

        {/* Key Metrics Cards Skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {/* Total Balance Card */}
            <div className='bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl rounded-3xl p-6'>
                <div className='flex items-center justify-between'>
                    <div className='space-y-3'>
                        <Skeleton className='h-4 w-24 bg-emerald-400' />
                        <Skeleton className='h-10 w-32 bg-emerald-400' />
                        <div className='flex items-center gap-1'>
                            <Skeleton className='h-3 w-3 bg-emerald-400' />
                            <Skeleton className='h-3 w-20 bg-emerald-400' />
                        </div>
                    </div>
                    <Skeleton className='h-8 w-8 bg-emerald-400' />
                </div>
            </div>

            {/* Other Metric Cards */}
            {[...Array(3)].map((_, i) => (
                <div key={i} className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl p-6'>
                    <div className='flex items-center justify-between'>
                        <div className='space-y-3'>
                            <Skeleton className='h-4 w-28' />
                            <Skeleton className='h-10 w-36' />
                            <div className='flex items-center gap-1'>
                                <Skeleton className='h-3 w-3' />
                                <Skeleton className='h-3 w-20' />
                            </div>
                        </div>
                        <Skeleton className='h-8 w-8' />
                    </div>
                </div>
            ))}
        </div>

        {/* Bento Grid Layout Skeleton */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Monthly Trend Chart Skeleton */}
            <Card className='lg:col-span-2 bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <Skeleton className='h-6 w-48' />
                        <Skeleton className='h-5 w-5' />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='h-80'>
                        <Skeleton className='h-full w-full' />
                    </div>
                </CardContent>
            </Card>

            {/* Category Spending Skeleton */}
            <Card className='lg:col-span-1 bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <Skeleton className='h-6 w-36' />
                        <Skeleton className='h-5 w-5' />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='h-64 mb-4'>
                        <Skeleton className='h-full w-full rounded-full' />
                    </div>
                    <div className='space-y-2'>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className='flex items-center justify-between text-sm'>
                                <div className='flex items-center gap-2'>
                                    <Skeleton className='w-3 h-3 rounded-full' />
                                    <Skeleton className='h-4 w-16' />
                                </div>
                                <Skeleton className='h-4 w-12' />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Bottom Row Skeleton */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Recent Transactions Skeleton */}
            <Card className='lg:col-span-2 bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <Skeleton className='h-6 w-40' />
                    <Skeleton className='h-8 w-20' />
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className='flex items-center gap-4 p-3 rounded-3xl bg-card'>
                                <Skeleton className='w-2 h-2 rounded-full' />
                                <div className='flex-1 space-y-2'>
                                    <Skeleton className='h-4 w-32' />
                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='h-3 w-20' />
                                        <span className='text-muted-foreground'>•</span>
                                        <Skeleton className='h-3 w-16' />
                                    </div>
                                </div>
                                <Skeleton className='h-6 w-16 rounded-full' />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Financial Insights Skeleton */}
            <div className='bg-gradient-to-br from-emerald-800 to-emerald-900 text-white border-0 shadow-xl rounded-3xl p-6'>
                <div className='flex items-center gap-2 mb-6'>
                    <Skeleton className='w-5 h-5 bg-emerald-600' />
                    <Skeleton className='h-6 w-32 bg-emerald-600' />
                </div>

                <div className='space-y-4'>
                    <div className='text-center'>
                        <Skeleton className='h-9 w-24 mx-auto mb-2 bg-emerald-600' />
                        <Skeleton className='h-4 w-20 mx-auto mb-4 bg-emerald-600' />
                    </div>

                    <div className='space-y-3'>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className='flex items-center justify-between'>
                                <Skeleton className='h-4 w-32 bg-emerald-600' />
                                <Skeleton className='h-5 w-12 bg-emerald-600' />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </main>
)

export default function StatsPage() {
    const { user, loading, isAuthenticated } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState<FinancialStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState('01:24:08')

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth')
        }
    }, [loading, isAuthenticated, router])

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
            setCurrentTime(timeString)
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (user) {
            fetchFinancialStats()
        }
    }, [user])

    const fetchFinancialStats = async () => {
        if (!user) return

        setIsLoading(true)
        try {
            // Fetch all financial data
            const [transactions, budgets, billReminders, bankAccounts, recurringItems] = await Promise.all([
                fetchTransactions(user.id),
                fetchBudgets(user.id),
                fetchBillReminders(user.id),
                fetchBankAccounts(user.id),
                fetchRecurringItems(user.id)
            ])

            // Calculate stats
            const calculatedStats = calculateFinancialStats(transactions, budgets, billReminders, bankAccounts, recurringItems)
            setStats(calculatedStats)
        } catch (error) {
            console.error('Error fetching financial stats:', error)
        } finally {
            setIsLoading(false)
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
                where('userId', '==', userId)
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
                where('userId', '==', userId)
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

    const fetchRecurringItems = async (userId: string): Promise<RecurringItem[]> => {
        try {
            const q = query(
                collection(db, 'recurringItems'),
                where('userId', '==', userId)
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

    const calculateFinancialStats = (
        transactions: Transaction[],
        budgets: Budget[],
        billReminders: BillReminder[],
        bankAccounts: BankAccount[],
        recurringItems: RecurringItem[]
    ): FinancialStats => {
        const now = new Date()
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const currentYear = now.getFullYear()

        // Overview calculations
        const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0)
        const monthlyTransactions = transactions.filter(t => new Date(t.date) >= currentMonth)
        const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
        const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
        const netWorth = totalBalance + monthlyIncome - monthlyExpenses
        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0

        // Transaction analysis
        const categoryBreakdown: Record<string, number> = {}
        monthlyTransactions.forEach(t => {
            if (t.type === 'expense' && t.category) {
                categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount
            }
        })

        const expenses = transactions.filter(t => t.type === 'expense')
        const largestExpense = expenses.length > 0 ? Math.max(...expenses.map(t => t.amount)) : 0
        const avgTransactionAmount = transactions.length > 0 ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0

        // Budget analysis
        const activeBudgets = budgets.filter(b => {
            const start = new Date(b.startDate)
            const end = new Date(b.endDate)
            return now >= start && now <= end
        })

        let budgetUsageSum = 0
        let overBudgetCount = 0

        activeBudgets.forEach(budget => {
            const budgetTransactions = transactions.filter(t =>
                t.type === 'expense' &&
                new Date(t.date) >= new Date(budget.startDate) &&
                new Date(t.date) <= new Date(budget.endDate)
            )
            const spent = budgetTransactions.reduce((sum, t) => sum + t.amount, 0)
            const usage = (spent / budget.amount) * 100
            budgetUsageSum += usage
            if (usage > 100) overBudgetCount++
        })

        const averageUsage = activeBudgets.length > 0 ? budgetUsageSum / activeBudgets.length : 0

        // Bills analysis
        const upcomingBills = billReminders.filter(b => b.status === 'unpaid' && new Date(b.dueDate) > now).length
        const overdueBills = billReminders.filter(b => b.status === 'overdue').length
        const monthlyBills = recurringItems.filter(r => r.type === 'bill' && r.frequency === 'monthly')
        const totalMonthlyBills = monthlyBills.reduce((sum, r) => sum + r.amount, 0)
        const nextBill = billReminders
            .filter(b => b.status === 'unpaid' && new Date(b.dueDate) > now)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

        // Monthly trends (last 6 months)
        const monthlyTrend = []
        for (let i = 5; i >= 0; i--) {
            const month = new Date(currentYear, now.getMonth() - i, 1)
            const nextMonth = new Date(currentYear, now.getMonth() - i + 1, 1)
            const monthTransactions = transactions.filter(t => {
                const date = new Date(t.date)
                return date >= month && date < nextMonth
            })

            const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
            const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

            monthlyTrend.push({
                month: month.toLocaleDateString('en-US', { month: 'short' }),
                income,
                expenses,
                savings: income - expenses
            })
        }

        // Category spending
        const categorySpending = Object.entries(categoryBreakdown)
            .map(([category, amount]) => ({
                category: category.charAt(0).toUpperCase() + category.slice(1),
                amount,
                percentage: (amount / monthlyExpenses) * 100
            }))
            .sort((a, b) => b.amount - a.amount)

        return {
            overview: {
                totalBalance,
                monthlyIncome,
                monthlyExpenses,
                netWorth,
                savingsRate
            },
            transactions: {
                totalTransactions: transactions.length,
                thisMonth: monthlyTransactions.length,
                avgTransactionAmount,
                largestExpense,
                categoryBreakdown
            },
            budgets: {
                totalBudgets: budgets.length,
                activeBudgets: activeBudgets.length,
                averageUsage,
                overBudget: overBudgetCount
            },
            bills: {
                upcomingBills,
                overdueBills,
                totalMonthlyBills,
                nextBillAmount: nextBill?.amount || 0
            },
            trends: {
                monthlyTrend,
                categorySpending,
                recentTransactions: transactions.slice(0, 5).map(t => ({
                    id: t.id,
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    date: t.date,
                    category: t.category
                }))
            }
        }
    }

    if (!isAuthenticated) {
        return null
    }

    const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#f59e0b', '#ef4444']

    return (
        <main className='flex-1 space-y-6 rounded-3xl'>
            {/* Page Title */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>
                        Financial Statistics
                    </h1>
                    <p className='text-muted-foreground'>
                        Your comprehensive financial insights and analytics dashboard
                    </p>
                </div>
                <div className='flex gap-2'>
                    <div>
                        <Link href='/tracker'>
                            <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500'>
                                <Plus className='w-4 h-4 mr-2' />
                                Add Transaction
                            </Button>
                        </Link>
                    </div>
                    <div>
                        <Link href='/chat'>
                            <Button variant='outline' className='hover:bg-card'>
                                <DollarSign className='w-4 h-4 mr-2' />
                                AI Assistant
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <StatsLoadingSkeleton />
            ) : (
                <>
                    {/* Key Metrics Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        <Card className='bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl rounded-3xl'>
                            <CardContent className='p-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-emerald-100'>Total Balance</p>
                                        <p className='text-4xl font-bold mt-2'>
                                            ${stats?.overview.totalBalance.toLocaleString() || '0'}
                                        </p>
                                        <div className='flex items-center gap-1 mt-2'>
                                            <Wallet className='w-3 h-3' />
                                            <span className='text-sm'>All accounts</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Button variant='ghost' size='icon' className='text-white hover:bg-white/10'>
                                            <ArrowUpRight className='w-4 h-4' />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                            <CardContent className='p-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-muted-foreground'>Monthly Income</p>
                                        <p className='text-4xl font-bold mt-2 text-emerald-600'>
                                            +${stats?.overview.monthlyIncome.toLocaleString() || '0'}
                                        </p>
                                        <div className='flex items-center gap-1 mt-2'>
                                            <TrendingUp className='w-3 h-3 text-emerald-500' />
                                            <span className='text-sm text-muted-foreground'>This month</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Button variant='ghost' size='icon'>
                                            <ArrowUpRight className='w-4 h-4' />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                            <CardContent className='p-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-muted-foreground'>Monthly Expenses</p>
                                        <p className='text-4xl font-bold mt-2 text-red-600'>
                                            -${stats?.overview.monthlyExpenses.toLocaleString() || '0'}
                                        </p>
                                        <div className='flex items-center gap-1 mt-2'>
                                            <TrendingDown className='w-3 h-3 text-red-500' />
                                            <span className='text-sm text-muted-foreground'>This month</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Button variant='ghost' size='icon'>
                                            <ArrowUpRight className='w-4 h-4' />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                            <CardContent className='p-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-muted-foreground'>Savings Rate</p>
                                        <p className='text-4xl font-bold mt-2'>
                                            {stats?.overview.savingsRate.toFixed(1) || '0'}%
                                        </p>
                                        <p className='text-sm text-muted-foreground mt-2'>Monthly target</p>
                                    </div>
                                    <div>
                                        <Button variant='ghost' size='icon'>
                                            <ArrowUpRight className='w-4 h-4' />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bento Grid Layout */}
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        {/* Monthly Trend Chart */}
                        <Card className='lg:col-span-2 bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <CardTitle>Income vs Expenses Trend</CardTitle>
                                    <TrendingUp className='w-5 h-5 text-emerald-500' />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className='h-80'>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <AreaChart data={stats?.trends.monthlyTrend || []}>
                                            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                                            <XAxis dataKey='month' fontSize={12} />
                                            <YAxis fontSize={10} />
                                            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                                            <Area
                                                type='monotone'
                                                dataKey='income'
                                                stackId='1'
                                                stroke='#10b981'
                                                fill='#10b981'
                                                fillOpacity={0.6}
                                                name='Income'
                                            />
                                            <Area
                                                type='monotone'
                                                dataKey='expenses'
                                                stackId='2'
                                                stroke='#ef4444'
                                                fill='#ef4444'
                                                fillOpacity={0.6}
                                                name='Expenses'
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category Spending */}
                        <Card className='lg:col-span-1 bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <CardTitle>Spending by Category</CardTitle>
                                    <Target className='w-5 h-5 text-emerald-500' />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className='h-64'>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <PieChart>
                                            <Pie
                                                data={stats?.trends.categorySpending.slice(0, 6) || []}
                                                cx='50%'
                                                cy='50%'
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey='amount'
                                            >
                                                {(stats?.trends.categorySpending.slice(0, 6) || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className='mt-4 space-y-2'>
                                    {stats?.trends.categorySpending.slice(0, 3).map((item, index) => (
                                        <div key={item.category} className='flex items-center justify-between text-sm'>
                                            <div className='flex items-center gap-2'>
                                                <div
                                                    className='w-3 h-3 rounded-full'
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                />
                                                <span>{item.category}</span>
                                            </div>
                                            <span className='font-medium'>${item.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        {/* Recent Transactions */}
                        <Card className='lg:col-span-2 bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl'>
                            <CardHeader className='flex flex-row items-center justify-between'>
                                <CardTitle>Recent Transactions</CardTitle>
                                <div>
                                    <Link href='/tracker'>
                                        <Button variant='outline' size='sm' className='hover:bg-card'>
                                            <CreditCard className='w-4 h-4 mr-1' />
                                            View All
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    {stats?.trends.recentTransactions.length === 0 ? (
                                        <div className='text-center py-8 text-muted-foreground'>
                                            <CreditCard className='w-12 h-12 mx-auto mb-3 opacity-50' />
                                            <p className='text-sm'>No transactions yet</p>
                                            <p className='text-xs'>Add your first transaction to see it here!</p>
                                        </div>
                                    ) : (
                                        stats?.trends.recentTransactions.map((transaction) => (
                                            <div
                                                key={transaction.id}
                                                className='flex items-center gap-4 p-3 rounded-3xl bg-card transition-colors duration-200'
                                            >
                                                <div className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'
                                                    }`}></div>
                                                <div className='flex-1'>
                                                    <p className='font-medium'>{transaction.description}</p>
                                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                                        {transaction.category && (
                                                            <>
                                                                <span>•</span>
                                                                <span className='capitalize'>{transaction.category}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Badge variant='outline' className={`${transaction.type === 'income'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                        : 'bg-red-50 text-red-600 border-red-200'
                                                        }`}>
                                                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Insights */}
                        <Card className='bg-gradient-to-br from-emerald-800 to-emerald-900 text-white border-0 shadow-xl rounded-3xl'>
                            <CardHeader>
                                <CardTitle className='text-white flex items-center gap-2'>
                                    <DollarSign className='w-5 h-5' />
                                    Financial Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    <div className='text-center'>
                                        <div className='text-3xl font-mono font-bold mb-2'>
                                            {currentTime}
                                        </div>
                                        <p className='text-emerald-100 text-sm mb-4'>Current time</p>
                                    </div>

                                    <div className='space-y-3'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm'>Active budgets:</span>
                                            <Badge variant='secondary' className='bg-white/10 text-white'>
                                                {stats?.budgets.activeBudgets || 0}
                                            </Badge>
                                        </div>

                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm'>This month transactions:</span>
                                            <Badge variant='secondary' className='bg-white/10 text-white'>
                                                {stats?.transactions.thisMonth || 0}
                                            </Badge>
                                        </div>

                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm'>Upcoming bills:</span>
                                            <Badge variant='secondary' className='bg-white/10 text-white'>
                                                {stats?.bills.upcomingBills || 0}
                                            </Badge>
                                        </div>

                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm'>Net worth:</span>
                                            <Badge variant='secondary' className='bg-white/10 text-white'>
                                                ${stats?.overview.netWorth.toLocaleString() || '0'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {stats?.bills.overdueBills && stats.bills.overdueBills > 0 && (
                                        <div className='mt-4 p-3 bg-red-500/20 rounded-xl border border-red-400/30'>
                                            <div className='flex items-center gap-2'>
                                                <Calendar className='w-4 h-4 text-red-300' />
                                                <span className='text-sm text-red-100'>
                                                    {stats.bills.overdueBills} overdue bill{stats.bills.overdueBills > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </main>
    )
} 