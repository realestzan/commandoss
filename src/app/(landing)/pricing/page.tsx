'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Footer } from '@/components/ui/footer'
import {
    ArrowLeft,
    BarChart3,
    Bot,
    Check,
    Crown,
    MessageCircle,
    Star,
    Target,
    Zap
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false)

    const plans = [
        {
            name: 'Realfin',
            subtitle: 'Free, forever.',
            price: 0,
            yearlyPrice: 0,
            icon: <Bot className='w-6 h-6' />,
            features: [
                'Core features, including:',
                'Basic Budget Tracking, Quick Expense Log,',
                'Simple Financial Calculator, Goal Tracker,',
                'Monthly Reports + many more...',
                '',
                'Realfin Chat',
                '50 Free Messages. Try any Pro model',
                '',
                'Personal Finance Notes',
                '5 Free Notes',
                '',
                'Mobile App Access',
                '',
                'Basic Analytics',
                '',
                'Email Support'
            ],
            buttonText: 'Get Started',
            buttonVariant: 'outline' as const,
            popular: false
        },
        {
            name: 'Realfin Pro',
            subtitle: 'AI at your fingertips',
            price: 8,
            yearlyPrice: 96,
            icon: <Zap className='w-6 h-6 text-blue-400' />,
            features: [
                '$96 billed annually',
                '',
                'Everything in Free',
                '',
                'Realfin Chat, including:',
                'GPT-4 Chat, GPT-4 mini',
                'Claude Sonnet, Claude Haiku, Claude Opus mini',
                'Gemini Pro, Gemini Flash',
                'Perplexity Financial Reasoning',
                'Custom Budget Assistant',
                '',
                'Smart Insights',
                'Sync Budget Plans, Goals, Reports with other',
                'devices and web',
                '',
                'Advanced Analytics',
                '',
                'Unlimited Finance Notes',
                '',
                'Unlimited Transaction History',
                '',
                'Custom Budget Categories',
                '',
                'Premium Themes'
            ],
            buttonText: 'Start Free Trial',
            buttonVariant: 'secondary' as const,
            popular: true
        },
        {
            name: 'Pro + Advanced AI',
            subtitle: 'The most intelligent models',
            price: 16,
            yearlyPrice: 192,
            icon: <Crown className='w-6 h-6 text-amber-400' />,
            features: [
                '$192 billed annually',
                '',
                'Everything in Pro',
                '',
                'Advanced AI Models, including:',
                'OpenAI GPT-4o, GPT-4, GPT-4',
                'Turbo, GPT-4o, o3, o1',
                'Anthropic Claude 3.5 Sonnet,',
                'Claude 3.7 Sonnet, Claude 3.7',
                'Sonnet (Reasoning), Claude 3 Opus,',
                'Claude 4 Sonnet, Claude 4 Opus,',
                'Claude 4 Sonnet (Reasoning),',
                'Claude 4 Opus (Reasoning)',
                'Perplexity Sonar Pro',
                'Mistral Large',
                'Google Gemini 2.5 Pro',
                'xAI Grok-3 Beta, Grok-2',
                'Compare all models',
            ],
            buttonText: 'Subscribe to Pro + Advanced AI',
            buttonVariant: 'default' as const,
            popular: false
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
                    <span className='text-xl font-bold text-foreground'>Realfin</span>
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

            {/* Pricing Section */}
            <section className='max-w-7xl mx-auto px-6 py-20'>
                {/* Title */}
                <div className='text-center mb-12'>
                    <h1 className='text-5xl font-bold text-foreground mb-4'>
                        Choose Your AI Finance Plan
                    </h1>
                    <p className='text-xl text-foreground/70'>
                        Unlock the power of AI-driven financial management
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className='flex items-center justify-center mb-12'>
                    <div className='bg-card border border-border rounded-full p-1'>
                        <div className='flex items-center'>
                            <button
                                onClick={() => setIsYearly(false)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isYearly
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-foreground/70 hover:text-foreground'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setIsYearly(true)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isYearly
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-foreground/70 hover:text-foreground'
                                    }`}
                            >
                                Yearly
                                <Badge variant='secondary' className='text-xs bg-emerald-500 text-white border-0'>
                                    -20%
                                </Badge>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${plan.popular
                                ? 'ring-2 ring-emerald-500 shadow-lg scale-105'
                                : 'hover:shadow-lg'
                                }`}
                        >
                            {plan.popular && (
                                <div className='absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center py-2 text-sm font-medium'>
                                    <Star className='w-4 h-4 inline mr-1' />
                                    Most Popular
                                </div>
                            )}

                            <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-8'}`}>
                                <div className='flex items-center justify-center mb-4'>
                                    {plan.icon}
                                </div>
                                <h3 className='text-2xl font-bold text-foreground'>{plan.name}</h3>
                                <p className='text-foreground/60'>{plan.subtitle}</p>

                                <div className='my-8'>
                                    <div className='text-6xl font-bold text-foreground'>
                                        ${isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.price}
                                    </div>
                                    <div className='text-foreground/60 text-sm'>/ month</div>
                                    {isYearly && plan.price > 0 && (
                                        <div className='text-xs text-foreground/50 mt-1'>
                                            ${plan.yearlyPrice} billed annually
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className='space-y-4 px-8 pb-8'>
                                <div className='space-y-3'>
                                    {plan.features.map((feature, featureIndex) => (
                                        <div
                                            key={featureIndex}
                                            className={`flex items-start gap-3 ${feature === '' ? 'h-2' : ''
                                                }`}
                                        >
                                            {feature !== '' && (
                                                <>
                                                    <Check className='w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0' />
                                                    <span className={`text-sm ${feature.includes('including:') || feature.includes('Everything in')
                                                        ? 'font-semibold text-foreground'
                                                        : 'text-foreground/70'
                                                        }`}>
                                                        {feature}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className='pt-6'>
                                    <Link href='/auth'>
                                        <Button
                                            variant={plan.buttonVariant}
                                            className={`w-full py-6 text-base font-medium ${plan.popular
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white border-0'
                                                : ''
                                                }`}
                                        >
                                            {plan.buttonText}
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Features Comparison */}
                <div className='mt-20 text-center'>
                    <h2 className='text-3xl font-bold text-foreground mb-8'>
                        Why Choose Realfin?
                    </h2>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
                        <div className='text-center'>
                            <div className='w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <MessageCircle className='w-8 h-8 text-white' />
                            </div>
                            <h3 className='text-xl font-semibold text-foreground mb-2'>
                                Intelligent Chat
                            </h3>
                            <p className='text-foreground/70'>
                                Get personalized financial advice from our AI assistant trained on financial best practices
                            </p>
                        </div>

                        <div className='text-center'>
                            <div className='w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <BarChart3 className='w-8 h-8 text-white' />
                            </div>
                            <h3 className='text-xl font-semibold text-foreground mb-2'>
                                Smart Analytics
                            </h3>
                            <p className='text-foreground/70'>
                                Advanced insights into your spending patterns, trends, and optimization opportunities
                            </p>
                        </div>

                        <div className='text-center'>
                            <div className='w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <Target className='w-8 h-8 text-white' />
                            </div>
                            <h3 className='text-xl font-semibold text-foreground mb-2'>
                                Goal Achievement
                            </h3>
                            <p className='text-foreground/70'>
                                Set and track financial goals with AI-powered recommendations and progress monitoring
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className='mt-20 text-center bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-3xl p-12'>
                    <h2 className='text-3xl font-bold text-foreground mb-4'>
                        Ready to Transform Your Finances?
                    </h2>
                    <p className='text-xl text-foreground/70 mb-8'>
                        Join thousands of users who&rsquo;ve already taken control of their financial future
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Link href='/auth'>
                            <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-6 text-lg rounded-full'>
                                Start Your Free Trial
                            </Button>
                        </Link>
                        <Link href='/'>
                            <Button variant='outline' className='px-8 py-6 text-lg rounded-full'>
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </main>
    )
} 