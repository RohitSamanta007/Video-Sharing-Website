"use client";
import { authClient, useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import ThemeToggle from "../theme/theme-toggle";
import { Button } from "../ui/button";
import UserMenu from "../auth/user-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Menu } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

function Header() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user;
  // console.log("The value of user in header is : ", user);
  const isAdminUser = user?.role === "admin";

  const pathName = usePathname();
  const navItems = [
    { label: "Home", link: "/" },
    { label: "Saved Videos", link: "/saved-videos" },
    { label: "About", link: "/about" },
    { label: "Contacts", link: "/contacts" },
  ];
  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className=" container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild className="cursor-pointer">
                <Button variant={"outline"}>
                  <Menu />
                </Button>
              </SheetTrigger>

              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="text-lg text-center">
                    Navigation Menu
                  </SheetTitle>
                  <SheetDescription className="text-center">
                    Select properly to navigate
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col justify-center gap-3 px-4">
                  {navItems.map((item, index) => (
                    <SheetClose asChild key={index}>
                      <Link
                        href={item.link}
                        className={`py-2 px-4 ${pathName === item.link && "bg-muted"} hover:bg-muted hover:scale-97 duration-400 transition-all rounded-md`}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                  {isAdminUser && (
                    <SheetClose asChild>
                      <Link
                        href={"/admin"}
                        className={`py-2 px-4 ${pathName === "/admin" && "bg-muted"} hover:bg-muted hover:scale-97 duration-400 transition-all rounded-md`}
                      >
                        Admin Page
                      </Link>
                    </SheetClose>
                  )}
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant={"outline"}>Close</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          <Link href={"/"}>
            <Image
              src={"/logo.svg"}
              alt="company-logo"
              width={120}
              height={50}
              className="bg-yellow-400 rounded-lg cursor-pointer shadow-md shadow-yellow-800 dark:shadow-yellow-100 hover:scale-97 duration-200 transition-all"
            />
          </Link>

          <nav className="hidden sm:flex items-center gap-4">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className={`text-sm lg:text-md font-medium transition-colors group `}
              >
                {item.label}
                <div
                  className={`w-full h-[2px] ${pathName === item.link && "bg-yellow-400"} rounded-md group-hover:bg-yellow-400 duration-300 transition-colors`}
                />
              </Link>
            ))}
            {isAdminUser && (
              <Button asChild variant={"outline"} className="bg-yellow-50 dark:bg-yellow-950 py-1 px-2">
                <Link
                  href={"/admin"}
                  className={`text-sm lg:text-md font-medium transition-colors group `}
                >
                  <span
                    className={`${pathName === "/admin" && "text-yellow-600  dark:text-yellow-400"}`}
                  >
                    Admin Page
                  </span>
                </Link>
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="flex items-center gap-2">
            {isPending ? (
              <div>
                <Skeleton className="h-8 w-8 rounded-full"/>
              </div>
            ) : session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <Button variant={"secondary"} asChild>
                <Link href={"/login"}>LogIn</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
