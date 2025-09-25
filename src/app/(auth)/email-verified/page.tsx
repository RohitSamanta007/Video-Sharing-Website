import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
    title: "Email Verified",
}

function EmailVefied() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      <div className="space-y-6 min-w-sm mx-2 border p-6 border-secondary bg-muted rounded-lg">
        <div className=" text-center   space-y-3">
          <h1 className="text-xl md:text-2xl font-semibold">Email Verified</h1>
          <p className="text-muted-foreground">
            Your email has been verified successfully
          </p>
        </div>

        <div>
          <Button asChild className='w-full'>
            <Link href={"/login"}>Click To Login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default EmailVefied