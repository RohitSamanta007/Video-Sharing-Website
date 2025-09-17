"use client"
import { useThemeStore } from '@/store/theme-store'
import { useTheme } from 'next-themes';
import React, { useEffect } from 'react'
import { Button } from '../ui/button';
import {Moon, Sun} from "lucide-react"

function ThemeToggle() {
    const {isDarkMode, toggleTheme} = useThemeStore();
    const {theme, setTheme} = useTheme();

    useEffect(()=>{
        if(theme === "dark" && !isDarkMode){
            useThemeStore.setState({isDarkMode: true});
        }
        else if(theme === "light" && isDarkMode){
            useThemeStore.setState({isDarkMode: false})
        }
    }, [theme, isDarkMode])

    const handleToggleTheme = () =>{
        toggleTheme();
        setTheme(isDarkMode? "light": "dark")
    }
  return (
    <Button variant={"ghost"} size={"icon"} onClick={handleToggleTheme} className='cursor-pointer'>
        <Sun className='h-5 w-5 scale-100 dark:scale-0 transition-all duration-500' />
        <Moon className='absolute h-5 w-5 scale-0 dark:scale-100 rotate-45 dark:rotate-0 transition-all duration-500' />
    </Button>
  )
}

export default ThemeToggle