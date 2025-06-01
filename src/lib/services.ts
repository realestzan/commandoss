import { db } from '@/lib/firebase'
import {
    BankAccount,
    BillReminder,
    Budget,
    ChatConversation,
    FinancialGoal,
    RecurringItem,
    Transaction
} from '@/lib/types'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'

// ==================== FETCHING SERVICES ====================

export const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
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

export const fetchBudgets = async (userId: string): Promise<Budget[]> => {
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

export const fetchBillReminders = async (userId: string): Promise<BillReminder[]> => {
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

export const fetchBankAccounts = async (userId: string): Promise<BankAccount[]> => {
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

export const fetchRecurringItems = async (userId: string): Promise<RecurringItem[]> => {
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

export const fetchFinancialGoals = async (userId: string): Promise<FinancialGoal[]> => {
    try {
        const q = query(
            collection(db, 'financialGoals'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        )
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FinancialGoal))
    } catch (error) {
        console.error('Error fetching financial goals:', error)
        return []
    }
}

export const fetchChatConversations = async (userId: string): Promise<ChatConversation[]> => {
    try {
        const q = query(
            collection(db, 'conversations'),
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
        )
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ChatConversation))
    } catch (error) {
        console.error('Error fetching chat conversations:', error)
        return []
    }
}

// ==================== SEARCH SERVICES ====================

export interface SearchResult {
    id: string
    type: 'transaction' | 'budget' | 'bill' | 'account' | 'goal' | 'conversation' | 'recurring'
    title: string
    description: string
    amount?: number
    date?: string
    category?: string
    status?: string
    icon: string
    href: string
}

export const searchFinancialData = async (userId: string, query: string): Promise<SearchResult[]> => {
    if (!query.trim() || query.length < 2) return []

    const searchTerm = query.toLowerCase()
    const results: SearchResult[] = []

    try {
        // Fetch all data in parallel
        const [
            transactions,
            budgets,
            billReminders,
            bankAccounts,
            financialGoals,
            recurringItems,
            conversations
        ] = await Promise.all([
            fetchTransactions(userId),
            fetchBudgets(userId),
            fetchBillReminders(userId),
            fetchBankAccounts(userId),
            fetchFinancialGoals(userId),
            fetchRecurringItems(userId),
            fetchChatConversations(userId)
        ])

        // Search Transactions
        transactions.forEach(transaction => {
            if (
                transaction.description.toLowerCase().includes(searchTerm) ||
                transaction.category?.toLowerCase().includes(searchTerm) ||
                transaction.amount.toString().includes(searchTerm) ||
                transaction.type.toLowerCase().includes(searchTerm)
            ) {
                results.push({
                    id: transaction.id,
                    type: 'transaction',
                    title: transaction.description,
                    description: `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} • $${transaction.amount.toLocaleString()} • ${new Date(transaction.date).toLocaleDateString()}`,
                    amount: transaction.amount,
                    date: transaction.date,
                    category: transaction.category,
                    icon: transaction.type === 'income' ? 'TrendingUp' : 'TrendingDown',
                    href: '/tracker'
                })
            }
        })

        // Search Budgets
        budgets.forEach(budget => {
            if (
                budget.name.toLowerCase().includes(searchTerm) ||
                budget.amount.toString().includes(searchTerm)
            ) {
                results.push({
                    id: budget.id,
                    type: 'budget',
                    title: budget.name,
                    description: `Budget • $${budget.amount.toLocaleString()} • ${new Date(budget.startDate).toLocaleDateString()} - ${new Date(budget.endDate).toLocaleDateString()}`,
                    amount: budget.amount,
                    date: budget.startDate,
                    icon: 'Target',
                    href: '/tracker'
                })
            }
        })

        // Search Bill Reminders
        billReminders.forEach(bill => {
            if (
                bill.name.toLowerCase().includes(searchTerm) ||
                bill.amount.toString().includes(searchTerm) ||
                bill.status.toLowerCase().includes(searchTerm)
            ) {
                results.push({
                    id: bill.id,
                    type: 'bill',
                    title: bill.name,
                    description: `Bill • $${bill.amount.toLocaleString()} • Due: ${new Date(bill.dueDate).toLocaleDateString()} • ${bill.status}`,
                    amount: bill.amount,
                    date: bill.dueDate,
                    status: bill.status,
                    icon: 'Calendar',
                    href: '/tracker'
                })
            }
        })

        // Search Bank Accounts
        bankAccounts.forEach(account => {
            if (
                account.name.toLowerCase().includes(searchTerm) ||
                account.institution?.toLowerCase().includes(searchTerm) ||
                account.accountType?.toLowerCase().includes(searchTerm) ||
                account.balance.toString().includes(searchTerm)
            ) {
                results.push({
                    id: account.id,
                    type: 'account',
                    title: account.name,
                    description: `${account.accountType?.charAt(0).toUpperCase() + (account.accountType?.slice(1) || '')} Account • $${account.balance.toLocaleString()} • ${account.institution || 'No institution'}`,
                    amount: account.balance,
                    icon: 'CreditCard',
                    href: '/tracker'
                })
            }
        })

        // Search Financial Goals
        financialGoals.forEach(goal => {
            if (
                goal.name.toLowerCase().includes(searchTerm) ||
                goal.targetAmount.toString().includes(searchTerm) ||
                goal.currentAmount.toString().includes(searchTerm)
            ) {
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                results.push({
                    id: goal.id,
                    type: 'goal',
                    title: goal.name,
                    description: `Goal • $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()} (${progress.toFixed(1)}%) • ${goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}`,
                    amount: goal.targetAmount,
                    date: goal.deadline,
                    icon: 'Target',
                    href: '/stats'
                })
            }
        })

        // Search Recurring Items
        recurringItems.forEach(item => {
            if (
                item.name.toLowerCase().includes(searchTerm) ||
                item.type.toLowerCase().includes(searchTerm) ||
                item.frequency.toLowerCase().includes(searchTerm) ||
                item.amount.toString().includes(searchTerm)
            ) {
                results.push({
                    id: item.id,
                    type: 'recurring',
                    title: item.name,
                    description: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} • $${item.amount.toLocaleString()} • ${item.frequency} • Next: ${new Date(item.nextDueDate).toLocaleDateString()}`,
                    amount: item.amount,
                    date: item.nextDueDate,
                    icon: 'RotateCcw',
                    href: '/tracker'
                })
            }
        })

        // Search Chat Conversations
        conversations.forEach(conversation => {
            if (
                conversation.title.toLowerCase().includes(searchTerm) ||
                conversation.messages.some(msg => msg.content.toLowerCase().includes(searchTerm))
            ) {
                const lastMessage = conversation.messages[conversation.messages.length - 1]
                results.push({
                    id: conversation.id,
                    type: 'conversation',
                    title: conversation.title,
                    description: `Chat • ${lastMessage?.content.substring(0, 60)}${lastMessage?.content.length > 60 ? '...' : ''} • ${new Date(conversation.updatedAt).toLocaleDateString()}`,
                    date: conversation.updatedAt,
                    icon: 'MessageCircle',
                    href: `/chat/${conversation.id}`
                })
            }
        })

        // Sort results by relevance (exact matches first, then by date)
        return results
            .sort((a, b) => {
                // Exact title matches first
                const aExact = a.title.toLowerCase() === searchTerm
                const bExact = b.title.toLowerCase() === searchTerm
                if (aExact && !bExact) return -1
                if (!aExact && bExact) return 1

                // Then by date (newest first)
                if (a.date && b.date) {
                    return new Date(b.date).getTime() - new Date(a.date).getTime()
                }
                return 0
            })
            .slice(0, 20) // Limit to 20 results

    } catch (error) {
        console.error('Error searching financial data:', error)
        return []
    }
}

// ==================== UTILITY FUNCTIONS ====================

export const calculateFinancialStats = (
    transactions: Transaction[],
    budgets: Budget[],
    billReminders: BillReminder[],
    bankAccounts: BankAccount[],
    recurringItems: RecurringItem[]
) => {
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