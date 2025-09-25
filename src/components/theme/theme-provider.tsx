import {ThemeProvider as NextThemeProvider, ThemeProviderProps} from "next-themes"
import React from 'react'
import { cn } from "@/lib/utils"
import Header from "../layout/header";
import Footer from "../layout/footer";

interface ExtenderThemeProviderProps extends ThemeProviderProps {
    containerClassName?: string;
}

function ThemeProvider({children, containerClassName, ...props}: ExtenderThemeProviderProps) {
  return (
    <NextThemeProvider {...props}>
      <main className="flex flex-col min-h-screen">

        <Header/>
        <section className={cn("container mx-auto p-4 flex-1", containerClassName)}>
            {children}
        </section>
        <Footer/>
      </main>
    </NextThemeProvider>
  )
}

export default ThemeProvider