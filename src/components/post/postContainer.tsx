import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from "date-fns";
import { Clock } from 'lucide-react';

function PostContainer({ posts }: PostContainerProps) {
  // console.log("The value of posts in post container is : ", posts);

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
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post, index) => (
          <Link key={index} href={`/post/${post.postSlug}`}>
            {/* <Card className="pb-0 overflow-hidden hover:scale-99 duration-300 transition-all">
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
            </Card> */}

            <Card className="rounded-2xl shadow-md hover:shadow-lg p-0 group hover:translate-y-[-5px] duration-500 transition-all">
              {/* Image section */}
              <div className="relative w-full aspect-[2/3] rounded-t-2xl overflow-hidden">
                <Image
                  src={post.postThumbnail}
                  alt={post.postTitle}
                  fill
                  className="object-cover group-hover:scale-102 duration-400 ease-in-out"
                />
              </div>

              <CardContent className="px-2">
                <h3 className="text-md md:text-lg font-bold line-clamp-2 text-center min-h-[3rem] group-hover:underline">
                  {post.postTitle}
                </h3>
              </CardContent>

              <CardFooter className="flex justify-between items-center px-4 py-2  text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {formatDistanceToNow(new Date(post.createdAt!), {
                    addSuffix: true,
                  })}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PostContainer