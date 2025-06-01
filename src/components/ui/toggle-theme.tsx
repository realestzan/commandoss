"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme()

  // Add effect to sync theme with localStorage and handle initial load
  React.useEffect(() => {
    // Get stored theme or use system preference
    const storedTheme = localStorage.getItem('theme') || 'system'
    const effectiveTheme = storedTheme === 'system' ? systemTheme : storedTheme

    // Apply theme immediately
    if (effectiveTheme) {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(effectiveTheme)
      document.documentElement.setAttribute('data-theme', effectiveTheme)
      setTheme(storedTheme)
    }
  }, [setTheme, systemTheme])

  // Handle theme changes
  React.useEffect(() => {
    if (theme) {
      const effectiveTheme = theme === 'system' ? systemTheme : theme
      localStorage.setItem('theme', theme)
      document.documentElement.classList.remove('light', 'dark')
      if (effectiveTheme) {
        document.documentElement.classList.add(effectiveTheme)
        document.documentElement.setAttribute('data-theme', effectiveTheme)
      }
    }
  }, [theme, systemTheme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className="p-8 rounded-full" size='icon'>
          <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Sáng
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Tối
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          Hệ thống
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
