import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { User } from "@/lib/types";
import { AlertTriangle, Bell, CheckCircle2, DollarSign, Search, Settings, Target } from "lucide-react";
import { useState } from "react";

export default function Header({ user }: { user?: User }) {

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    if (!user) {
        return null;
    }

    // Check for incomplete profile information
    const incompleteItems = [];

    if (user.monthlyIncome === undefined) {
        incompleteItems.push({
            title: 'Monthly Income',
            description: 'Set your monthly income for better budget recommendations',
            icon: DollarSign,
            action: 'Add Income'
        });
    }

    if (!user.financialGoals || user.financialGoals.length === 0) {
        incompleteItems.push({
            title: 'Financial Goals',
            description: 'Create goals to track your financial progress',
            icon: Target,
            action: 'Add Goals'
        });
    }

    const hasIncompleteProfile = incompleteItems.length > 0;
    const notificationCount = incompleteItems.length;

    return (
        <>
            {/* Header */}
            <header className='p-6 m-4 bg-card rounded-3xl'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 flex-1 max-w-md'>
                        <div className='relative flex-1'>
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                            <Input
                                placeholder='Search everything...'
                                className='py-6 pl-10 border-none shadow-none bg-background rounded-3xl focus:ring-2 focus:ring-emerald-500 transition-all duration-300'
                            />
                            <Badge variant='outline' className='absolute right-3 top-1/2 transform -translate-y-1/2 border-emerald-200 text-emerald-600'>
                                ⌘ K
                            </Badge>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                            <SheetTrigger asChild>
                                <Button variant='ghost' size='icon' className='hover:bg-card dark:hover:bg-emerald-950 relative'>
                                    <Bell className='w-4 h-4' />
                                    {notificationCount > 0 && (
                                        <Badge
                                            className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-500 hover:bg-amber-500 text-white text-xs'
                                        >
                                            {notificationCount}
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent className='w-[400px] sm:w-[400px]'>
                                <SheetHeader>
                                    <SheetTitle className='flex items-center gap-2'>
                                        <Bell className='w-5 h-5' />
                                        Notifications
                                    </SheetTitle>
                                </SheetHeader>

                                <div className='space-y-4 p-4'>
                                    {hasIncompleteProfile ? (
                                        <>
                                            <div className='mb-4'>
                                                <h3 className='font-semibold text-amber-700 mb-2 flex items-center gap-2'>
                                                    <AlertTriangle className='w-4 h-4' />
                                                    Complete Your Profile
                                                </h3>
                                                <p className='text-sm text-muted-foreground'>
                                                    Finish setting up your profile to get personalized financial insights.
                                                </p>
                                            </div>

                                            <div className='space-y-3'>
                                                {incompleteItems.map((item, index) => {
                                                    const IconComponent = item.icon;
                                                    return (
                                                        <Card key={index} className='border-emerald-200 bg-gradient-to-r from-emerald-400/40 to-emerald-600/40'>
                                                            <CardHeader className='pb-3'>
                                                                <div className='flex items-start gap-3'>
                                                                    <div className='w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center'>
                                                                        <IconComponent className='w-5 h-5 text-emerald-600' />
                                                                    </div>
                                                                    <div className='flex-1'>
                                                                        <CardTitle className='text-base'>
                                                                            {item.title}
                                                                        </CardTitle>
                                                                        <CardDescription className='text-muted-foreground'>
                                                                            {item.description}
                                                                        </CardDescription>
                                                                    </div>
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className='pt-0'>
                                                                <Button
                                                                    size='sm'
                                                                    className='w-full bg-emerald-600 hover:bg-emerald-700 text-white'
                                                                    onClick={() => {
                                                                        // TODO: Navigate to specific section
                                                                        console.log(`Navigate to ${item.title}`)
                                                                        setIsNotificationOpen(false)
                                                                    }}
                                                                >
                                                                    <Settings className='w-3 h-3 mr-2' />
                                                                    {item.action}
                                                                </Button>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <Card className='border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50'>
                                            <CardContent className='p-6 text-center'>
                                                <CheckCircle2 className='w-12 h-12 text-emerald-600 mx-auto mb-3' />
                                                <h3 className='font-semibold text-emerald-800 mb-2'>
                                                    All Caught Up!
                                                </h3>
                                                <p className='text-sm text-emerald-700'>
                                                    Your profile is complete and you&apos;re ready to track your finances.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Additional notification examples */}
                                    <div className='pt-4 border-t'>
                                        <h4 className='font-medium text-sm text-muted-foreground mb-3'>Recent Activity</h4>
                                        <div className='text-sm text-muted-foreground text-center py-8'>
                                            No recent activity to show
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <div className='flex items-center gap-3'>
                            <div>
                                <Avatar className='ring-2 ring-emerald-200 dark:ring-emerald-800'>
                                    <AvatarImage src={user?.avatar || ''} />
                                    <AvatarFallback className='bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'>
                                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div>
                                <p className='font-medium'>{user?.name || 'User'}</p>
                                <p className='text-sm text-muted-foreground'>{user?.email || user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}