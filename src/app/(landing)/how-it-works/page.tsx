'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/ui/footer'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
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
    Sparkles,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'

export default function HowItWorksPage() {
    const heroRef = useRef(null)
    const stepsRef = useRef(null)
    const aiRef = useRef(null)
    const featuresRef = useRef(null)

    const { scrollYProgress } = useScroll()
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

    const stepsInView = useInView(stepsRef, { once: true, margin: '-100px' })
    const aiInView = useInView(aiRef, { once: true, margin: '-100px' })
    const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' })

    const steps = [
        {
            number: '01',
            title: 'Sign Up & Connect',
            description: 'Create your account in seconds and safely connect your financial world',
            icon: <Users className='w-20 h-20' />,
            details: [
                'Lightning-fast 2-minute setup',
                'Military-grade encryption',
                'Smart account linking',
                'Manual entry flexibility'
            ],
            color: 'from-emerald-400 to-emerald-600',
            delay: 0
        },
        {
            number: '02',
            title: 'Chat Naturally',
            description: 'Talk to your AI financial advisor like you would a trusted friend',
            icon: <MessageSquare className='w-20 h-20' />,
            details: [
                'Conversational interface',
                'Instant expert advice',
                'Multiple AI personalities',
                'Context remembers everything'
            ],
            color: 'from-emerald-400 to-emerald-600',
            delay: 0.2
        },
        {
            number: '03',
            title: 'AI Analyzes',
            description: 'Watch as artificial intelligence transforms your data into actionable wisdom',
            icon: <Brain className='w-20 h-20' />,
            details: [
                'Pattern recognition magic',
                'Predictive modeling',
                'Trend analysis',
                'Future planning'
            ],
            color: 'from-emerald-400 to-emerald-600',
            delay: 0.4
        },
        {
            number: '04',
            title: 'Take Action',
            description: 'Transform insights into real financial progress with guided recommendations',
            icon: <Target className='w-20 h-20' />,
            details: [
                'Personalized action plans',
                'Automated optimizations',
                'Goal achievement tracking',
                'Continuous improvement'
            ],
            color: 'from-emerald-400 to-emerald-600',
            delay: 0.6
        }
    ]

    const aiCapabilities = [
        {
            title: 'Budget Genius',
            description: 'AI creates perfect budgets by analyzing your unique spending DNA',
            example: '"Create a budget that actually works for my lifestyle"',
            icon: <Target className='w-6 h-6' />,
            color: 'from-emerald-500 to-emerald-600'
        },
        {
            title: 'Expense Detective',
            description: 'Uncover hidden spending patterns and discover money leaks instantly',
            example: '"Where is all my money going each month?"',
            icon: <BarChart3 className='w-6 h-6' />,
            color: 'from-emerald-500 to-emerald-600'
        },
        {
            title: 'Goal Architect',
            description: 'Build and achieve ambitious financial dreams with AI-powered roadmaps',
            example: '"Help me save $50,000 for my dream house"',
            icon: <Sparkles className='w-6 h-6' />,
            color: 'from-emerald-500 to-emerald-600'
        },
        {
            title: 'Debt Destroyer',
            description: 'Eliminate debt faster with mathematical precision and psychological insight',
            example: '"Create the fastest debt payoff strategy"',
            icon: <TrendingUp className='w-6 h-6' />,
            color: 'from-emerald-500 to-emerald-600'
        },
        {
            title: 'Investment Oracle',
            description: 'Navigate investment decisions with data-driven wisdom and market insights',
            example: '"Should I invest in index funds or real estate?"',
            icon: <Brain className='w-6 h-6' />,
            color: 'from-emerald-500 to-emerald-600'
        },
        {
            title: 'Bill Guardian',
            description: 'Never miss a payment with intelligent reminders and automated scheduling',
            example: '"Set up smart reminders for all my bills"',
            icon: <Bell className='w-6 h-6' />,
            color: 'from-emerald-500 to-emerald-600'
        }
    ]

    const features = [
        {
            icon: <MessageSquare className='w-8 h-8' />,
            title: 'Conversational Intelligence',
            description: 'Chat naturally without learning complex interfaces or financial jargon',
            benefit: 'Save 10+ hours monthly on financial management',
            color: 'from-emerald-400 to-emerald-600'
        },
        {
            icon: <BarChart3 className='w-8 h-8' />,
            title: 'Predictive Analytics',
            description: 'See the future of your finances with AI-powered forecasting and insights',
            benefit: 'Make decisions 5x faster with data clarity',
            color: 'from-emerald-400 to-emerald-600'
        },
        {
            icon: <Shield className='w-8 h-8' />,
            title: 'Military-Grade Security',
            description: 'Your financial data protected by the same technology banks use',
            benefit: '99.9% uptime with zero security breaches',
            color: 'from-emerald-400 to-emerald-600'
        },
        {
            icon: <Smartphone className='w-8 h-8' />,
            title: 'Universal Access',
            description: 'Your financial command center works seamlessly across all devices',
            benefit: 'Access anywhere, anytime, any device',
            color: 'from-emerald-400 to-emerald-600'
        }
    ]

    return (
        <main className='min-h-screen bg-background overflow-hidden'>
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='flex items-center justify-between p-10 max-w-7xl mx-auto relative z-10'
            >
                <Link href='/' className='flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors group'>
                    <motion.div whileHover={{ x: -5 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <ArrowLeft className='w-5 h-5' />
                    </motion.div>
                    <span>Back to Home</span>
                </Link>

                <motion.div
                    className='flex items-center gap-2'
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                >
                    <div className='w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center'>
                        <Bot className='w-5 h-5 text-white' />
                    </div>
                    <span className='text-xl font-bold text-foreground'>Realfin</span>
                </motion.div>

                <div className='flex items-center gap-3'>
                    <Link href='/auth'>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant='ghost' className='text-foreground/70 hover:text-foreground'>
                                Log in
                            </Button>
                        </motion.div>
                    </Link>
                    <Link href='/auth'>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 rounded-full px-6'>
                                Sign up
                            </Button>
                        </motion.div>
                    </Link>
                </div>
            </motion.header>

            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                style={{ y: heroY, opacity: heroOpacity }}
                className='max-w-7xl mx-auto px-6 py-20 text-center relative'
            >
                {/* Floating Elements */}
                <motion.div
                    className='absolute top-20 left-20 w-20 h-20 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-full'
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
                <motion.div
                    className='absolute top-40 right-32 w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-full'
                    animate={{
                        y: [0, 20, 0],
                        x: [0, 10, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1
                    }}
                />

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 20,
                        delay: 0.2
                    }}
                    className='w-24 h-24 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 relative'
                >
                    <Zap className='w-12 h-12 text-white' />
                    <motion.div
                        className='absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full'
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ opacity: 0.3 }}
                    />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className='text-6xl md:text-7xl font-bold text-foreground mb-6'
                >
                    Your Financial Journey
                    <br />
                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600'>
                        Reimagined
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className='text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto mb-12 leading-relaxed'
                >
                    Discover how artificial intelligence transforms financial complexity
                    into simple conversations and actionable insights
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className='flex flex-col sm:flex-row gap-4 justify-center mb-16'
                >
                    <Link href='/auth'>
                        <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-6 text-lg rounded-full'>
                            Experience the Magic
                            <Sparkles className='w-5 h-5 ml-2' />
                        </Button>
                    </Link>
                    <Button variant='outline' className='px-8 py-6 text-lg rounded-full border-emerald-200 hover:bg-emerald-50'>
                        Watch Demo
                    </Button>
                </motion.div>
            </motion.section>

            {/* Journey Steps - Storytelling */}
            <section ref={stepsRef} className='max-w-7xl mx-auto px-6 py-32'>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className='text-center mb-20'
                >
                    <h2 className='text-5xl font-bold text-foreground mb-6'>
                        Your <span className='text-emerald-600'>Transformation</span> Story
                    </h2>
                    <p className='text-xl text-foreground/70 max-w-3xl mx-auto'>
                        Follow the journey from financial chaos to clarity in four magical steps
                    </p>
                </motion.div>

                <div className='relative'>
                    {/* Connection Line */}
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={stepsInView ? { scaleY: 1 } : {}}
                        transition={{ duration: 2, delay: 0.5 }}
                        className='absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 transform -translate-x-1/2 hidden lg:block origin-top'
                    />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                            animate={stepsInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.8, delay: step.delay }}
                            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                                }`}
                        >
                            {/* Content */}
                            <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    className='relative'
                                >
                                    <Badge
                                        variant='outline'
                                        className='mb-4 text-emerald-700 border-emerald-200 bg-emerald-50'
                                    >
                                        Step {step.number}
                                    </Badge>

                                    <h3 className='text-4xl font-bold text-foreground mb-4'>
                                        {step.title}
                                    </h3>

                                    <p className='text-xl text-foreground/70 mb-8 leading-relaxed'>
                                        {step.description}
                                    </p>

                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        {step.details.map((detail, detailIndex) => (
                                            <motion.div
                                                key={detailIndex}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                                                transition={{ delay: step.delay + 0.1 * detailIndex }}
                                                className='flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors'
                                            >
                                                <CheckCircle className='w-5 h-5 text-emerald-500 flex-shrink-0' />
                                                <span className='text-foreground/80'>{detail}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Visual */}
                            <div className={`${index % 2 === 1 ? 'lg:order-1' : ''} flex justify-center`}>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    className={`w-80 h-80 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl`}
                                >
                                    <motion.div

                                        className='text-white/90'
                                    >
                                        {step.icon}
                                    </motion.div>

                                    {/* Floating elements */}
                                    <motion.div
                                        className='absolute top-8 right-8 w-4 h-4 bg-white/30 rounded-full'
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                    />
                                    <motion.div
                                        className='absolute bottom-12 left-12 w-6 h-6 bg-white/20 rounded-full'
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* AI Capabilities Showcase */}
            <section ref={aiRef} className='bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 py-32'>
                <div className='max-w-7xl mx-auto px-6'>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={aiInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className='text-center mb-20'
                    >
                        <h2 className='text-5xl font-bold text-foreground mb-6'>
                            Meet Your AI <span className='text-emerald-600'>Financial Genius</span>
                        </h2>
                        <p className='text-xl text-foreground/70 max-w-3xl mx-auto'>
                            Six specialized AI assistants working together to revolutionize your financial life
                        </p>
                    </motion.div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {aiCapabilities.map((capability, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                animate={aiInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className='group'
                            >
                                <Card className='h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-background/80 backdrop-blur-sm'>
                                    <CardHeader className='pb-4'>
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ type: 'spring', stiffness: 400 }}
                                            className={`w-16 h-16 bg-gradient-to-r ${capability.color} rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}
                                        >
                                            <div className='text-white'>
                                                {capability.icon}
                                            </div>
                                        </motion.div>
                                        <CardTitle className='text-xl font-bold text-foreground group-hover:text-emerald-600 transition-colors'>
                                            {capability.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className='text-foreground/70 mb-6 leading-relaxed'>
                                            {capability.description}
                                        </p>
                                        <div className='bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border-l-4 border-emerald-500 group-hover:from-emerald-100 group-hover:to-emerald-200 transition-colors'>
                                            <p className='text-sm text-emerald-800 italic font-medium'>
                                                {capability.example}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features with Benefits */}
            <section ref={featuresRef} className='max-w-7xl mx-auto px-6 py-32'>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className='text-center mb-20'
                >
                    <h2 className='text-5xl font-bold text-foreground mb-6'>
                        Why <span className='text-emerald-600'>10,000+</span> Users Choose Realfin
                    </h2>
                    <p className='text-xl text-foreground/70 max-w-3xl mx-auto'>
                        Real benefits that transform how you think about money
                    </p>
                </motion.div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            animate={featuresInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            whileHover={{ scale: 1.02 }}
                            className='group'
                        >
                            <Card className='p-8 h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-card'>
                                <div className='flex items-start gap-6'>
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                        className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:shadow-xl transition-shadow`}
                                    >
                                        <div className='text-white'>
                                            {feature.icon}
                                        </div>
                                    </motion.div>

                                    <div className='flex-1'>
                                        <h3 className='text-2xl font-bold text-foreground mb-3 group-hover:text-emerald-600 transition-colors'>
                                            {feature.title}
                                        </h3>
                                        <p className='text-foreground/70 mb-4 leading-relaxed'>
                                            {feature.description}
                                        </p>
                                        <div className='inline-flex items-center gap-2 text-emerald-600 font-semibold'>
                                            <Sparkles className='w-4 h-4' />
                                            {feature.benefit}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* AI Models Section */}
            <section className='bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 py-32 relative overflow-hidden'>
                {/* Background animations */}
                <motion.div
                    className='absolute inset-0 opacity-20'
                    animate={{
                        background: [
                            'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 50%, #059669 0%, transparent 50%)',
                            'radial-gradient(circle at 40% 50%, #10b981 0%, transparent 50%)'
                        ]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />

                <div className='max-w-7xl mx-auto px-6 relative z-10'>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className='text-center mb-16'
                    >
                        <h2 className='text-5xl font-bold text-white mb-6'>
                            Powered by the World&rsquo;s Most
                            <br />
                            <span className='text-emerald-300'>Advanced AI</span>
                        </h2>
                        <p className='text-xl text-emerald-100 max-w-3xl mx-auto'>
                            We harness the collective intelligence of humanity&rsquo;s greatest AI achievements
                        </p>
                    </motion.div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                        {[
                            { name: 'GPT-4', company: 'OpenAI', color: 'from-emerald-400 to-emerald-600', description: 'Advanced reasoning' },
                            { name: 'Claude', company: 'Anthropic', color: 'from-emerald-400 to-emerald-600', description: 'Nuanced understanding' },
                            { name: 'Gemini', company: 'Google', color: 'from-emerald-400 to-emerald-600', description: 'Multi-modal insights' },
                            { name: 'Perplexity', company: 'Perplexity AI', color: 'from-emerald-400 to-emerald-600', description: 'Real-time research' }
                        ].map((model, index) => (
                            <motion.div
                                key={model.name}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -10 }}
                                viewport={{ once: true }}
                                className='group'
                            >
                                <Card className='text-center bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300'>
                                    <CardContent className='p-8'>
                                        <motion.div
                                            whileHover={{ scale: 1.2, rotate: 10 }}
                                            transition={{ type: 'spring', stiffness: 400 }}
                                            className={`w-16 h-16 bg-gradient-to-r ${model.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-2xl transition-shadow`}
                                        >
                                            <span className='text-white font-bold text-xl'>
                                                {model.name.charAt(0)}
                                            </span>
                                        </motion.div>
                                        <h3 className='font-bold text-white mb-2 text-xl'>{model.name}</h3>
                                        <p className='text-emerald-200 text-sm mb-3'>{model.company}</p>
                                        <p className='text-emerald-100 text-sm'>{model.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className='max-w-7xl mx-auto px-6 py-32 text-center'>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className='relative'
                >
                    <motion.div
                        className='absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-3xl'
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />

                    <div className='relative bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-3xl p-16'>
                        <h2 className='text-5xl font-bold text-foreground mb-6'>
                            Ready to Start Your
                            <br />
                            <span className='text-emerald-600'>Financial Revolution?</span>
                        </h2>
                        <p className='text-xl text-foreground/70 mb-12 max-w-3xl mx-auto leading-relaxed'>
                            Join thousands who&rsquo;ve transformed their financial future with AI guidance.
                            Your journey to financial freedom starts with a single conversation.
                        </p>

                        <div className='flex flex-col sm:flex-row gap-6 justify-center'>
                            <Link href='/auth'>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-12 py-6 text-xl rounded-full shadow-2xl'>
                                        Begin Your Journey
                                        <ArrowRight className='w-6 h-6 ml-3' />
                                    </Button>
                                </motion.div>
                            </Link>
                            <Link href='/pricing'>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant='outline' className='px-12 py-6 text-xl rounded-full border-emerald-200 hover:bg-emerald-50'>
                                        Explore Plans
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </main>
    )
} 