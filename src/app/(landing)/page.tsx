'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/toggle-theme'
import {
    ArrowRight,
    BarChart3,
    Bot,
    DollarSign,
    Play,
    Target,
    TrendingUp
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
    return (
        <main className='min-h-screen bg-background'>
            {/* Header */}
            <header className='flex items-center justify-between p-6 max-w-7xl mx-auto'>
                <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center'>
                        <Bot className='w-5 h-5 text-white' />
                    </div>
                    <span className='text-xl font-bold'>FinanceAI</span>
                </div>

                <nav className='hidden md:flex items-center gap-8'>
                    <Link href='/how-it-works' className='text-foreground-muted hover:text-background transition-colors'>
                        How it works
                    </Link>
                    <Link href='/pricing' className='text-foreground-muted hover:text-background transition-colors'>
                        Pricing
                    </Link>
                    <Link href='/faq' className='text-foreground-muted hover:text-background transition-colors'>
                        FAQ
                    </Link>
                    <Link href='/resources' className='text-foreground-muted hover:text-background transition-colors'>
                        Resources
                    </Link>
                </nav>

                <div className='flex items-center gap-3'>
                    <Link href='/auth'>
                        <Button variant='ghost' className='text-foreground-muted hover:text-background'>
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
            <section className='max-w-7xl mx-auto px-6 py-20'>
                <div className='text-center max-w-4xl mx-auto mb-16'>
                    <h1 className='text-6xl md:text-7xl font-bold text-foreground leading-tight mb-6'>
                        Your finances as
                        <br />
                        <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600'>
                            a service
                        </span>
                    </h1>
                    <p className='text-xl text-foreground-muted mb-8 leading-relaxed'>
                        The intelligent finance assistant. Manage your budgets,
                        <br />
                        track expenses, and achieve goals with AI guidance
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-16'>
                    <Link href='/auth'>
                        <Button className='bg-foreground hover:bg-foreground/90 text-background px-8 py-6 text-lg rounded-full'>
                            Try it now
                        </Button>
                    </Link>
                    <Badge variant='outline' className='px-4 py-2 text-sm rounded-full border-gray-300'>
                        free for first month use
                    </Badge>
                </div>

                {/* Feature Showcase Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 mt-20'>
                    {/* Budget Planner Card */}
                    <Card className='bg-black text-white p-6 rounded-3xl lg:col-span-1'>
                        <CardContent className='p-0'>
                            <div className='mb-6'>
                                <div className='text-sm text-gray-400 mb-2'>Select budget</div>
                                <div className='text-2xl font-bold mb-4'>March 14, 2025</div>

                                <div className='space-y-3'>
                                    <div className='flex justify-between text-sm'>
                                        <span>Groceries</span>
                                        <span>$420</span>
                                    </div>
                                    <div className='flex justify-between text-sm'>
                                        <span>Transportation</span>
                                        <span>$180</span>
                                    </div>
                                    <div className='flex justify-between text-sm'>
                                        <span>Entertainment</span>
                                        <span>$250</span>
                                    </div>
                                </div>

                                <div className='mt-6 p-3 bg-gray-800 rounded-xl'>
                                    <div className='flex items-center gap-2'>
                                        <Target className='w-4 h-4' />
                                        <span className='text-sm'>Set new budget</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Chat Interface */}
                    <Card className='p-0 rounded-3xl overflow-hidden lg:col-span-1'>
                        <div className='relative h-80'>
                            <Image
                                src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                alt='AI Finance Assistant'
                                className='w-full h-full object-cover'
                                width={200}
                                height={200}
                            />
                            <div className='absolute bottom-4 left-4 right-4'>
                                <div className='bg-background/90 backdrop-blur-sm p-4 rounded-2xl'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <Bot className='w-5 h-5 text-emerald-500' />
                                        <span className='text-sm font-medium'>AI Assistant</span>
                                    </div>
                                    <p className='text-sm text-foreground-muted'>
                                        &lsquo;Your spending on dining out increased by 23% this month. Would you like me to suggest some budget adjustments?&rsquo;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Smart Insights */}
                    <Card className='bg-background p-6 rounded-3xl lg:col-span-1'>
                        <CardContent className='p-0'>
                            <div className='text-center'>
                                <h3 className='text-xl font-bold text-foreground-muted mb-3'>
                                    Always know
                                    <br />
                                    your spending
                                    <br />
                                    patterns
                                </h3>
                                <div className='w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto'>
                                    <BarChart3 className='w-8 h-8 text-white' />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Overview */}
                    <Card className='bg-gradient-to-br from-emerald-400 to-emerald-500 text-white p-6 rounded-3xl lg:col-span-1'>
                        <CardContent className='p-0'>
                            <div className='mb-4'>
                                <div className='text-sm opacity-80 mb-1'>Emma Johnson</div>
                                <div className='text-lg font-semibold mb-4'>Financial Goals</div>

                                <div className='space-y-3'>
                                    <div className='bg-white/20 p-3 rounded-xl'>
                                        <div className='text-sm font-medium'>Emergency Fund</div>
                                        <div className='text-xs opacity-80'>$8,500 → $10,000</div>
                                    </div>
                                    <div className='bg-white/20 p-3 rounded-xl'>
                                        <div className='text-sm font-medium'>Vacation Savings</div>
                                        <div className='text-xs opacity-80'>$2,100 → $5,000</div>
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-center justify-between'>
                                <Button
                                    variant='ghost'
                                    className='text-white hover:bg-white/10 p-2 rounded-full'
                                >
                                    <Play className='w-4 h-4' />
                                </Button>
                                <span className='text-sm opacity-80'>Track progress</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Second Row of Features */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6'>
                    {/* Live Dashboard */}
                    <Card className='bg-card text-foreground p-6 rounded-3xl lg:col-span-2 border'>
                        <CardContent className='p-0'>
                            <div className='flex items-center justify-between mb-6'>
                                <h3 className='text-2xl font-bold'>
                                    Instantly see
                                    <br />
                                    what&rsquo;s happening with
                                    <br />
                                    your money
                                </h3>
                                <div className='text-right'>
                                    <div className='text-3xl font-mono font-bold'>01:24:08</div>
                                    <div className='text-sm text-foreground/60'>Real-time updates</div>
                                </div>
                            </div>

                            <div className='grid grid-cols-3 gap-4'>
                                <div className='bg-foreground/10 p-4 rounded-2xl'>
                                    <DollarSign className='w-6 h-6 mb-2 text-emerald-400' />
                                    <div className='text-lg font-bold'>$12,450</div>
                                    <div className='text-xs text-foreground/60'>Total Balance</div>
                                </div>
                                <div className='bg-foreground/10 p-4 rounded-2xl'>
                                    <TrendingUp className='w-6 h-6 mb-2 text-green-400' />
                                    <div className='text-lg font-bold'>+$2,340</div>
                                    <div className='text-xs text-foreground/60'>This Month</div>
                                </div>
                                <div className='bg-foreground/10 p-4 rounded-2xl'>
                                    <Target className='w-6 h-6 mb-2 text-blue-400' />
                                    <div className='text-lg font-bold'>87%</div>
                                    <div className='text-xs text-foreground/60'>Goals Progress</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Video Demo */}
                    <Card className='relative overflow-hidden rounded-3xl lg:col-span-1'>
                        <div className='relative h-full'>
                            <Image
                                src='https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                alt='Finance Dashboard'
                                className='w-full h-full object-cover'
                                width={400}
                                height={300}
                            />
                            <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                                <Button
                                    className='bg-background hover:bg-background/90 text-foreground rounded-full px-6 py-3'
                                >
                                    <Play className='w-5 h-5 mr-2' />
                                    Watch how it works
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Bottom CTA */}
                <div className='text-center mt-20'>
                    <Link href='/auth'>
                        <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-4 text-lg rounded-full'>
                            Start Managing Your Finances
                            <ArrowRight className='w-5 h-5 ml-2' />
                        </Button>
                    </Link>
                    <p className='text-foreground/60 text-sm mt-4'>
                        Join thousands of users who&rsquo;ve taken control of their finances
                    </p>
                </div>
            </section>
        </main>
    )
}