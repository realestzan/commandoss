'use client'
import ManualEntry from "@/app/(user)/tracker/manual";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { logout } from "@/lib/auth";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import { AlignHorizontalJustifyStart, ChartNoAxesCombined, HelpCircle, LogOut, MessageCircle, Moon, Plus, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const containerVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
            staggerChildren: 0.1
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 100
        }
    }
}

export default function Sidebar({ user }: { user?: User }) {
    const pathname = usePathname()
    const router = useRouter()
    const { loading, isAuthenticated } = useAuth()
    const { theme, setTheme } = useTheme()
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth')
        }
    }, [loading, isAuthenticated, router])

    const handleLogout = async () => {
        await logout()
        router.push('/auth')
    }

    const sidebarItems = [
        {
            icon: MessageCircle,
            label: 'Chat',
            href: '/chat',
            active: pathname === '/chat'
        },
        {
            icon: ChartNoAxesCombined,
            label: 'Stats',
            href: '/stats',
            active: pathname === '/stats'
        },
        {
            icon: AlignHorizontalJustifyStart,
            label: 'Trackers',
            href: '/tracker',
            active: pathname === '/tracker'
        },
    ]

    return (
        <>
            {/* Sidebar */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className='w-64 bg-card p-4 py-6 my-4 ml-4 rounded-3xl flex flex-col justify-between '
            >
                <Link href='/'>
                    {/* Logo */}
                    <motion.div variants={itemVariants} className='flex items-center gap-2 mb-8'>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md'
                        >
                            <div className='w-4 h-4 bg-white rounded-full'></div>
                        </motion.div>
                        <span className='text-xl font-semibold text-gray-900 dark:text-gray-100'>Realfin</span>
                    </motion.div>
                </Link>

                {/* Menu */}
                <div className='space-y-1 mb-8'>
                    <motion.p variants={itemVariants} className='text-sm text-muted-foreground mb-3 font-medium'>MENU</motion.p>
                    {sidebarItems.map((item) => (
                        <motion.div
                            key={item.label}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link href={item.href}>
                                <Button
                                    variant={item.active ? 'default' : 'ghost'}
                                    className={cn(
                                        'w-full p-6 pl-4 justify-start gap-3 rounded-xl transition-all duration-300',
                                        item.active
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg'
                                            : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400'
                                    )}
                                >
                                    <motion.div
                                        whileHover={{ rotate: item.active ? 0 : 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <item.icon strokeWidth={1.5} className='w-5 h-5' />
                                    </motion.div>
                                    {item.label}
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* General Section */}
                <div className='space-y-1 mb-auto'>
                    <motion.p variants={itemVariants} className='text-sm text-muted-foreground mb-3 font-medium'>GENERAL</motion.p>
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link href='/settings'>
                            <Button variant='ghost' className='w-full p-6 pl-4 justify-start gap-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl transition-all duration-300'>
                                <motion.div
                                    whileHover={{ rotate: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Settings strokeWidth={1.5} className='w-5 h-5' />
                                </motion.div>
                                Settings
                            </Button>
                        </Link>
                    </motion.div>
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            variant='ghost'
                            className='w-full p-6 pl-4 justify-start gap-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl transition-all duration-300'
                        >
                            <motion.div
                                whileHover={{ rotate: theme === 'dark' ? 180 : -180 }}
                                transition={{ duration: 0.3 }}
                            >
                                {theme === 'dark' ? <Sun strokeWidth={1.5} className='w-5 h-5' /> : <Moon strokeWidth={1.5} className='w-5 h-5' />}
                            </motion.div>
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </Button>
                    </motion.div>
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link href='/faq'>
                            <Button variant='ghost' className='w-full p-6 pl-4 justify-start gap-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl transition-all duration-300'>
                                <motion.div
                                    whileHover={{ rotate: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <HelpCircle strokeWidth={1.5} className='w-5 h-5' />
                                </motion.div>
                                Help
                            </Button>
                        </Link>
                    </motion.div>
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant='ghost'
                            className='w-full p-6 pl-4 justify-start gap-3 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-300'
                            onClick={handleLogout}
                        >
                            <motion.div
                                whileHover={{ x: 2 }}
                                transition={{ duration: 0.2 }}
                            >
                                <LogOut strokeWidth={1.5} className='w-5 h-5' />
                            </motion.div>
                            Logout
                        </Button>
                    </motion.div>
                </div>

                {/* Stats Card */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Card className='mt-auto  bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden' onClick={() => setIsManualEntryOpen(true)}>
                        <CardContent>
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className='font-semibold mb-1'
                            >
                                Add a new entry
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className='text-sm text-emerald-100 mb-3'
                            >
                                Track your progress
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    className='w-full bg-white text-emerald-600 hover:bg-gray-50 border-0 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200'
                                    onClick={() => setIsManualEntryOpen(true)}
                                >
                                    <motion.div
                                        whileHover={{ rotate: 90 }}
                                        transition={{ duration: 0.2 }}
                                        className='mr-2'
                                    >
                                        <Plus className='w-4 h-4' />
                                    </motion.div>
                                    New Entry
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                <ManualEntry
                    user={user || {
                        id: '',
                        name: '',
                        email: '',
                        createdAt: new Date()
                    } as unknown as User}
                    isOpen={isManualEntryOpen}
                    onClose={() => setIsManualEntryOpen(false)}
                    onComplete={() => {
                        setIsManualEntryOpen(false)
                        // Optionally refresh the page or update data
                    }}
                />
            </motion.div>
        </>
    )
}