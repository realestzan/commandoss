'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    ArrowUpRight,
    Bot,
    Github,
    Heart,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Twitter
} from 'lucide-react'
import Link from 'next/link'

export function Footer() {
    const currentYear = new Date().getFullYear()

    const footerSections = [
        {
            title: 'Product',
            links: [
                { name: 'Features', href: '/features' },
                { name: 'Pricing', href: '/pricing' },
                { name: 'How it Works', href: '/how-it-works' },
                { name: 'AI Assistant', href: '/chat' },
                { name: 'Mobile App', href: '/mobile' }
            ]
        },
        {
            title: 'Resources',
            links: [
                { name: 'Blog', href: '/blog' },
                { name: 'Help Center', href: '/help' },
                { name: 'FAQ', href: '/faq' },
                { name: 'API Docs', href: '/docs' },
                { name: 'Tutorials', href: '/tutorials' }
            ]
        },
        {
            title: 'Company',
            links: [
                { name: 'About Us', href: '/about' },
                { name: 'Careers', href: '/careers' },
                { name: 'Contact', href: '/contact' },
                { name: 'Press Kit', href: '/press' },
                { name: 'Partners', href: '/partners' }
            ]
        },
        {
            title: 'Legal',
            links: [
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Security', href: '/security' },
                { name: 'Cookie Policy', href: '/cookies' },
                { name: 'GDPR', href: '/gdpr' }
            ]
        }
    ]

    const socialLinks = [
        { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/realfin' },
        { name: 'GitHub', icon: Github, href: 'https://github.com/realfin' },
        { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/realfin' },
        { name: 'Email', icon: Mail, href: 'mailto:hello@realfin.app' }
    ]

    return (
        <footer className='bg-background border-t border-border'>
            {/* Newsletter Section */}
            <div className='bg-gradient-to-r from-emerald-500/10 to-emerald-600/10'>
                <div className='max-w-7xl mx-auto px-6 py-16'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
                        <div>
                            <h3 className='text-3xl font-bold text-foreground mb-4'>
                                Stay updated with Realfin
                            </h3>
                            <p className='text-lg text-foreground/70'>
                                Get the latest financial insights, product updates, and tips delivered to your inbox.
                            </p>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-4'>
                            <div className='flex-1'>
                                <input
                                    type='email'
                                    placeholder='Enter your email address'
                                    className='w-full px-6 py-4 rounded-full border border-border bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                                />
                            </div>
                            <Button className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-4 rounded-full font-semibold'>
                                Subscribe
                                <ArrowUpRight className='w-4 h-4 ml-2' />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className='max-w-7xl mx-auto px-6 py-16'>
                <div className='grid grid-cols-1 lg:grid-cols-6 gap-12'>
                    {/* Brand Section */}
                    <div className='lg:col-span-2'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center'>
                                <Bot className='w-6 h-6 text-white' />
                            </div>
                            <span className='text-2xl font-bold text-foreground'>Realfin</span>
                        </div>
                        <p className='text-foreground/70 mb-6 leading-relaxed'>
                            Your intelligent finance assistant. Manage budgets, track expenses, and achieve financial goals with AI-powered insights.
                        </p>

                        <div className='flex items-center gap-4 mb-6'>
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    className='w-10 h-10 bg-card hover:bg-emerald-500 border border-border hover:border-emerald-500 rounded-full flex items-center justify-center transition-all duration-200 group'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <social.icon className='w-4 h-4 text-foreground/70 group-hover:text-white transition-colors' />
                                </Link>
                            ))}
                        </div>

                        <div className='space-y-2 text-sm text-foreground/60'>
                            <div className='flex items-center gap-2'>
                                <MapPin className='w-4 h-4' />
                                <span>San Francisco, CA</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Phone className='w-4 h-4' />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Mail className='w-4 h-4' />
                                <span>hello@realfin.app</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Links */}
                    {footerSections.map((section) => (
                        <div key={section.title} className='lg:col-span-1'>
                            <h4 className='text-lg font-semibold text-foreground mb-6'>
                                {section.title}
                            </h4>
                            <ul className='space-y-3'>
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className='text-foreground/70 hover:text-emerald-600 transition-colors duration-200 flex items-center gap-1 group'
                                        >
                                            {link.name}
                                            <ArrowUpRight className='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Trust Indicators */}
                <div className='mt-16 pt-8 border-t border-border'>
                    <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
                        <div className='flex items-center gap-6'>
                            <Badge variant='outline' className='px-4 py-2 border-emerald-200 text-emerald-700'>
                                SOC 2 Compliant
                            </Badge>
                            <Badge variant='outline' className='px-4 py-2 border-emerald-200 text-emerald-700'>
                                Bank-Level Security
                            </Badge>
                            <Badge variant='outline' className='px-4 py-2 border-emerald-200 text-emerald-700'>
                                GDPR Ready
                            </Badge>
                        </div>
                        <div className='text-sm text-foreground/60'>
                            Trusted by 10,000+ users worldwide
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className='border-t border-border bg-card/50'>
                <div className='max-w-7xl mx-auto px-6 py-6'>
                    <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
                        <div className='text-sm text-foreground/60'>
                            © {currentYear} Realfin. All rights reserved.
                        </div>
                        <div className='flex items-center gap-1 text-sm text-foreground/60'>
                            Made with <Heart className='w-4 h-4 text-red-500 mx-1' /> for better financial futures
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
} 