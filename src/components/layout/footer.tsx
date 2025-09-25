import Link from 'next/link'
import React from 'react'

function Footer() {
  return (
    <div className='mx-5 my-10 border-t'>
        <div className='w-full flex flex-col sm:flex-row justify-between items-center gap-5'>
            <div className='flex flex-col flex-wrap gap-2 p-3'>
                <h1 className='text-lg md:text-xl font-bold text-center'>VidMe</h1>
                <p className='text-muted-foreground text-sm'>&copy; {new Date().getFullYear()}Vidme. All right reserved.</p>
            </div>
            <div className='flex flex-wrap gap-3 justify-center items-center'>
                <Link className='text-sm md:text-md text-muted-foreground hover:underline' href={"/content-removal"}>DMCA/ Content Removal</Link>
                <Link className='text-sm md:text-md text-muted-foreground hover:underline' href={"/contact"}>Contact Us</Link>
                <Link className='text-sm md:text-md text-muted-foreground hover:underline' href={"/privacy-policy"}>Privacy Policy</Link>
            </div>
        </div>
    </div>
  )
}

export default Footer