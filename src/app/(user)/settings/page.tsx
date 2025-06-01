'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { updateUserData } from '@/lib/auth'
import { Currency, FinancialGoal } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion, Variants } from 'framer-motion'
import {
    Calendar,
    Camera,
    CheckCircle2,
    DollarSign,
    Edit3,
    Globe,
    Plus,
    Save,
    Target,
    Trash2,
    User,
    X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

export default function SettingsPage() {
    const { user, loading, isAuthenticated, refreshUser } = useAuth()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        monthlyIncome: '',
        preferredCurrency: 'USD' as Currency
    })
    const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '' })
    const [showAddGoal, setShowAddGoal] = useState(false)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth')
        }
    }, [loading, isAuthenticated, router])

    useEffect(() => {
        if (user) {
            setEditData({
                name: user.name,
                email: user.email,
                monthlyIncome: user.monthlyIncome?.toString() || '',
                preferredCurrency: user.preferredCurrency as Currency
            })
        }
    }, [user])

    if (!user) {
        return null
    }

    const handleSave = async (field: string) => {
        setIsSaving(true)
        try {
            let dataToUpdate: Record<string, string | number | Currency | undefined> = {}

            switch (field) {
                case 'profile':
                    dataToUpdate = {
                        name: editData.name,
                        email: editData.email
                    }
                    break
                case 'financial':
                    dataToUpdate = {
                        monthlyIncome: editData.monthlyIncome ? parseFloat(editData.monthlyIncome) : undefined,
                        preferredCurrency: editData.preferredCurrency
                    }
                    break
            }

            // Filter out undefined values
            const cleanData = Object.fromEntries(
                Object.entries(dataToUpdate).filter(([, value]) => value !== undefined)
            )

            await updateUserData(user.id, cleanData)

            // Refresh user data to get updated values
            await refreshUser()

            setIsEditing(null)
        } catch (error) {
            console.error('Error updating user data:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddGoal = async () => {
        if (!newGoal.name.trim() || !newGoal.targetAmount) return

        try {
            const goal: FinancialGoal = {
                id: Date.now().toString(),
                userId: user.id,
                name: newGoal.name.trim(),
                targetAmount: parseFloat(newGoal.targetAmount),
                currentAmount: 0,
                deadline: newGoal.deadline || undefined,
                createdAt: new Date().toISOString()
            }

            const updatedGoals = [...(user.financialGoals || []), goal]
            await updateUserData(user.id, { financialGoals: updatedGoals })

            // Refresh user data to get updated goals
            await refreshUser()

            setNewGoal({ name: '', targetAmount: '', deadline: '' })
            setShowAddGoal(false)
        } catch (error) {
            console.error('Error adding goal:', error)
        }
    }

    const handleDeleteGoal = async (goalId: string) => {
        try {
            const updatedGoals = user.financialGoals?.filter(goal => goal.id !== goalId) || []
            await updateUserData(user.id, { financialGoals: updatedGoals })

            // Refresh user data to get updated goals
            await refreshUser()
        } catch (error) {
            console.error('Error deleting goal:', error)
        }
    }

    const selectedCurrency = CURRENCIES.find(c => c.value === editData.preferredCurrency)

    // Helper function to check if deadline is approaching (within 30 days)
    const isDeadlineApproaching = (deadline?: string) => {
        if (!deadline) return false
        const deadlineDate = new Date(deadline)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        return deadlineDate <= thirtyDaysFromNow && deadlineDate >= new Date()
    }

    // Helper function to check if deadline has passed
    const isDeadlinePassed = (deadline?: string) => {
        if (!deadline) return false
        return new Date(deadline) < new Date()
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 space-y-6 rounded-3xl"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Settings</h1>
                    <p className="text-xl text-muted-foreground">
                        Manage your account and financial preferences
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Section */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    {/* Profile Information */}
                    <Card className="bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-emerald-500" />
                                    <CardTitle>Profile Information</CardTitle>
                                </div>
                                {isEditing !== 'profile' ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing('profile')}
                                        className="text-emerald-600 hover:text-emerald-700"
                                    >
                                        <Edit3 className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsEditing(null)}
                                            disabled={isSaving}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSave('profile')}
                                            disabled={isSaving}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Save className="w-4 h-4 mr-1" />
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <CardDescription>
                                Your personal information and account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="w-20 h-20 ring-4 ring-emerald-200">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                                            {user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{user.name}</h3>
                                    <p className="text-muted-foreground">{user.email}</p>
                                    <Badge variant="outline" className="mt-1 border-emerald-200 text-emerald-600">
                                        Verified Account
                                    </Badge>
                                </div>
                            </div>

                            {/* Editable Fields */}
                            <div className="grid gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    {isEditing === 'profile' ? (
                                        <Input
                                            id="name"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <div className="mt-1 p-3 rounded-lg bg-muted/50">
                                            {user.name}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    {isEditing === 'profile' ? (
                                        <Input
                                            id="email"
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <div className="mt-1 p-3 rounded-lg bg-muted/50">
                                            {user.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Settings */}
                    <Card className="bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-5 h-5 text-emerald-500" />
                                    <CardTitle>Financial Settings</CardTitle>
                                </div>
                                {isEditing !== 'financial' ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing('financial')}
                                        className="text-emerald-600 hover:text-emerald-700"
                                    >
                                        <Edit3 className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsEditing(null)}
                                            disabled={isSaving}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSave('financial')}
                                            disabled={isSaving}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Save className="w-4 h-4 mr-1" />
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <CardDescription>
                                Your financial preferences and income information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="currency">Preferred Currency</Label>
                                {isEditing === 'financial' ? (
                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {CURRENCIES.map((currency) => (
                                            <Button
                                                key={currency.value}
                                                variant={editData.preferredCurrency === currency.value ? "default" : "outline"}
                                                className={cn(
                                                    "h-auto p-3 flex flex-col items-center gap-1",
                                                    editData.preferredCurrency === currency.value && "bg-emerald-600 hover:bg-emerald-700"
                                                )}
                                                onClick={() => setEditData({ ...editData, preferredCurrency: currency.value })}
                                            >
                                                <span className="text-lg">{currency.symbol}</span>
                                                <span className="text-xs">{currency.value}</span>
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-1 p-3 rounded-lg bg-muted/50 flex items-center gap-2">
                                        <span className="text-2xl">{selectedCurrency?.symbol}</span>
                                        <div>
                                            <div className="font-medium">{selectedCurrency?.label}</div>
                                            <div className="text-sm text-muted-foreground">{selectedCurrency?.value}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="income">Monthly Income</Label>
                                {isEditing === 'financial' ? (
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                            {selectedCurrency?.symbol}
                                        </span>
                                        <Input
                                            id="income"
                                            type="number"
                                            placeholder="5000"
                                            value={editData.monthlyIncome}
                                            onChange={(e) => setEditData({ ...editData, monthlyIncome: e.target.value })}
                                            className="pl-8"
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-1 p-3 rounded-lg bg-muted/50">
                                        {user.monthlyIncome !== undefined ?
                                            `${selectedCurrency?.symbol}${user.monthlyIncome.toLocaleString()}` :
                                            'Not set'
                                        }
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Financial Goals Sidebar */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <Card className="bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Target className="w-5 h-5 text-emerald-500" />
                                    <CardTitle>Financial Goals</CardTitle>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => setShowAddGoal(!showAddGoal)}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardDescription>
                                Track your financial objectives
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add Goal Form */}
                            {showAddGoal && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 border border-emerald-200 rounded-lg bg-card"
                                >
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Goal name (e.g., Emergency Fund)"
                                            value={newGoal.name}
                                            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                                        />
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                                {selectedCurrency?.symbol}
                                            </span>
                                            <Input
                                                type="number"
                                                placeholder="Target amount"
                                                value={newGoal.targetAmount}
                                                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                                                className="pl-8"
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                            </span>
                                            <Input
                                                type="date"
                                                placeholder="Target deadline (optional)"
                                                value={newGoal.deadline}
                                                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                                className="pl-10"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleAddGoal}
                                                disabled={!newGoal.name.trim() || !newGoal.targetAmount}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                Add Goal
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowAddGoal(false)
                                                    setNewGoal({ name: '', targetAmount: '', deadline: '' })
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Goals List */}
                            {user.financialGoals && user.financialGoals.length > 0 ? (
                                <div className="space-y-3">
                                    {user.financialGoals.map((goal) => (
                                        <motion.div
                                            key={goal.id}
                                            layout
                                            className={cn(
                                                "p-3 border rounded-lg",
                                                isDeadlinePassed(goal.deadline) ? "border-red-200 bg-red-50" :
                                                    isDeadlineApproaching(goal.deadline) ? "border-orange-200 bg-orange-50" :
                                                        "border-emerald-200 bg-card"
                                            )}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={cn(
                                                            "font-medium",
                                                            isDeadlinePassed(goal.deadline) ? "text-red-800" :
                                                                isDeadlineApproaching(goal.deadline) ? "text-orange-800" :
                                                                    "text-emerald-800"
                                                        )}>{goal.name}</h4>
                                                        {isDeadlinePassed(goal.deadline) && (
                                                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                                                        )}
                                                        {isDeadlineApproaching(goal.deadline) && !isDeadlinePassed(goal.deadline) && (
                                                            <Badge variant="secondary" className="text-xs bg-orange-200 text-orange-800">Due Soon</Badge>
                                                        )}
                                                    </div>
                                                    <p className={cn(
                                                        "text-sm",
                                                        isDeadlinePassed(goal.deadline) ? "text-red-600" :
                                                            isDeadlineApproaching(goal.deadline) ? "text-orange-600" :
                                                                "text-emerald-600"
                                                    )}>
                                                        {selectedCurrency?.symbol}{goal.targetAmount.toLocaleString()}
                                                    </p>
                                                    {goal.deadline && (
                                                        <p className={cn(
                                                            "text-xs flex items-center gap-1 mt-1",
                                                            isDeadlinePassed(goal.deadline) ? "text-red-500" :
                                                                isDeadlineApproaching(goal.deadline) ? "text-orange-500" :
                                                                    "text-emerald-500"
                                                        )}>
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(goal.deadline).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    <div className={cn(
                                                        "mt-2 w-full rounded-full h-2",
                                                        isDeadlinePassed(goal.deadline) ? "bg-red-200" :
                                                            isDeadlineApproaching(goal.deadline) ? "bg-orange-200" :
                                                                "bg-emerald-200"
                                                    )}>
                                                        <div
                                                            className={cn(
                                                                "h-2 rounded-full transition-all duration-300",
                                                                isDeadlinePassed(goal.deadline) ? "bg-red-600" :
                                                                    isDeadlineApproaching(goal.deadline) ? "bg-orange-600" :
                                                                        "bg-emerald-600"
                                                            )}
                                                            style={{
                                                                width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <p className={cn(
                                                        "text-xs mt-1",
                                                        isDeadlinePassed(goal.deadline) ? "text-red-600" :
                                                            isDeadlineApproaching(goal.deadline) ? "text-orange-600" :
                                                                "text-emerald-600"
                                                    )}>
                                                        {selectedCurrency?.symbol}{goal.currentAmount.toLocaleString()} saved
                                                        ({Math.round((goal.currentAmount / goal.targetAmount) * 100)}%)
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">No financial goals yet</p>
                                    <p className="text-xs">Add your first goal to get started!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 rounded-3xl">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <Globe className="w-8 h-8 mx-auto mb-3 opacity-90" />
                                <h3 className="font-semibold mb-2">Account Summary</h3>
                                <div className="space-y-2 text-sm opacity-90">
                                    <div className="flex justify-between">
                                        <span>Currency:</span>
                                        <span>{selectedCurrency?.value}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Goals:</span>
                                        <span>{user.financialGoals?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Member since:</span>
                                        <span>{new Date(user.createdAt).getFullYear()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    )
} 