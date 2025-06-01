'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { db } from '@/lib/firebase'
import { BankAccount, BillReminder, Budget, Currency, ExpenseCategory, RecurringItem, Transaction, User } from '@/lib/types'
import { cn } from '@/lib/utils'
import { addDoc, collection } from 'firebase/firestore'
import { motion, Variants } from 'framer-motion'
import {
    ArrowLeft,
    Bot,
    Calendar,
    CheckCircle,
    Plus,
    Receipt,
    RefreshCw,
    Target,
    Wallet,
    X
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface ManualEntryProps {
    user: User
    isOpen: boolean
    onClose: () => void
    onComplete?: () => void
    className?: string
    initialType?: DataType
}

type DataType =
    | 'transaction'
    | 'budget'
    | 'bill-reminder'
    | 'bank-account'
    | 'recurring-item'

type ManualStep =
    | 'select-type'
    | 'transaction-details'
    | 'budget-details'
    | 'bill-details'
    | 'account-details'
    | 'recurring-details'
    | 'completion'

interface FormData {
    // Transaction fields
    transactionType?: 'income' | 'expense' | 'transfer'
    amount?: string
    description?: string
    date?: string
    category?: ExpenseCategory

    // Budget fields
    budgetName?: string
    budgetAmount?: string
    startDate?: string
    endDate?: string

    // Bill reminder fields
    billName?: string
    billAmount?: string
    dueDate?: string
    status?: 'paid' | 'unpaid' | 'overdue'

    // Bank account fields
    accountName?: string
    balance?: string
    institution?: string
    accountType?: 'checking' | 'savings' | 'credit'

    // Recurring item fields
    recurringName?: string
    recurringType?: 'income' | 'bill'
    recurringAmount?: string
    frequency?: 'weekly' | 'biweekly' | 'monthly'
    nextDueDate?: string
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100
        }
    }
}

