import React from "react";
import { getServerSession } from "../../actions/admin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserSavedVideos } from "../../actions/users-actions";
import { toast } from "react-toastify";
import { notFound } from "next/navigation";
import PostContainer from "@/components/post/postContainer";
import { post } from "@/lib/db/schema";

async function SavedVideoPage() {
  const session = await getServerSession();

  if (!session?.user) {
    return (
      <div className="min-h-[80vh] w-full max-w-md flex items-center justify-center mx-auto">
        <div className="p-4 w-full">
          <Card className="w-full">
            <CardHeader className="w-full">
              <CardTitle className="text-center text-lg md:text-xl font-semibold">
                You must be login to Access this page
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full cursor-pointer" asChild>
                <Link href={`/login?redirect=/saved-videos`}>
                  Click to Login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const result = await getUserSavedVideos();
  if (!result.success) {
    toast.error(result.message);
    return notFound();
  }

  const posts = result.result!;
  // console.log("The value of posts in saved vide page is : ", posts);

  return (
    <div>
      {posts?.length === 0 ? (
        <div className="min-h-[80vh] flex items-center justify-center">
          <div>
            <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-red-400">
              No Saved Post
            </p>
            <Button asChild className="mt-4 cursor-pointer" >
              <Link href={"/"}>Go to Home Page</Link>
            </Button>
          </div>
        </div>
      ) : (
        <PostContainer posts={posts} />
      )}
    </div>
  );
}

export default SavedVideoPage;
