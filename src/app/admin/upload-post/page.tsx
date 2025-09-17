import { getAllCategories } from '@/app/actions/admin-actions'
import PostForm from '@/components/post/upload-post-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

async function UploadPostPage() {
  const categories = await getAllCategories();
  return (
    <main className='py-10'>
      <div className='w-full max-w-4xl md:mx-auto p-5'>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl md:text-3xl lg:text-4xl text-bold text-center'>Create New Post</CardTitle>
          </CardHeader>

          <CardContent>
            <PostForm categories={categories}/>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default UploadPostPage