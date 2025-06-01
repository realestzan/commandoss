'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
    ArrowLeft,
    BarChart3,
    Bot,
    ChevronDown,
    CreditCard,
    HelpCircle,
    MessageCircle,
    Shield
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
            icon: <Bot className='w-5 h-5 text-emerald-500' />,
            questions: [
                {
                    question: 'What is FinanceAI and how does it work?',
                    answer: 'FinanceAI is an intelligent personal finance assistant powered by advanced AI models. It helps you manage budgets, track expenses, set financial goals, and provides personalized financial insights through natural conversation. Simply chat with our AI to get instant help with your finances.'
                },
                {
                    question: 'How do I start using FinanceAI?',
                    answer: 'Getting started is easy! Sign up for a free account, connect your financial accounts (optional), and start chatting with our AI assistant. You can ask questions like "Help me create a budget" or "Show me my spending patterns" to begin.'
                },
                {
                    question: 'Do I need to connect my bank accounts?',
                    answer: 'No, connecting bank accounts is optional. You can manually input transactions or use our AI to help you track expenses. However, connecting accounts provides more accurate insights and automated transaction tracking.'
                },
                {
                    question: 'Is there a mobile app available?',
                    answer: 'Yes! FinanceAI is available on both iOS and Android. You can also access it through our web application. All your data syncs seamlessly across all devices.'
                }
            ]
        },
        {
            title: 'AI Chat Features',
            icon: <MessageCircle className='w-5 h-5 text-blue-500' />,
            questions: [
                {
                    question: 'What can I ask the AI assistant?',
                    answer: 'You can ask about budgeting, expense tracking, financial goals, investment advice, debt management, spending analysis, bill reminders, and much more. The AI understands natural language, so ask questions as you would to a financial advisor.'
                },
                {
                    question: 'Which AI models power FinanceAI?',
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
            icon: <Shield className='w-5 h-5 text-green-500' />,
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
            icon: <CreditCard className='w-5 h-5 text-purple-500' />,
            questions: [
                {
                    question: 'What&rsquo;s included in the free plan?',
                    answer: 'The free plan includes basic budget tracking, expense logging, 50 AI chat messages per month, 5 financial notes, mobile app access, and basic analytics. It&rsquo;s perfect for getting started with AI-powered finance management.'
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
                    answer: 'We offer a 30-day money-back guarantee for new subscribers. If you&rsquo;re not satisfied with FinanceAI Pro, contact our support team within 30 days for a full refund.'
                }
            ]
        },
        {
            title: 'Analytics & Insights',
            icon: <BarChart3 className='w-5 h-5 text-orange-500' />,
            questions: [
                {
                    question: 'What kind of insights does FinanceAI provide?',
                    answer: 'FinanceAI analyzes your spending patterns, identifies trends, suggests budget optimizations, tracks goal progress, predicts future expenses, and provides personalized recommendations to improve your financial health.'
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
            <header className='flex items-center justify-between p-10 max-w-7xl mx-auto'>
                <Link href='/' className='flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors'>
                    <ArrowLeft className='w-5 h-5' />
                    <span>Back to Home</span>
                </Link>

                <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center'>
                        <Bot className='w-5 h-5 text-white' />
                    </div>
                    <span className='text-xl font-bold text-foreground'>FinanceAI</span>
                </div>

                <div className='flex items-center gap-3'>
                    <Link href='/auth'>
                        <Button variant='ghost' className='text-foreground/70 hover:text-foreground'>
                            Log in
                        </Button>
                    </Link>
                    <Link href='/auth'>
                        <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 rounded-full px-6'>
                            Sign up
                        </Button>
                    </Link>
                </div>
            </header>

            {/* FAQ Section */}
            <section className='max-w-4xl mx-auto px-6 py-20'>
                {/* Title */}
                <div className='text-center mb-16'>
                    <div className='w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6'>
                        <HelpCircle className='w-8 h-8 text-white' />
                    </div>
                    <h1 className='text-5xl font-bold text-foreground mb-4'>
                        Frequently Asked Questions
                    </h1>
                    <p className='text-xl text-foreground/70'>
                        Everything you need to know about FinanceAI
                    </p>
                </div>

                {/* FAQ Categories */}
                <div className='space-y-12'>
                    {faqCategories.map((category, categoryIndex) => (
                        <div key={category.title}>
                            {/* Category Header */}
                            <div className='flex items-center gap-3 mb-6'>
                                {category.icon}
                                <h2 className='text-2xl font-bold text-foreground'>
                                    {category.title}
                                </h2>
                            </div>

                            {/* Questions */}
                            <div className='space-y-4'>
                                {category.questions.map((faq, questionIndex) => {
                                    const itemIndex = categoryIndex * 100 + questionIndex
                                    const isOpen = openItems.includes(itemIndex)

                                    return (
                                        <Card key={questionIndex} className='overflow-hidden'>
                                            <Collapsible
                                                open={isOpen}
                                                onOpenChange={() => toggleItem(itemIndex)}
                                            >
                                                <CollapsibleTrigger className='w-full'>
                                                    <div className='flex items-center justify-between p-6 hover:bg-card/50 transition-colors'>
                                                        <h3 className='text-left font-semibold text-foreground'>
                                                            {faq.question}
                                                        </h3>
                                                        <ChevronDown
                                                            className={`w-5 h-5 text-foreground/60 transition-transform ${isOpen ? 'rotate-180' : ''
                                                                }`}
                                                        />
                                                    </div>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className='pt-0 pb-6 px-6'>
                                                        <p className='text-foreground/70 leading-relaxed'>
                                                            {faq.answer}
                                                        </p>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className='mt-20 text-center bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-3xl p-12'>
                    <h2 className='text-3xl font-bold text-foreground mb-4'>
                        Still have questions?
                    </h2>
                    <p className='text-xl text-foreground/70 mb-8'>
                        Our support team is here to help you get the most out of FinanceAI
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Link href='/auth'>
                            <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-6 text-lg rounded-full'>
                                Start Free Trial
                            </Button>
                        </Link>
                        <Button variant='outline' className='px-8 py-6 text-lg rounded-full'>
                            Contact Support
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    )
} 