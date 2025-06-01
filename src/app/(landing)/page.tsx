import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Menu, MessageCircle, Mic, Play, RotateCcw, Sparkles } from 'lucide-react'

export default function Home() {
    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 relative overflow-hidden'>
            {/* Header */}
            <header className='relative z-50 px-6 py-4'>
                <nav className='flex items-center justify-between max-w-7xl mx-auto'>
                    <div className='flex items-center space-x-2'>
                        <div className='w-8 h-8 bg-black rounded-full flex items-center justify-center'>
                            <span className='text-white text-sm font-bold'>A</span>
                        </div>
                        <span className='text-xl font-semibold text-gray-900'>Altic</span>
                    </div>

                    <div className='hidden md:flex items-center space-x-8'>
                        <a href='#' className='text-gray-700 hover:text-gray-900 font-medium'>Home</a>
                        <a href='#' className='text-gray-700 hover:text-gray-900 font-medium'>Why choose</a>
                        <a href='#' className='text-gray-700 hover:text-gray-900 font-medium'>Features</a>
                        <a href='#' className='text-gray-700 hover:text-gray-900 font-medium'>How it work</a>
                        <a href='#' className='text-gray-700 hover:text-gray-900 font-medium'>Reviews</a>
                    </div>

                    <div className='flex items-center space-x-4'>
                        <Button variant='outline' className='hidden md:block'>Join</Button>
                        <Button variant='ghost' size='icon' className='md:hidden'>
                            <Menu className='h-6 w-6' />
                        </Button>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className='relative z-10 px-6 py-16 max-w-4xl mx-auto text-center'>
                {/* Badge */}
                <div className='inline-flex items-center px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-purple-200 text-sm text-gray-700 mb-8'>
                    Your Smart AI Chat Companion
                </div>

                {/* Main Heading */}
                <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight'>
                    Discover The Power Of Seamless
                    <div className='flex items-center justify-center mt-4'>
                        <div className='flex -space-x-2 mr-4'>
                            <Avatar className='w-12 h-12 border-2 border-white'>
                                <AvatarImage src='/api/placeholder/48/48' alt='User 1' />
                                <AvatarFallback>U1</AvatarFallback>
                            </Avatar>
                            <Avatar className='w-12 h-12 border-2 border-white'>
                                <AvatarImage src='/api/placeholder/48/48' alt='User 2' />
                                <AvatarFallback>U2</AvatarFallback>
                            </Avatar>
                            <Avatar className='w-12 h-12 border-2 border-white'>
                                <AvatarImage src='/api/placeholder/48/48' alt='User 3' />
                                <AvatarFallback>U3</AvatarFallback>
                            </Avatar>
                            <div className='w-12 h-12 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center'>
                                <span className='text-xs font-semibold text-gray-600'>2+</span>
                            </div>
                        </div>
                        Your AI Chat Solutions
                    </div>
                </h1>

                {/* Subtitle */}
                <p className='text-lg text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed'>
                    Introducing Matric, the AI-powered chat app designed to transform your conversations. With advanced AI capabilities.
                </p>

                {/* CTA Buttons */}
                <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16'>
                    <Button className='bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg rounded-full min-w-[160px]'>
                        Get App
                        <ArrowRight className='ml-2 h-5 w-5' />
                    </Button>
                    <Button variant='outline' className='px-8 py-6 text-lg rounded-full min-w-[160px] bg-white/70 backdrop-blur-sm border-gray-300'>
                        Learn more
                        <ArrowRight className='ml-2 h-5 w-5' />
                    </Button>
                </div>
            </main>

            {/* Floating Cards - Left Side */}
            <div className='absolute left-8 top-1/2 -translate-y-1/2 hidden lg:block'>
                <Card className='w-80 bg-white/90 backdrop-blur-sm shadow-lg border-0 p-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <h3 className='text-lg font-semibold text-gray-900'>Chat History</h3>
                        <button className='text-sm text-gray-500 hover:text-gray-700'>See all</button>
                    </div>

                    <div className='space-y-4'>
                        <div className='text-sm text-gray-500 mb-2'>Today</div>

                        <div className='flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer'>
                            <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                                <MessageCircle className='h-4 w-4 text-purple-600' />
                            </div>
                            <span className='text-gray-700 flex-1'>How to make pancake</span>
                            <RotateCcw className='h-4 w-4 text-gray-400' />
                        </div>

                        <div className='flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer'>
                            <div className='w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center'>
                                <span className='text-white text-xs font-semibold'>O</span>
                            </div>
                            <span className='text-gray-700 flex-1'>Album Shawn Mendes</span>
                            <RotateCcw className='h-4 w-4 text-gray-400' />
                        </div>

                        <div className='text-sm text-gray-500 mb-2 pt-4'>Last Week</div>

                        <div className='flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer'>
                            <div className='w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center'>
                                <Sparkles className='h-4 w-4 text-yellow-600' />
                            </div>
                            <span className='text-gray-700 flex-1'>Pancake Picture</span>
                            <RotateCcw className='h-4 w-4 text-gray-400' />
                        </div>
                    </div>

                    <div className='mt-8 p-4 bg-yellow-50 rounded-xl'>
                        <div className='flex items-center space-x-3'>
                            <div className='w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center'>
                                <Mic className='h-5 w-5 text-yellow-700' />
                            </div>
                            <div className='flex-1'>
                                <h4 className='font-semibold text-gray-900'>Unlock The Future</h4>
                                <p className='text-sm text-gray-600'>Of Chatting Now!</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Floating Cards - Right Side */}
            <div className='absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block space-y-6'>
                {/* Voice Message Card */}
                <Card className='w-72 bg-white/90 backdrop-blur-sm shadow-lg border-0 p-4'>
                    <div className='flex items-center space-x-3'>
                        <Button size='icon' className='rounded-full bg-black text-white'>
                            <Play className='h-4 w-4' />
                        </Button>
                        <div className='flex-1'>
                            <div className='h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center px-3'>
                                <div className='w-full h-1 bg-white/30 rounded-full relative'>
                                    <div className='w-1/3 h-full bg-white rounded-full'></div>
                                </div>
                            </div>
                        </div>
                        <span className='text-sm text-gray-500'>00:45</span>
                    </div>
                </Card>

                {/* Chat Bubble */}
                <Card className='w-64 bg-purple-100 border-0 p-4'>
                    <p className='text-sm text-gray-700 mb-2'>Korean outfit for man</p>
                    <span className='text-xs text-gray-500'>2:30 pm ✓</span>
                </Card>

                {/* AI Response Card */}
                <Card className='w-80 bg-white/90 backdrop-blur-sm shadow-lg border-0 p-4'>
                    <div className='flex items-start space-x-3'>
                        <div className='w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center'>
                            <Sparkles className='h-4 w-4 text-yellow-700' />
                        </div>
                        <div className='flex-1'>
                            <div className='flex items-center space-x-2 mb-2'>
                                <span className='font-semibold text-gray-900'>AI Imagination</span>
                            </div>
                            <h4 className='font-bold text-lg text-gray-900 mb-1'>Teks To Illustrator</h4>
                            <p className='text-sm text-gray-600 mb-3'>Making pancakes is simple a...</p>
                            <Button className='bg-black text-white rounded-full px-6 py-2'>
                                Try now
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Success Message */}
                <Card className='w-56 bg-gray-800 text-white border-0 p-3'>
                    <div className='flex items-center justify-between'>
                        <span className='text-sm'>Thanks Matric!</span>
                        <span className='text-xs text-gray-400'>2:30 pm ✓</span>
                    </div>
                </Card>
            </div>

            {/* Hero Image/Illustration Placeholder */}
            <div className='absolute right-1/4 top-1/2 -translate-y-1/2 w-96 h-96 hidden xl:block'>
                <div className='w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-2xl relative overflow-hidden'>
                    <div className='absolute inset-0 bg-black/20'></div>
                    <div className='absolute bottom-4 left-4 right-4'>
                        <div className='text-white text-sm font-medium mb-2'>Futuristic AI Interface</div>
                        <div className='w-full h-2 bg-white/30 rounded-full'>
                            <div className='w-2/3 h-full bg-white rounded-full'></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}