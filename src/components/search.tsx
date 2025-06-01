'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/use-auth'
import {
    fetchBankAccounts,
    fetchBillReminders,
    fetchBudgets,
    fetchChatConversations,
    fetchFinancialGoals,
    fetchRecurringItems,
    fetchTransactions
} from '@/lib/services'
import {
    AlignHorizontalJustifyStart,
    ArrowLeft,
    Calendar,
    ChartNoAxesCombined,
    CreditCard,
    HelpCircle,
    LucideIcon,
    MessageCircle,
    Moon,
    RotateCcw,
    Search,
    Settings,
    Sun,
    Target,
    Wallet
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SearchProps {
    isOpen: boolean
    onClose: () => void
}

interface FinancialDataCategory {
    id: string
    label: string
    description: string
    icon: LucideIcon
    count?: number
    href: string
}

interface SearchResult {
    id: string
    title: string
    description: string
    amount?: number
    date?: string
    category?: string
    status?: string
    href: string
}

export default function SearchDialog({ isOpen, onClose }: SearchProps) {
    const [query, setQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [categoryResults, setCategoryResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const { theme, setTheme } = useTheme()
    const { user } = useAuth()
    const router = useRouter()

    const navigationItems = [
        {
            icon: MessageCircle,
            label: 'Chat',
            href: '/chat',
            description: 'AI-powered financial assistant'
        },
        {
            icon: ChartNoAxesCombined,
            label: 'Stats',
            href: '/stats',
            description: 'View your financial analytics'
        },
        {
            icon: AlignHorizontalJustifyStart,
            label: 'Trackers',
            href: '/tracker',
            description: 'Manage your expense tracking'
        },
        {
            icon: Settings,
            label: 'Settings',
            href: '/settings',
            description: 'Configure your preferences'
        },
        {
            icon: HelpCircle,
            label: 'Help',
            href: '/faq',
            description: 'Get support and documentation'
        }
    ]

    const financialDataCategories: FinancialDataCategory[] = [
        {
            id: 'transactions',
            label: 'Transactions',
            description: 'Search your income, expenses, and transfers',
            icon: CreditCard,
            href: '/tracker'
        },
        {
            id: 'budgets',
            label: 'Budgets',
            description: 'Find and manage your budgets',
            icon: Target,
            href: '/tracker'
        },
        {
            id: 'bills',
            label: 'Bills & Reminders',
            description: 'Search upcoming and overdue bills',
            icon: Calendar,
            href: '/tracker'
        },
        {
            id: 'accounts',
            label: 'Bank Accounts',
            description: 'View your connected accounts',
            icon: Wallet,
            href: '/tracker'
        },
        {
            id: 'goals',
            label: 'Financial Goals',
            description: 'Track your savings objectives',
            icon: Target,
            href: '/stats'
        },
        {
            id: 'recurring',
            label: 'Recurring Items',
            description: 'Manage recurring income and expenses',
            icon: RotateCcw,
            href: '/tracker'
        },
        {
            id: 'conversations',
            label: 'Chat History',
            description: 'Find previous AI conversations',
            icon: MessageCircle,
            href: '/chat'
        }
    ]

    const themeOption = {
        icon: theme === 'dark' ? Sun : Moon,
        label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        description: 'Toggle between light and dark themes',
        action: () => setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    const filteredItems = navigationItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
    )

    const filteredFinancialCategories = financialDataCategories.filter(category =>
        category.label.toLowerCase().includes(query.toLowerCase()) ||
        category.description.toLowerCase().includes(query.toLowerCase())
    )

    const showThemeOption = query === '' ||
        themeOption.label.toLowerCase().includes(query.toLowerCase()) ||
        'theme'.includes(query.toLowerCase()) ||
        'dark'.includes(query.toLowerCase()) ||
        'light'.includes(query.toLowerCase())

    // Search within a specific category
    const searchInCategory = async (categoryId: string, searchTerm: string) => {
        if (!user || !searchTerm.trim() || searchTerm.length < 2) {
            setCategoryResults([])
            return
        }

        setIsSearching(true)
        try {
            const results: SearchResult[] = []
            const term = searchTerm.toLowerCase()

            switch (categoryId) {
                case 'transactions':
                    const transactions = await fetchTransactions(user.id)
                    transactions.forEach(transaction => {
                        if (
                            transaction.description.toLowerCase().includes(term) ||
                            transaction.category?.toLowerCase().includes(term) ||
                            transaction.amount.toString().includes(term) ||
                            transaction.type.toLowerCase().includes(term)
                        ) {
                            results.push({
                                id: transaction.id,
                                title: transaction.description,
                                description: `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} • $${transaction.amount.toLocaleString()} • ${new Date(transaction.date).toLocaleDateString()}`,
                                amount: transaction.amount,
                                date: transaction.date,
                                category: transaction.category,
                                href: '/tracker'
                            })
                        }
                    })
                    break

                case 'budgets':
                    const budgets = await fetchBudgets(user.id)
                    budgets.forEach(budget => {
                        if (
                            budget.name.toLowerCase().includes(term) ||
                            budget.amount.toString().includes(term)
                        ) {
                            results.push({
                                id: budget.id,
                                title: budget.name,
                                description: `Budget • $${budget.amount.toLocaleString()} • ${new Date(budget.startDate).toLocaleDateString()} - ${new Date(budget.endDate).toLocaleDateString()}`,
                                amount: budget.amount,
                                date: budget.startDate,
                                href: '/tracker'
                            })
                        }
                    })
                    break

                case 'bills':
                    const bills = await fetchBillReminders(user.id)
                    bills.forEach(bill => {
                        if (
                            bill.name.toLowerCase().includes(term) ||
                            bill.amount.toString().includes(term) ||
                            bill.status.toLowerCase().includes(term)
                        ) {
                            results.push({
                                id: bill.id,
                                title: bill.name,
                                description: `Bill • $${bill.amount.toLocaleString()} • Due: ${new Date(bill.dueDate).toLocaleDateString()} • ${bill.status}`,
                                amount: bill.amount,
                                date: bill.dueDate,
                                status: bill.status,
                                href: '/tracker'
                            })
                        }
                    })
                    break

                case 'accounts':
                    const accounts = await fetchBankAccounts(user.id)
                    accounts.forEach(account => {
                        if (
                            account.name.toLowerCase().includes(term) ||
                            account.institution?.toLowerCase().includes(term) ||
                            account.accountType?.toLowerCase().includes(term) ||
                            account.balance.toString().includes(term)
                        ) {
                            results.push({
                                id: account.id,
                                title: account.name,
                                description: `${account.accountType?.charAt(0).toUpperCase() + (account.accountType?.slice(1) || '')} Account • $${account.balance.toLocaleString()} • ${account.institution || 'No institution'}`,
                                amount: account.balance,
                                href: '/tracker'
                            })
                        }
                    })
                    break

                case 'goals':
                    const goals = await fetchFinancialGoals(user.id)
                    goals.forEach(goal => {
                        if (
                            goal.name.toLowerCase().includes(term) ||
                            goal.targetAmount.toString().includes(term) ||
                            goal.currentAmount.toString().includes(term)
                        ) {
                            const progress = (goal.currentAmount / goal.targetAmount) * 100
                            results.push({
                                id: goal.id,
                                title: goal.name,
                                description: `Goal • $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()} (${progress.toFixed(1)}%) • ${goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}`,
                                amount: goal.targetAmount,
                                date: goal.deadline,
                                href: '/stats'
                            })
                        }
                    })
                    break

                case 'recurring':
                    const recurring = await fetchRecurringItems(user.id)
                    recurring.forEach(item => {
                        if (
                            item.name.toLowerCase().includes(term) ||
                            item.type.toLowerCase().includes(term) ||
                            item.frequency.toLowerCase().includes(term) ||
                            item.amount.toString().includes(term)
                        ) {
                            results.push({
                                id: item.id,
                                title: item.name,
                                description: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} • $${item.amount.toLocaleString()} • ${item.frequency} • Next: ${new Date(item.nextDueDate).toLocaleDateString()}`,
                                amount: item.amount,
                                date: item.nextDueDate,
                                href: '/tracker'
                            })
                        }
                    })
                    break

                case 'conversations':
                    const conversations = await fetchChatConversations(user.id)
                    conversations.forEach(conversation => {
                        if (
                            conversation.title.toLowerCase().includes(term) ||
                            conversation.messages.some(msg => msg.content.toLowerCase().includes(term))
                        ) {
                            const lastMessage = conversation.messages[conversation.messages.length - 1]
                            results.push({
                                id: conversation.id,
                                title: conversation.title,
                                description: `Chat • ${lastMessage?.content.substring(0, 60)}${lastMessage?.content.length > 60 ? '...' : ''} • ${new Date(conversation.updatedAt).toLocaleDateString()}`,
                                date: conversation.updatedAt,
                                href: `/chat/${conversation.id}`
                            })
                        }
                    })
                    break
            }

            // Sort results by relevance
            setCategoryResults(results
                .sort((a, b) => {
                    const aExact = a.title.toLowerCase() === term
                    const bExact = b.title.toLowerCase() === term
                    if (aExact && !bExact) return -1
                    if (!aExact && bExact) return 1

                    if (a.date && b.date) {
                        return new Date(b.date).getTime() - new Date(a.date).getTime()
                    }
                    return 0
                })
                .slice(0, 20)
            )

        } catch (error) {
            console.error('Error searching category:', error)
            setCategoryResults([])
        } finally {
            setIsSearching(false)
        }
    }

    // Debounced search within category
    useEffect(() => {
        if (selectedCategory && query.trim() && query.length >= 2) {
            const searchTimer = setTimeout(() => {
                searchInCategory(selectedCategory, query)
            }, 300)
            return () => clearTimeout(searchTimer)
        } else {
            setCategoryResults([])
        }
    }, [query, selectedCategory, user])

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId)
        setCategoryResults([])
        setQuery('')
    }

    const handleBackToCategories = () => {
        setSelectedCategory(null)
        setCategoryResults([])
        setQuery('')
    }

    const handleSelect = (href: string) => {
        router.push(href)
        handleClose()
    }

    const handleThemeToggle = () => {
        themeOption.action()
        handleClose()
    }

    const handleClose = () => {
        onClose()
        setQuery('')
        setSelectedCategory(null)
        setCategoryResults([])
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (selectedCategory) {
                    handleBackToCategories()
                } else {
                    handleClose()
                }
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, selectedCategory])

    const hasResults = filteredItems.length > 0 || showThemeOption || filteredFinancialCategories.length > 0 || categoryResults.length > 0

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-[600px] p-0 gap-0 overflow-hidden'>
                <DialogHeader className='px-6 py-4 border-b'>
                    <div className='relative'>
                        {selectedCategory && (
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleBackToCategories}
                                className='absolute left-0 top-1/2 transform -translate-y-1/2'
                            >
                                <ArrowLeft className='w-4 h-4' />
                            </Button>
                        )}
                        <Search className={`absolute ${selectedCategory ? 'left-12' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`} />
                        <Input
                            placeholder={
                                selectedCategory
                                    ? `Search in ${financialDataCategories.find(c => c.id === selectedCategory)?.label}...`
                                    : 'Search pages, financial data, or type a command...'
                            }
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className={`${selectedCategory ? 'pl-20' : 'pl-10'} border-none shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base`}
                            autoFocus
                        />
                        {isSearching && (
                            <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500'></div>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className='max-h-[400px]'>
                    {hasResults ? (
                        <div className='p-2'>
                            {selectedCategory ? (
                                /* Category Results */
                                categoryResults.length > 0 ? (
                                    <div className='mb-2'>
                                        <div className='px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                                            {financialDataCategories.find(c => c.id === selectedCategory)?.label} Results
                                        </div>
                                        {categoryResults.map((result) => (
                                            <Button
                                                key={result.id}
                                                variant='ghost'
                                                className='w-full h-auto p-3 justify-start gap-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                                onClick={() => handleSelect(result.href)}
                                            >
                                                <div className='w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
                                                    <Target className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                                                </div>
                                                <div className='flex-1 text-left'>
                                                    <div className='font-medium text-sm'>{result.title}</div>
                                                    <div className='text-xs text-muted-foreground'>{result.description}</div>
                                                </div>
                                                {result.amount && (
                                                    <Badge variant='outline' className='text-xs'>
                                                        ${result.amount.toLocaleString()}
                                                    </Badge>
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                ) : query.length >= 2 && !isSearching ? (
                                    <div className='p-8 text-center text-muted-foreground'>
                                        <Search className='w-12 h-12 mx-auto mb-3 opacity-50' />
                                        <p className='font-medium mb-1'>No results found</p>
                                        <p className='text-sm'>Try a different search term</p>
                                    </div>
                                ) : null
                            ) : (
                                /* Main Categories */
                                <>
                                    {/* Financial Data Categories */}
                                    {(query === '' || filteredFinancialCategories.length > 0) && (
                                        <div className='mb-2'>
                                            <div className='px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                                                Financial Data
                                            </div>
                                            {(query === '' ? financialDataCategories : filteredFinancialCategories).map((category) => {
                                                const IconComponent = category.icon
                                                return (
                                                    <Button
                                                        key={category.id}
                                                        variant='ghost'
                                                        className='w-full h-auto p-3 justify-start gap-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                                        onClick={() => handleCategorySelect(category.id)}
                                                    >
                                                        <div className='w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
                                                            <IconComponent className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                                                        </div>
                                                        <div className='flex-1 text-left'>
                                                            <div className='font-medium text-sm'>{category.label}</div>
                                                            <div className='text-xs text-muted-foreground'>{category.description}</div>
                                                        </div>
                                                        <Badge variant='outline' className='text-xs bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'>
                                                            Search
                                                        </Badge>
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* Navigation Items */}
                                    {filteredItems.length > 0 && (
                                        <div className='mb-2'>
                                            <div className='px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                                                Pages
                                            </div>
                                            {filteredItems.map((item) => {
                                                const IconComponent = item.icon
                                                return (
                                                    <Button
                                                        key={item.href}
                                                        variant='ghost'
                                                        className='w-full h-auto p-3 justify-start gap-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                                        onClick={() => handleSelect(item.href)}
                                                    >
                                                        <div className='w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
                                                            <IconComponent className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                                                        </div>
                                                        <div className='flex-1 text-left'>
                                                            <div className='font-medium text-sm'>{item.label}</div>
                                                            <div className='text-xs text-muted-foreground'>{item.description}</div>
                                                        </div>
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* Theme Option */}
                                    {showThemeOption && (
                                        <div>
                                            <div className='px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                                                Theme
                                            </div>
                                            <Button
                                                variant='ghost'
                                                className='w-full h-auto p-3 justify-start gap-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                                onClick={handleThemeToggle}
                                            >
                                                <div className='w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
                                                    <themeOption.icon className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                                                </div>
                                                <div className='flex-1 text-left'>
                                                    <div className='font-medium text-sm'>{themeOption.label}</div>
                                                    <div className='text-xs text-muted-foreground'>{themeOption.description}</div>
                                                </div>
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className='p-8 text-center text-muted-foreground'>
                            <Search className='w-12 h-12 mx-auto mb-3 opacity-50' />
                            <p className='font-medium mb-1'>
                                {query.length < 2 ? 'Start typing to search' : 'No results found'}
                            </p>
                            <p className='text-sm'>
                                {selectedCategory
                                    ? 'Try a different search term'
                                    : query.length < 2
                                        ? 'Search for pages, or browse financial data categories'
                                        : 'Try searching for pages, settings, or financial data'
                                }
                            </p>
                        </div>
                    )}
                </ScrollArea>

                <div className='px-6 py-3 border-t bg-muted/50 text-xs text-muted-foreground'>
                    <div className='flex items-center justify-between'>
                        <span>
                            Press <kbd className='px-2 py-1 bg-background rounded border font-mono'>Esc</kbd> to {selectedCategory ? 'go back' : 'close'}
                        </span>
                        {selectedCategory && categoryResults.length > 0 && (
                            <span>{categoryResults.length} result{categoryResults.length !== 1 ? 's' : ''} found</span>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 