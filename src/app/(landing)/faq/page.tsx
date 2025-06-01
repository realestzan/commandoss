'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Footer } from '@/components/ui/footer'
import { ThemeToggle } from '@/components/ui/toggle-theme'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    Bot,
    ChevronDown,
    CreditCard,
    HelpCircle,
    MessageCircle,
    Shield,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function FAQPage() {
    const [openItems, setOpenItems] = useState<number[]>([])

    const toggleItem = (index: number) => {
        setOpenItems(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    const faqCategories = [
        {
            title: 'Getting Started',
            icon: <Bot className='w-6 h-6 text-white' />,
            gradient: 'from-emerald-400 to-emerald-500',
            colSpan: 'lg:col-span-2',
            questions: [
                {
                    question: 'What is Realfin and how does it work?',
                    answer: 'Realfin is an intelligent personal finance assistant powered by advanced AI models. It helps you manage budgets, track expenses, set financial goals, and provides personalized financial insights through natural conversation. Simply chat with our AI to get instant help with your finances.'
                },
                {
                    question: 'How do I start using Realfin?',
                    answer: 'Getting started is easy! Sign up for a free account, connect your financial accounts (optional), and start chatting with our AI assistant. You can ask questions like "Help me create a budget" or "Show me my spending patterns" to begin.'
                },
                {
                    question: 'Do I need to connect my bank accounts?',
                    answer: 'No, connecting bank accounts is optional. You can manually input transactions or use our AI to help you track expenses. However, connecting accounts provides more accurate insights and automated transaction tracking.'
                },
                {
                    question: 'Is there a mobile app available?',
                    answer: 'Yes! Realfin is available on both iOS and Android. You can also access it through our web application. All your data syncs seamlessly across all devices.'
                }
            ]
        },
        {
            title: 'AI Chat Features',
            icon: <MessageCircle className='w-6 h-6 text-white' />,
            gradient: 'from-emerald-500 to-emerald-600',
            colSpan: 'lg:col-span-1',
            questions: [
                {
                    question: 'What can I ask the AI assistant?',
                    answer: 'You can ask about budgeting, expense tracking, financial goals, investment advice, debt management, spending analysis, bill reminders, and much more. The AI understands natural language, so ask questions as you would to a financial advisor.'
                },
                {
                    question: 'Which AI models power Realfin?',
                    answer: 'We use multiple advanced AI models including GPT-4, Claude, Gemini, and specialized financial reasoning models. Pro users get access to the latest models like GPT-4o, Claude 4, and Grok for more sophisticated financial analysis.'
                },
                {
                    question: 'Can the AI help me create a budget?',
                    answer: 'Absolutely! Our AI can analyze your income and expenses to suggest personalized budget categories, set spending limits, and provide ongoing advice to help you stick to your budget. Just say "Help me create a budget" to get started.'
                },
                {
                    question: 'How accurate is the financial advice?',
                    answer: 'Our AI is trained on financial best practices and provides evidence-based suggestions. However, for complex financial decisions, we recommend consulting with a certified financial advisor. The AI serves as your first line of financial guidance.'
                }
            ]
        },
        {
            title: 'Privacy & Security',
            icon: <Shield className='w-6 h-6 text-white' />,
            gradient: 'from-emerald-600 to-emerald-700',
            colSpan: 'lg:col-span-1',
            questions: [
                {
                    question: 'How secure is my financial data?',
                    answer: 'We use bank-level encryption (256-bit SSL) and follow industry best practices for data security. Your financial data is encrypted both in transit and at rest. We never store your banking credentials directly.'
                },
                {
                    question: 'Do you sell my data to third parties?',
                    answer: 'Never. We do not sell, rent, or share your personal financial data with third parties. Your privacy is our top priority, and we only use your data to provide you with personalized financial insights.'
                },
                {
                    question: 'Can I delete my data?',
                    answer: 'Yes, you have complete control over your data. You can delete individual transactions, categories, or your entire account at any time. We also provide data export options if you want to download your information.'
                },
                {
                    question: 'Where is my data stored?',
                    answer: 'Your data is stored on secure, encrypted servers in data centers that comply with SOC 2 Type II standards. We use multiple layers of security including firewalls, intrusion detection, and regular security audits.'
                }
            ]
        },
        {
            title: 'Features & Pricing',
            icon: <CreditCard className='w-6 h-6 text-white' />,
            gradient: 'from-emerald-300 to-emerald-400',
            colSpan: 'lg:col-span-2',
            questions: [
                {
                    question: 'What\'s included in the free plan?',
                    answer: 'The free plan includes basic budget tracking, expense logging, 50 AI chat messages per month, 5 financial notes, mobile app access, and basic analytics. It\'s perfect for getting started with AI-powered finance management.'
                },
                {
                    question: 'What are the benefits of upgrading to Pro?',
                    answer: 'Pro includes unlimited AI chat with advanced models, unlimited notes and transaction history, advanced analytics, custom budget categories, premium themes, cloud sync, and priority support. Perfect for serious financial management.'
                },
                {
                    question: 'Can I cancel my subscription anytime?',
                    answer: 'Yes, you can cancel your subscription at any time. There are no cancellation fees or long-term commitments. Your data remains accessible even after cancellation, and you can resubscribe anytime.'
                },
                {
                    question: 'Do you offer refunds?',
                    answer: 'We offer a 30-day money-back guarantee for new subscribers. If you\'re not satisfied with Realfin Pro, contact our support team within 30 days for a full refund.'
                }
            ]
        },
        {
            title: 'Analytics & Insights',
            icon: <BarChart3 className='w-6 h-6 text-white' />,
            gradient: 'from-emerald-500 to-emerald-600',
            colSpan: 'lg:col-span-1',
            questions: [
                {
                    question: 'What kind of insights does Realfin provide?',
                    answer: 'Realfin analyzes your spending patterns, identifies trends, suggests budget optimizations, tracks goal progress, predicts future expenses, and provides personalized recommendations to improve your financial health.'
                },
                {
                    question: 'Can I set and track financial goals?',
                    answer: 'Yes! Set goals for emergency funds, vacations, debt payoff, or any financial target. Our AI tracks your progress, suggests adjustments, and provides motivation to help you achieve your goals faster.'
                },
                {
                    question: 'How does expense categorization work?',
                    answer: 'Our AI automatically categorizes your transactions using machine learning. You can also create custom categories and train the AI to recognize your specific spending patterns for more accurate categorization.'
                },
                {
                    question: 'Can I generate financial reports?',
                    answer: 'Absolutely! Generate monthly, quarterly, or yearly reports showing income, expenses, savings rate, goal progress, and spending trends. Pro users get advanced reporting with custom date ranges and detailed analytics.'
                }
            ]
        }
    ]

    return (
        <main className='min-h-screen bg-background'>
            {/* Header */}
            <header className='flex items-center justify-between p-6 max-w-7xl mx-auto'>
                <Link href='/' className='flex items-center gap-3 text-foreground hover:text-emerald-600 transition-colors group'>
                    <motion.div
                        whileHover={{ x: -4 }}
                        className='flex items-center gap-2'
                    >
                        <ArrowLeft className='w-5 h-5 group-hover:text-emerald-600 transition-colors' />
                        <span className='font-medium'>Back to Home</span>
                    </motion.div>
                </Link>

                <div className='flex items-center gap-2'>
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md'
                    >
                        <div className='w-4 h-4 bg-white rounded-full'></div>
                    </motion.div>
                    <span className='text-xl font-bold'>Realfin</span>
                </div>

                <div className='flex items-center gap-3'>
                    <Link href='/auth'>
                        <Button variant='ghost' className=''>
                            Log in
                        </Button>
                    </Link>
                    <Link href='/auth'>
                        <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 rounded-full px-6'>
                            Sign up
                        </Button>
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            {/* Hero Section */}
            <section className='max-w-7xl mx-auto px-6 py-16'>
                <div className='text-center max-w-4xl mx-auto mb-20'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className='w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl'
                    >
                        <HelpCircle className='w-10 h-10 text-white' />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className='text-6xl font-bold text-foreground leading-tight mb-6'
                    >
                        Frequently Asked
                        <br />
                        <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600'>
                            Questions
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className='text-xl text-foreground/70 leading-relaxed'
                    >
                        Everything you need to know about your AI-powered
                        <br />
                        finance assistant
                    </motion.p>
                </div>

                {/* FAQ Categories Grid */}
                <div className='grid lg:grid-cols-3 gap-8'>
                    {faqCategories.map((category, categoryIndex) => (
                        <motion.div
                            key={category.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                            className={category.colSpan}
                        >
                            {/* Category Header Card */}
                            <Card className={`bg-gradient-to-r ${category.gradient} p-8 rounded-3xl mb-6 shadow-xl`}>
                                <div className='flex items-center gap-4'>
                                    <div className='w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm'>
                                        {category.icon}
                                    </div>
                                    <div>
                                        <h2 className='text-2xl font-bold text-white mb-1'>
                                            {category.title}
                                        </h2>
                                        <p className='text-white/80 text-sm'>
                                            {category.questions.length} questions answered
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Questions Grid */}
                            <div className='grid gap-3'>
                                {category.questions.map((faq, questionIndex) => {
                                    const itemIndex = categoryIndex * 100 + questionIndex
                                    const isOpen = openItems.includes(itemIndex)

                                    return (
                                        <motion.div
                                            key={questionIndex}
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                            <Card className='overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm'>
                                                <Collapsible
                                                    open={isOpen}
                                                    onOpenChange={() => toggleItem(itemIndex)}
                                                >
                                                    <CollapsibleTrigger className='w-full'>
                                                        <div className='flex items-center justify-between p-5 hover:bg-foreground/5 transition-colors'>
                                                            <h3 className='text-left font-semibold text-foreground text-base leading-relaxed'>
                                                                {faq.question}
                                                            </h3>
                                                            <motion.div
                                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className='ml-3 flex-shrink-0'
                                                            >
                                                                <div className='w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center'>
                                                                    <ChevronDown className='w-3.5 h-3.5 text-emerald-600' />
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <CardContent className='pt-0 pb-5 px-5'>
                                                                <div className='border-t border-foreground/10 pt-3'>
                                                                    <p className='text-foreground/70 leading-relaxed text-sm'>
                                                                        {faq.answer}
                                                                    </p>
                                                                </div>
                                                            </CardContent>
                                                        </motion.div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </Card>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Enhanced Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className='mt-24'
                >
                    <Card className='bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-emerald-600/10 rounded-3xl p-12 border-emerald-200/20 shadow-2xl backdrop-blur-sm'>
                        <div className='text-center'>
                            <div className='w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
                                <Sparkles className='w-8 h-8 text-white' />
                            </div>

                            <h2 className='text-4xl font-bold text-foreground mb-4'>
                                Still have questions?
                            </h2>
                            <p className='text-xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed'>
                                Our support team is here to help you get the most out of Realfin.
                                Start your journey to better financial management today.
                            </p>

                            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                                <Link href='/auth'>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-6 text-lg rounded-full shadow-lg'>
                                            Start Free Trial
                                            <ArrowRight className='w-5 h-5 ml-2' />
                                        </Button>
                                    </motion.div>
                                </Link>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant='outline' className='px-8 py-6 text-lg rounded-full border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300'>
                                        Contact Support
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </section>

            <Footer />
        </main>
    )
} 