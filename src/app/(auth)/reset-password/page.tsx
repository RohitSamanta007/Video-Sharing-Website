import { Button } from '@/components/ui/button';
import { Metadata } from 'next'
import Link from 'next/link';
import React from 'react'
import ResetPasswordForm from './reset-password-form';

export const metadata:Metadata = {
    title: "Reset Password"
}

async function ResetPassword({searchParams} : {searchParams: Promise<{token: string}>}) {
    const {token} = await searchParams;

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      {token ? (
        <div className="w-full max-w-sm space-y-6 border border-primary rounded-lg p-6">
          <div className="text-center border-b space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Reset Password
            </h1>
            <p className="text-muted-foreground text-sm mb-2">
              Enter your new Pasword
            </p>
          </div>

          <div>
            <ResetPasswordForm token={token}/>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h1 className="text-red-500 text-xl md:text-2xl font-semibold">
            Token is Missing
          </h1>
          <Button asChild className="cursor-pointer hover:scale-95">
            <Link href={"/login"}>Go To Login Page</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default ResetPassword