"use client";

import { User } from "better-auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { signOut } from "@/lib/auth-client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BookmarkIcon, LogOut, UserIcon } from "lucide-react";
import Link from "next/link";

function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    setIsLoading(false);

    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("You have been logout successfully");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.log("Error in Logout : ", error);
      toast.error("Logout error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} className="relative h-8 w-8 rounded-full cursor-pointer">
          {user.image ? (
            <Avatar>
              <AvatarImage src={user.image? user.image: undefined} alt="AV"/>
              <AvatarFallback className="bg-blue-300 dark:bg-blue-500">
                {getInitials(user?.name) || "User"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar>
              <AvatarFallback className="bg-blue-200 dark:bg-blue-500">
                {getInitials(user?.name) || "User"}
              </AvatarFallback>
            </Avatar>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={"/profile"}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/saved-videos"}>
            <BookmarkIcon className="mr-2 h-4 w-4" />
            <span>Saved Videos</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>LogOut</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
