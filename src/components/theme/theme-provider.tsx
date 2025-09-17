import {ThemeProvider as NextThemeProvider, ThemeProviderProps} from "next-themes"
import React from 'react'
import { cn } from "@/lib/utils"
import Header from "../layout/header";

interface ExtenderThemeProviderProps extends ThemeProviderProps {
    containerClassName?: string;
}

function ThemeProvider({children, containerClassName, ...props}: ExtenderThemeProviderProps) {
  return (
    <NextThemeProvider {...props}>
        <Header/>
        <main className={cn("container mx-auto p-4", containerClassName)}>
            {children}
        </main>
    </NextThemeProvider>
  )
}

export default ThemeProvider