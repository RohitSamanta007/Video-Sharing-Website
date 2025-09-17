"use client"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react'

function AdminError({error, reset} : {error: Error; reset: ()=> void}) {
    const router = useRouter();
  return (
    <div className='min-h-[80vh] flex justify-center items-center'>
        <div className='w-full max-w-md mx-4 md:mx-auto border p-6 rounded-lg shadow-md shadow-red-500'>
            <h1 className='text-lg font-bold text-red-500 text-center'>Error : {error.message}</h1>
            <p className='text-sm text-muted-foreground text-center mb-6'>Login with your admin account to continue</p>
            <Button asChild className='w-full bg-orange-50 dark:bg-orange-950 text-primary border border-orange-600 dark:border-orange-400 text-bold cursor-pointer hover:scale-98 duration-500 transition-all'>
                <Link href={"/login"}>LogIn</Link>
            </Button>
        </div>
    </div>
  )
}

export default AdminError