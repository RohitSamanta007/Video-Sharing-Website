import type { Metadata } from 'next'
import React from 'react'
import ForgotPasswordFrom from './forgot-password-form'

export const metadata:Metadata = {
    title: "Forgor Password"
}

function ForgotPassword() {
  return (
    <div className='flex min-h-[80vh] items-center justify-center'>
        <div className='w-full max-w-sm space-y-6 border border-primary rounded-lg p-6'>
            <div className='text-center border-b space-y-2'>
                <h1 className='text-2xl md:text-3xl font-semibold'>Forgot Password</h1>
                <p className='text-muted-foreground text-sm mb-2'>Enter your email address and we&apos;ll send you a link to reset your password</p>
            </div>

            <div>
                <ForgotPasswordFrom/>
            </div>
        </div>
    </div>
  )
}

export default ForgotPassword