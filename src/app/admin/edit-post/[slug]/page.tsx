import { getPostBySlug } from "@/actions/users-actions";
import { getAllCategories, getPostForEditBySlug } from "@/actions/admin-actions";
import PostForm from "@/components/post/upload-post-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { notFound } from "next/navigation";
import { toast } from "react-toastify";

async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [result, categories] = await Promise.all([
    getPostForEditBySlug(slug),
    getAllCategories(),
  ]);

  if(!result.success){
    toast.error("Post not found")
    notFound();
  }

  const post = result.data!;

  // console.log("The value of post in edit page : ", post);

  return (
    <main className="py-10">
      <div className="w-full max-w-4xl md:mx-auto p-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl lg:text-4xl text-bold text-center">
              Edit Post : {post.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <PostForm categories={categories} post={post} isEditing={true} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default EditPostPage;
