'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    Bell,
    Bot,
    Brain,
    CheckCircle,
    MessageSquare,
    Shield,
    Smartphone,
    Target,
    Users,
    Zap
} from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksPage() {
    const steps = [
        {
            number: '01',
            title: 'Sign Up & Connect',
            description: 'Create your account and optionally connect your financial accounts for automated tracking',
            icon: <Users className='w-8 h-8 text-emerald-500' />,
            details: [
                'Quick 2-minute signup process',
                'Bank-level security with 256-bit encryption',
                'Optional account linking for automation',
                'Manual entry always available'
            ]
        },
        {
            number: '02',
            title: 'Chat with AI',
            description: 'Start conversations with our intelligent assistant using natural language',
            icon: <MessageSquare className='w-8 h-8 text-blue-500' />,
            details: [
                'Ask questions in plain English',
                'Get instant financial advice',
                'Multiple AI models available',
                'Context-aware conversations'
            ]
        },
        {
            number: '03',
            title: 'AI Analysis',
            description: 'Our AI analyzes your financial data and provides personalized insights',
            icon: <Brain className='w-8 h-8 text-purple-500' />,
            details: [
                'Advanced pattern recognition',
                'Spending trend analysis',
                'Goal progress tracking',
                'Predictive financial modeling'
            ]
        },
        {
            number: '04',
            title: 'Take Action',
            description: 'Implement AI recommendations and track your progress toward financial goals',
            icon: <Target className='w-8 h-8 text-orange-500' />,
            details: [
                'Actionable recommendations',
                'Automated budget creation',
                'Goal setting and tracking',
                'Progress monitoring'
            ]
        }
    ]

    const features = [
        {
            icon: <MessageSquare className='w-6 h-6' />,
            title: 'Natural Language Processing',
            description: 'Chat with our AI as you would with a human financial advisor. No complex menus or forms.',
            color: 'from-blue-500 to-blue-600'
        },
        {
            icon: <BarChart3 className='w-6 h-6' />,
            title: 'Smart Analytics',
            description: 'Get deep insights into spending patterns, trends, and optimization opportunities.',
            color: 'from-emerald-500 to-emerald-600'
        },
        {
            icon: <Target className='w-6 h-6' />,
            title: 'Goal Tracking',
            description: 'Set financial goals and get AI-powered guidance to achieve them faster.',
            color: 'from-purple-500 to-purple-600'
        },
        {
            icon: <Bell className='w-6 h-6' />,
            title: 'Smart Reminders',
            description: 'Never miss a bill or financial milestone with intelligent notifications.',
            color: 'from-orange-500 to-orange-600'
        },
        {
            icon: <Shield className='w-6 h-6' />,
            title: 'Bank-Level Security',
            description: 'Your financial data is protected with enterprise-grade security measures.',
            color: 'from-green-500 to-green-600'
        },
        {
            icon: <Smartphone className='w-6 h-6' />,
            title: 'Cross-Platform Sync',
            description: 'Access your financial data seamlessly across all your devices.',
            color: 'from-pink-500 to-pink-600'
        }
    ]

    const aiCapabilities = [
        {
            title: 'Budget Creation',
            description: 'AI analyzes your income and expenses to create personalized budgets',
            example: '"Help me create a budget for this month"'
        },
        {
            title: 'Expense Analysis',
            description: 'Understand where your money goes with detailed spending breakdowns',
            example: '"Show me my spending patterns for dining out"'
        },
        {
            title: 'Goal Planning',
            description: 'Set and track financial goals with AI-powered recommendations',
            example: '"I want to save $10,000 for a vacation by next year"'
        },
        {
            title: 'Debt Management',
            description: 'Get strategies to pay off debt faster and more efficiently',
            example: '"Help me create a debt payoff plan"'
        },
        {
            title: 'Investment Guidance',
            description: 'Basic investment advice and portfolio optimization suggestions',
            example: '"Should I invest in index funds or individual stocks?"'
        },
        {
            title: 'Bill Reminders',
            description: 'Smart reminders for upcoming bills and financial deadlines',
            example: '"Remind me to pay my credit card bill on the 15th"'
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

            {/* Hero Section */}
            <section className='max-w-7xl mx-auto px-6 py-20'>
                <div className='text-center mb-20'>
                    <div className='w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6'>
                        <Zap className='w-8 h-8 text-white' />
                    </div>
                    <h1 className='text-5xl font-bold text-foreground mb-4'>
                        How FinanceAI Works
                    </h1>
                    <p className='text-xl text-foreground/70 max-w-3xl mx-auto'>
                        Discover how our AI-powered platform transforms your financial management
                        through intelligent conversations and data-driven insights
                    </p>
                </div>

                {/* How It Works Steps */}
                <div className='mb-20'>
                    <h2 className='text-3xl font-bold text-foreground text-center mb-12'>
                        Get Started in 4 Simple Steps
                    </h2>

                    <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
                        {steps.map((step) => (
                            <Card key={step.number} className='relative overflow-hidden'>
                                <CardHeader className='text-center pb-4'>
                                    <div className='w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                                        {step.icon}
                                    </div>
                                    <div className='absolute top-4 right-4'>
                                        <Badge variant='secondary' className='text-xs font-mono'>
                                            {step.number}
                                        </Badge>
                                    </div>
                                    <CardTitle className='text-xl font-bold text-foreground'>
                                        {step.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-foreground/70 mb-4 text-center'>
                                        {step.description}
                                    </p>
                                    <ul className='space-y-2'>
                                        {step.details.map((detail, detailIndex) => (
                                            <li key={detailIndex} className='flex items-center gap-2 text-sm text-foreground/60'>
                                                <CheckCircle className='w-4 h-4 text-emerald-500 flex-shrink-0' />
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* AI Capabilities */}
                <div className='mb-20'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold text-foreground mb-4'>
                            What Our AI Can Do For You
                        </h2>
                        <p className='text-xl text-foreground/70'>
                            Powered by advanced language models and financial expertise
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {aiCapabilities.map((capability, index) => (
                            <Card key={index} className='hover:shadow-lg transition-shadow duration-300'>
                                <CardContent className='p-6'>
                                    <h3 className='text-lg font-semibold text-foreground mb-3'>
                                        {capability.title}
                                    </h3>
                                    <p className='text-foreground/70 mb-4'>
                                        {capability.description}
                                    </p>
                                    <div className='bg-card/50 p-3 rounded-lg border-l-4 border-emerald-500'>
                                        <p className='text-sm text-foreground/80 italic'>
                                            {capability.example}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Key Features */}
                <div className='mb-20'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold text-foreground mb-4'>
                            Powerful Features
                        </h2>
                        <p className='text-xl text-foreground/70'>
                            Everything you need for comprehensive financial management
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {features.map((feature, index) => (
                            <Card key={index} className='group hover:shadow-xl transition-all duration-300'>
                                <CardContent className='p-6'>
                                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <div className='text-white'>
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h3 className='text-lg font-semibold text-foreground mb-3'>
                                        {feature.title}
                                    </h3>
                                    <p className='text-foreground/70'>
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* AI Models Section */}
                <div className='mb-20 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-3xl p-12'>
                    <div className='text-center mb-8'>
                        <h2 className='text-3xl font-bold text-foreground mb-4'>
                            Powered by Advanced AI
                        </h2>
                        <p className='text-xl text-foreground/70'>
                            We use the most sophisticated AI models available
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        <Card className='text-center'>
                            <CardContent className='p-6'>
                                <div className='w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4'>
                                    <span className='text-white font-bold'>GPT</span>
                                </div>
                                <h3 className='font-semibold text-foreground mb-2'>OpenAI GPT-4</h3>
                                <p className='text-sm text-foreground/70'>Advanced reasoning and financial analysis</p>
                            </CardContent>
                        </Card>

                        <Card className='text-center'>
                            <CardContent className='p-6'>
                                <div className='w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4'>
                                    <span className='text-white font-bold'>C</span>
                                </div>
                                <h3 className='font-semibold text-foreground mb-2'>Claude</h3>
                                <p className='text-sm text-foreground/70'>Nuanced understanding and advice</p>
                            </CardContent>
                        </Card>

                        <Card className='text-center'>
                            <CardContent className='p-6'>
                                <div className='w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4'>
                                    <span className='text-white font-bold'>G</span>
                                </div>
                                <h3 className='font-semibold text-foreground mb-2'>Gemini</h3>
                                <p className='text-sm text-foreground/70'>Multi-modal financial insights</p>
                            </CardContent>
                        </Card>

                        <Card className='text-center'>
                            <CardContent className='p-6'>
                                <div className='w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4'>
                                    <span className='text-white font-bold'>P</span>
                                </div>
                                <h3 className='font-semibold text-foreground mb-2'>Perplexity</h3>
                                <p className='text-sm text-foreground/70'>Real-time financial research</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* CTA Section */}
                <div className='text-center'>
                    <h2 className='text-3xl font-bold text-foreground mb-4'>
                        Ready to Transform Your Finances?
                    </h2>
                    <p className='text-xl text-foreground/70 mb-8'>
                        Start your journey to financial freedom with AI guidance
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Link href='/auth'>
                            <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-6 text-lg rounded-full'>
                                Start Free Trial
                                <ArrowRight className='w-5 h-5 ml-2' />
                            </Button>
                        </Link>
                        <Link href='/pricing'>
                            <Button variant='outline' className='px-8 py-6 text-lg rounded-full'>
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
} 