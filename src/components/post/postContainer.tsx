import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from "date-fns";

function PostContainer({ posts }: PostContainerProps) {
  console.log("The value of posts in post container is : ", posts);

  if (posts.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-red">
          No Post found
        </h1>
      </div>
    );
  }
  return (
    <div className="w-full max-w-5xl mx-auto p-5">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post, index) => (
          <Link key={index} href={`/post/${post.postSlug}`}>
            <Card className="pb-0 overflow-hidden hover:scale-99 duration-300 transition-all">
              <CardHeader>
                <CardTitle className="font-medium">{post.postTitle}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt!), {
                    addSuffix: true,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative w-full aspect-square">
                <Image
                  src={post.postThumbnail}
                  layout="fill"
                  alt={post.postTitle}
                  objectFit="cover"
                />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PostContainer