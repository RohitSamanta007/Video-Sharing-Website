import { checkBookmarked, getPostBySlug } from "@/actions/users-actions";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";
import VideoPlayer from "../../../components/post/videoPlayer";
import { getServerSession } from "@/actions/admin-actions";
import DeletePostButton from "@/components/post/delete-post-button";
import { Bookmark } from "lucide-react";
import SavedVideoButton from "@/components/post/saved-button";
import { Skeleton } from "@/components/ui/skeleton";

async function PostBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPostBySlug(slug);

  const session = await getServerSession();
  const user = session?.user;

  const isAdmin = session?.user.role === "admin";

  if (!result.success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="space-y-6">
          <p className="text-red-500 text-lg font-semibold md:text-xl">
            404! Post Not Found
          </p>
          <Button asChild className="cursor-pointer">
            <Link href={"/"}>Go to Home Page</Link>
          </Button>
        </div>
      </div>
    );
  }

  const post = result.data!;

  const isBookmarked = user?.id
    ? await checkBookmarked(user.id, post.id)
    : false;

  // console.log("The value of post is: ", post);
  return (
    <div className="min-h-[80vh] w-full max-w-6xl mx-auto p-1 md:p-6 py-5">
      <div className="bg-background w-full  flex flex-col items-center justify-center gap-4 md:border md:p-4 rounded-lg">
        <h1 className="text-xl md:text-2xl font-bold">{post?.title}</h1>

        <div className="relative w-full aspect-[2/3] max-w-3xl mx-auto">
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>

        <p className="text-muted-foreground  my-4 w-full border px-2 py-3 rounded-md">
          {post?.description} ?
        </p>

        <VideoPlayer
          videoUrl={post.videoUrl}
          thumbnailImageUrl={post.screenshotsUrls[0]}
        />

        <div className="w-full flex gap-4 justify-between items-center mt-3">
          <div className="flex gap-4">
            {post.categories.map((item, index) => (
              <Link
                key={index}
                href={"/"}
                className="px-4 py-0.5 bg-blue-400 hover:bg-blue-500 hover:scale-98 text-white rounded-md cursor-pointer duration-300 transition-all"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div>
            <SavedVideoButton
              user={{ userId: user?.id }}
              post={{ postId: post.id, slug }}
              isBookmarked={isBookmarked}
            />
          </div>
        </div>

        <h1 className="mt-10 text-lg font-semibold">Screenshots</h1>

        <div className="w-full space-y-4">
          {post?.screenshotsUrls.map((item, index) => (
            <div
              key={index}
              className="relative w-full aspect-video max-w-3xl mx-auto"
            >
              <Image
                src={item}
                alt={post?.title}
                fill={true}
                className="object-cover rounded-md"
              />
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="flex gap-5 py-4">
            <Button
              className="bg-green-400 hover:bg-green-500 cursor-pointer hover:scale-98 duration-400 transition-all"
              asChild
            >
              <Link href={`/admin/edit-post/${slug}`}>Edit Post</Link>
            </Button>
            <DeletePostButton slug={slug} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PostBySlug;
