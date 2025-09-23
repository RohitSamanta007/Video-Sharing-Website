import React, { Suspense } from "react"
import Image from "next/image";
import HomePagePosts from "@/components/post/homePage-post";
import { Loader2 } from "lucide-react";



export default async function Home({searchParams}: SearchParamsProps) {

  return (
    <div className="min-h-[80vh] max-w-5xl w-full mx-auto">
      <div className="py-4 px-3">
        <h1 className="text-center text-xl md:text-2xl lg:text-3xl font-bold ">
          VideMe: Watch Premium Videos & Live Shows
        </h1>
        <p className="text-muted-foreground text-center text-sm md:text-md">
          Discover Exclusive Videos and Premium Collections from Top ott - 100%
          Free
        </p>
      </div>

      <Suspense
        fallback={
          <div className="min-h-[80vh] flex items-center justify-center gap-6">
            <Loader2 className="size-30 text-primary animate-spin"/>
            <h1>Loading...</h1>
          </div>
        }
      >
      <HomePagePosts searchParams={searchParams}/>
      </Suspense>
      
    </div>
  );
}
