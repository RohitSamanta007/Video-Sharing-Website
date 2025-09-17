import { Loader } from 'lucide-react';
import React from 'react'

function AuthLoading() {
  return (
    <div className="flex min-h-[80vh] justify-center items-center">
      <div className='border-x-2 border-yellow-500 rounded-full size-32 animate-spin'>
      </div>
    </div>
  );
}

export default AuthLoading