const DATA_TYPES = [
    {
        type: 'transaction' as DataType,
        name: 'Transaction',
        description: 'Add income, expense, or transfer',
        icon: Receipt,
        color: 'from-emerald-500 to-emerald-600'
    },
    {
        type: 'budget' as DataType,
        name: 'Budget',
        description: 'Create spending budget',
        icon: Target,
        color: 'from-blue-500 to-blue-600'
    },
    {
        type: 'bill-reminder' as DataType,
        name: 'Bill Reminder',
        description: 'Set up payment reminder',
        icon: Calendar,
        color: 'from-orange-500 to-orange-600'
    },
    {
        type: 'bank-account' as DataType,
        name: 'Bank Account',
        description: 'Add bank account',
        icon: Wallet,
        color: 'from-purple-500 to-purple-600'
    },
    {
        type: 'recurring-item' as DataType,
        name: 'Recurring Item',
        description: 'Set up recurring income/bill',
        icon: RefreshCw,
        color: 'from-pink-500 to-pink-600'
    }
]

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
    { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
    { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
    { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
    { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
    { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
    { value: 'MXN', label: 'Mexican Peso', symbol: '$' },
]

export default function ManualEntry({ user, isOpen, onClose, onComplete, initialType }: ManualEntryProps) {
    const [currentStep, setCurrentStep] = useState<ManualStep>('select-type')
    const [selectedType, setSelectedType] = useState<DataType | null>(initialType || null)
    const [formData, setFormData] = useState<FormData>({})
    const [isLoading, setIsLoading] = useState(false)

    const selectedCurrency = CURRENCIES.find(c => c.value === user.preferredCurrency) || CURRENCIES[0]

    useEffect(() => {
        if (isOpen) {
            if (initialType) {
                setSelectedType(initialType)
                setFormData({})
                setIsLoading(false)
                // Automatically navigate to the specific step
                switch (initialType) {
                    case 'transaction':
                        setCurrentStep('transaction-details')
                        break
                    case 'budget':
                        setCurrentStep('budget-details')
                        break
                    case 'bill-reminder':
                        setCurrentStep('bill-details')
                        break
                    case 'bank-account':
                        setCurrentStep('account-details')
                        break
                    case 'recurring-item':
                        setCurrentStep('recurring-details')
                        break
                }
            } else {
                setCurrentStep('select-type')
                setSelectedType(null)
                setFormData({})
                setIsLoading(false)
            }
        }
    }, [isOpen, initialType])

    const handleTypeSelect = (type: DataType) => {
        setSelectedType(type)
        setFormData({})

        switch (type) {
            case 'transaction':
                setCurrentStep('transaction-details')
                break
            case 'budget':
                setCurrentStep('budget-details')
                break
            case 'bill-reminder':
                setCurrentStep('bill-details')
                break
            case 'bank-account':
                setCurrentStep('account-details')
                break
            case 'recurring-item':
                setCurrentStep('recurring-details')
                break
        }
    }

    const handleBack = () => {
        if (currentStep === 'select-type' || initialType) {
            onClose()
        } else {
            setCurrentStep('select-type')
            setSelectedType(null)
            setFormData({})
        }
    }

    const handleSubmit = async () => {
        if (!selectedType) return

        setIsLoading(true)
        try {
            switch (selectedType) {
                case 'transaction':
                    const transaction: Omit<Transaction, 'id'> = {
                        userId: user.id,
                        type: formData.transactionType!,
                        amount: parseFloat(formData.amount!),
                        description: formData.description!,
                        date: formData.date!,
                        category: formData.category
                    }
                    await addDoc(collection(db, 'transactions'), transaction)
                    break

                case 'budget':
                    const budget: Omit<Budget, 'id'> = {
                        userId: user.id,
                        name: formData.budgetName!,
                        amount: parseFloat(formData.budgetAmount!),
                        startDate: formData.startDate!,
                        endDate: formData.endDate!
                    }
                    await addDoc(collection(db, 'budgets'), budget)
                    break

                case 'bill-reminder':
                    const billReminder: Omit<BillReminder, 'id'> = {
                        userId: user.id,
                        name: formData.billName!,
                        amount: parseFloat(formData.billAmount!),
                        dueDate: formData.dueDate!,
                        status: formData.status || 'unpaid'
                    }
                    await addDoc(collection(db, 'billReminders'), billReminder)
                    break

                case 'bank-account':
                    const bankAccount: Omit<BankAccount, 'id'> = {
                        userId: user.id,
                        name: formData.accountName!,
                        balance: parseFloat(formData.balance!),
                        institution: formData.institution,
                        accountType: formData.accountType
                    }
                    await addDoc(collection(db, 'bankAccounts'), bankAccount)
                    break

                case 'recurring-item':
                    const recurringItem: Omit<RecurringItem, 'id'> = {
                        userId: user.id,
                        name: formData.recurringName!,
                        type: formData.recurringType!,
                        amount: parseFloat(formData.recurringAmount!),
                        frequency: formData.frequency!,
                        nextDueDate: formData.nextDueDate!
                    }
                    await addDoc(collection(db, 'recurringItems'), recurringItem)
                    break
            }

            setCurrentStep('completion')
            setTimeout(() => {
                onComplete?.()
                onClose()
            }, 2000)
        } catch (error) {
            console.error('Error saving data:', error)
            // You might want to show an error message to the user here
        } finally {
            setIsLoading(false)
        }
    }

    const isFormValid = () => {
        switch (selectedType) {
            case 'transaction':
                return formData.transactionType && formData.amount && formData.description && formData.date
            case 'budget':
                return formData.budgetName && formData.budgetAmount && formData.startDate && formData.endDate
            case 'bill-reminder':
                return formData.billName && formData.billAmount && formData.dueDate
            case 'bank-account':
                return formData.accountName && formData.balance
            case 'recurring-item':
                return formData.recurringName && formData.recurringAmount && formData.frequency && formData.nextDueDate
            default:
                return false
        }
    }

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="min-w-[40vw] max-h-[90vh] overflow-hidden shadow-2xl border-0 p-0">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col h-full"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-border bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBack}
                                    className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-800/30 rounded-xl"
                                >
                                    {currentStep === 'select-type' && !initialType ? (
                                        <X className="w-5 h-5" />
                                    ) : (
                                        <ArrowLeft className="w-5 h-5" />
                                    )}
                                </Button>
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {initialType && currentStep !== 'select-type'
                                            ? `Add ${DATA_TYPES.find(t => t.type === selectedType)?.name}`
                                            : 'Add Financial Data'
                                        }
                                    </h2>
                                    <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                        {currentStep === 'select-type' ? 'Choose what you want to add' :
                                            selectedType ? `Enter your ${DATA_TYPES.find(t => t.type === selectedType)?.name.toLowerCase()} details` : ''}
                                    </p>
                                </div>
                            </div>
                            {currentStep !== 'select-type' && currentStep !== 'completion' && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        {currentStep === 'select-type' && (
                            <motion.div variants={itemVariants} className="space-y-6">
                                <div className="text-center mb-8">
                                    <h3 className="text-lg font-semibold mb-2">What would you like to add?</h3>
                                    <p className="text-muted-foreground">Select the type of financial data you want to track</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {DATA_TYPES.map((type) => {
                                        const IconComponent = type.icon
                                        return (
                                            <motion.div
                                                key={type.type}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="group"
                                            >
                                                <Card
                                                    className="cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-emerald-500/10 border-emerald-200/50 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-3xl"
                                                    onClick={() => handleTypeSelect(type.type)}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-center gap-6">
                                                            <div className={cn('p-4 rounded-2xl bg-gradient-to-r text-white shadow-lg', type.color)}>
                                                                <IconComponent className="w-8 h-8" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-xl mb-1">{type.name}</h3>
                                                                <p className="text-muted-foreground text-sm line-clamp-1">{type.description}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'transaction-details' && (
                            <motion.div variants={itemVariants} className="space-y-8">
                                <div className="bg-gradient-to-r from-emerald-50/80 to-blue-50/80 dark:from-emerald-950/20 dark:to-blue-950/20 p-6 rounded-3xl border border-emerald-200/50 dark:border-emerald-800/30">
                                    <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="transaction-type" className="text-sm font-medium">Transaction Type</Label>
                                            <Select
                                                value={formData.transactionType}
                                                onValueChange={(value: 'income' | 'expense' | 'transfer') =>
                                                    setFormData({ ...formData, transactionType: value })
                                                }
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400">
                                                    <SelectValue placeholder="Select transaction type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="income">💰 Income</SelectItem>
                                                    <SelectItem value="expense">💸 Expense</SelectItem>
                                                    <SelectItem value="transfer">🔄 Transfer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 font-semibold text-lg">
                                                    {selectedCurrency.symbol}
                                                </span>
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                    className="h-12 pl-10 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400 text-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card/50 p-6 rounded-3xl border border-border">
                                    <h4 className="text-md font-medium mb-4">Additional Information</h4>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                            <Input
                                                id="description"
                                                placeholder="e.g., Grocery shopping at Whole Foods"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                                                <Input
                                                    id="date"
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                    className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(value: ExpenseCategory) =>
                                                        setFormData({ ...formData, category: value })
                                                    }
                                                >
                                                    <SelectTrigger className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="food">🍕 Food & Dining</SelectItem>
                                                        <SelectItem value="transport">🚗 Transportation</SelectItem>
                                                        <SelectItem value="housing">🏠 Housing</SelectItem>
                                                        <SelectItem value="utilities">⚡ Utilities</SelectItem>
                                                        <SelectItem value="entertainment">🎬 Entertainment</SelectItem>
                                                        <SelectItem value="salary">💼 Salary</SelectItem>
                                                        <SelectItem value="savings">🏦 Savings</SelectItem>
                                                        <SelectItem value="health">🏥 Health & Medical</SelectItem>
                                                        <SelectItem value="education">📚 Education</SelectItem>
                                                        <SelectItem value="debt">💳 Debt Payment</SelectItem>
                                                        <SelectItem value="other">📝 Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'budget-details' && (
                            <motion.div variants={itemVariants} className="space-y-8">
                                <div className="bg-gradient-to-r from-emerald-50/80 to-blue-50/80 dark:from-emerald-950/20 dark:to-blue-950/20 p-6 rounded-3xl border border-emerald-200/50 dark:border-emerald-800/30">
                                    <h3 className="text-lg font-semibold mb-4">Budget Information</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="budget-name" className="text-sm font-medium">Budget Name</Label>
                                            <Input
                                                id="budget-name"
                                                placeholder="e.g., Monthly Expenses"
                                                value={formData.budgetName}
                                                onChange={(e) => setFormData({ ...formData, budgetName: e.target.value })}
                                                className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="budget-amount" className="text-sm font-medium">Budget Amount</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 font-semibold text-lg">
                                                    {selectedCurrency.symbol}
                                                </span>
                                                <Input
                                                    id="budget-amount"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="2500.00"
                                                    value={formData.budgetAmount}
                                                    onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                                                    className="h-12 pl-10 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400 text-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card/50 p-6 rounded-3xl border border-border">
                                    <h4 className="text-md font-medium mb-4">Budget Period</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
                                            <Input
                                                id="start-date"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
                                            <Input
                                                id="end-date"
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'bill-details' && (
                            <motion.div variants={itemVariants} className="space-y-8">
                                <div className="bg-gradient-to-r from-emerald-50/80 to-orange-50/80 dark:from-emerald-950/20 dark:to-orange-950/20 p-6 rounded-3xl border border-emerald-200/50 dark:border-emerald-800/30">
                                    <h3 className="text-lg font-semibold mb-4">Bill Information</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="bill-name" className="text-sm font-medium">Bill Name</Label>
                                            <Input
                                                id="bill-name"
                                                placeholder="e.g., Rent Payment"
                                                value={formData.billName}
                                                onChange={(e) => setFormData({ ...formData, billName: e.target.value })}
                                                className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="bill-amount" className="text-sm font-medium">Amount</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 font-semibold text-lg">
                                                        {selectedCurrency.symbol}
                                                    </span>
                                                    <Input
                                                        id="bill-amount"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="1200.00"
                                                        value={formData.billAmount}
                                                        onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })}
                                                        className="h-12 pl-10 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400 text-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="due-date" className="text-sm font-medium">Due Date</Label>
                                                <Input
                                                    id="due-date"
                                                    type="date"
                                                    value={formData.dueDate}
                                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                    className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card/50 p-6 rounded-3xl border border-border">
                                    <h4 className="text-md font-medium mb-4">Payment Status</h4>
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value: 'paid' | 'unpaid' | 'overdue') =>
                                                setFormData({ ...formData, status: value })
                                            }
                                        >
                                            <SelectTrigger className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unpaid">📋 Unpaid</SelectItem>
                                                <SelectItem value="paid">✅ Paid</SelectItem>
                                                <SelectItem value="overdue">⚠️ Overdue</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'account-details' && (
                            <motion.div variants={itemVariants} className="space-y-8">
                                <div className="bg-gradient-to-r from-emerald-50/80 to-purple-50/80 dark:from-emerald-950/20 dark:to-purple-950/20 p-6 rounded-3xl border border-emerald-200/50 dark:border-emerald-800/30">
                                    <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="account-name" className="text-sm font-medium">Account Name</Label>
                                            <Input
                                                id="account-name"
                                                placeholder="e.g., Main Checking"
                                                value={formData.accountName}
                                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                                className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="balance" className="text-sm font-medium">Current Balance</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 font-semibold text-lg">
                                                        {selectedCurrency.symbol}
                                                    </span>
                                                    <Input
                                                        id="balance"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="2847.50"
                                                        value={formData.balance}
                                                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                                        className="h-12 pl-10 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400 text-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="account-type" className="text-sm font-medium">Account Type</Label>
                                                <Select
                                                    value={formData.accountType}
                                                    onValueChange={(value: 'checking' | 'savings' | 'credit') =>
                                                        setFormData({ ...formData, accountType: value })
                                                    }
                                                >
                                                    <SelectTrigger className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="checking">🏦 Checking</SelectItem>
                                                        <SelectItem value="savings">💰 Savings</SelectItem>
                                                        <SelectItem value="credit">💳 Credit</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card/50 p-6 rounded-3xl border border-border">
                                    <h4 className="text-md font-medium mb-4">Additional Details</h4>
                                    <div className="space-y-2">
                                        <Label htmlFor="institution" className="text-sm font-medium">Institution (Optional)</Label>
                                        <Input
                                            id="institution"
                                            placeholder="e.g., Chase Bank"
                                            value={formData.institution}
                                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                            className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'recurring-details' && (
                            <motion.div variants={itemVariants} className="space-y-8">
                                <div className="bg-gradient-to-r from-emerald-50/80 to-pink-50/80 dark:from-emerald-950/20 dark:to-pink-950/20 p-6 rounded-3xl border border-emerald-200/50 dark:border-emerald-800/30">
                                    <h3 className="text-lg font-semibold mb-4">Recurring Item Details</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="recurring-name" className="text-sm font-medium">Name</Label>
                                            <Input
                                                id="recurring-name"
                                                placeholder="e.g., Monthly Salary"
                                                value={formData.recurringName}
                                                onChange={(e) => setFormData({ ...formData, recurringName: e.target.value })}
                                                className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="recurring-type" className="text-sm font-medium">Type</Label>
                                                <Select
                                                    value={formData.recurringType}
                                                    onValueChange={(value: 'income' | 'bill') =>
                                                        setFormData({ ...formData, recurringType: value })
                                                    }
                                                >
                                                    <SelectTrigger className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="income">💰 Income</SelectItem>
                                                        <SelectItem value="bill">📋 Bill</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="recurring-amount" className="text-sm font-medium">Amount</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 font-semibold text-lg">
                                                        {selectedCurrency.symbol}
                                                    </span>
                                                    <Input
                                                        id="recurring-amount"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="3200.00"
                                                        value={formData.recurringAmount}
                                                        onChange={(e) => setFormData({ ...formData, recurringAmount: e.target.value })}
                                                        className="h-12 pl-10 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400 text-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card/50 p-6 rounded-3xl border border-border">
                                    <h4 className="text-md font-medium mb-4">Schedule Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="frequency" className="text-sm font-medium">Frequency</Label>
                                            <Select
                                                value={formData.frequency}
                                                onValueChange={(value: 'weekly' | 'biweekly' | 'monthly') =>
                                                    setFormData({ ...formData, frequency: value })
                                                }
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400">
                                                    <SelectValue placeholder="Select frequency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="weekly">📅 Weekly</SelectItem>
                                                    <SelectItem value="biweekly">📆 Biweekly</SelectItem>
                                                    <SelectItem value="monthly">🗓️ Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="next-due-date" className="text-sm font-medium">Next Due Date</Label>
                                            <Input
                                                id="next-due-date"
                                                type="date"
                                                value={formData.nextDueDate}
                                                onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                                                className="h-12 rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'completion' && (
                            <motion.div variants={itemVariants} className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold mb-3">Successfully Added!</h3>
                                <p className="text-lg text-muted-foreground mb-6">
                                    Your {selectedType ? DATA_TYPES.find(t => t.type === selectedType)?.name.toLowerCase() : 'data'} has been saved to your account.
                                </p>
                                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl inline-block border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-emerald-700 dark:text-emerald-400 font-medium">You can now view it in your tracker</p>
                                </div>
                                {isLoading && (
                                    <div className="flex items-center justify-center mt-6">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    {currentStep !== 'select-type' && currentStep !== 'completion' && (
                        <div className="p-8 border-t border-border bg-gradient-to-r from-emerald-50/30 to-blue-50/30 dark:from-emerald-950/10 dark:to-blue-950/10">
                            <Button
                                onClick={handleSubmit}
                                disabled={!isFormValid() || isLoading}
                                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100 text-white border-0"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Saving your {selectedType ? DATA_TYPES.find(t => t.type === selectedType)?.name.toLowerCase() : 'data'}...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add {selectedType ? DATA_TYPES.find(t => t.type === selectedType)?.name : 'Item'}
                                    </>
                                )}
                            </Button>
                            <p className="text-center text-sm text-muted-foreground mt-3">
                                Make sure all required fields are filled correctly
                            </p>
                        </div>
                    )}
                </motion.div>
            </DialogContent>
        </Dialog>
    )
} 