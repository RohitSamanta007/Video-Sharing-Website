"use client";
import { User } from "better-auth";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { checkBookmarked, toggleBookmarked } from "@/actions/users-actions";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

function SavedVideoButton({
  user,
  post,
  isBookmarked,
}: {
  user: { userId?: string };
  post: { postId: string; slug: string };
  isBookmarked: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const userSession = useSession();

  const handlebookmarked = async () => {
    if (!userSession.data?.user) {
      router.push(`/login?redirect=/post/${post.slug}`);
      return;
    }

    setLoading(true);
    try {
      await toggleBookmarked(post.postId, post.slug);
    } catch (error) {
      toast.error("Server Error! Please try again later");
      console.log("Error in toggle bookmarked : ", error);
    }
  };

  return (
    <div className="">
      <Button
        variant={"outline"}
        className="cursor-pointer"
        onClick={handlebookmarked}
      >
        {isBookmarked ? (
          <BookmarkCheck className="size-6 text-orange-500" />
        ) : (
          <Bookmark className="size-6 text-orange-400" />
        )}
      </Button>
    </div>
  );
}

export default SavedVideoButton;
