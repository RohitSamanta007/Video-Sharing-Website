"use server";

import { db } from "@/lib/db";
import { category, post, postCategory, savedVideoTable } from "@/lib/db/schema";
import { and, asc, ConsoleLogWriter, count, desc, eq, sql } from "drizzle-orm";
import { getServerSession } from "./admin-actions";
import { revalidatePath } from "next/cache";
import { postSchema } from "@/components/post/upload-post-form";
import { success } from "zod";

export async function getPostBySlug(slug: string) {
  try {
    const result = await db
      .select({
        title: post.title,
        description: post.description,
        thumbnailUrl: post.thumbnailUrl,
        screenshotsUrls: post.screenshotUrls,
        videoUrl: post.videoUrl,
        createdAt: post.createdAt,
        categoryName: category.name,
        categoryId: category.id,
        id: post.id,
      })
      .from(post)
      .where(eq(post.slug, slug))
      .leftJoin(postCategory, eq(postCategory.postId, post.id))
      .leftJoin(category, eq(category.id, postCategory.categoryId));

    // console.log("The value of result in getPotBySlug is : ", result);

    if (result.length === 0) {
      return {
        success: false,
        message: "Post Not Found",
      };
    }

    const categories = result
      .filter((r) => r.categoryId !== null)
      .map((r) => ({
        id: r.categoryId,
        name: r.categoryName,
      }));

    return {
      success: true,
      data: { ...result[0], categories },
    };
  } catch (error) {
    console.log("Error in get PostBySlug : ", error);
    return {
      success: false,
      message: "Server Error! Please try again later.",
    };
  }
}

export async function checkBookmarked(userId: string, postId: string) {
  if (!userId || !postId) {
    return false;
  }

  try {
    const result = await db
      .select()
      .from(savedVideoTable)
      .where(
        and(
          eq(savedVideoTable.userId, userId),
          eq(savedVideoTable.postId, postId)
        )
      );

    if (result.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Error in checkeBookmark : ", error);
    return false;
  }
}

export async function toggleBookmarked(postId: string, slug: string) {
  if (!postId || !slug) {
    return {
      success: false,
      message: "Invalid request",
    };
  }

  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("You must be login to Continue");
  }

  try {
    const result = await db
      .select()
      .from(savedVideoTable)
      .where(
        and(
          eq(savedVideoTable.userId, session.user.id),
          eq(savedVideoTable.postId, postId)
        )
      );

    if (result.length === 0) {
      // no savedPost for this post - insert one
      await db.insert(savedVideoTable).values({
        userId: session.user.id,
        postId: postId,
      });
    } else {
      // already have a savePost - delete this entry
      await db
        .delete(savedVideoTable)
        .where(
          and(
            eq(savedVideoTable.userId, session.user.id),
            eq(savedVideoTable.postId, postId)
          )
        );
    }

    revalidatePath(`/post/${slug}`);

    return {
      success: true,
    };
  } catch (error) {
    console.log("Error in toggleBookmark: ", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}

export async function getUserSavedVideos() {
  const session = await getServerSession();
  if (!session?.user) {
    return {
      success: false,
      message: "You must be login to access this page",
    };
  }

  try {
    const result = await db
      .select({
        postId: post.id,
        postSlug:post.slug,
        postTitle: post.title,
        postThumbnail: post.thumbnailUrl,
        createdAt: post.createdAt!,
      })
      .from(savedVideoTable)
      .where(eq(savedVideoTable.userId, session.user.id))
      .innerJoin(post, eq(post.id, savedVideoTable.postId))
      .orderBy(desc(savedVideoTable.createdAt))

      return {
        success: true,
        result,
      }
  } catch (error) {
    console.log("Error in gettingsavedVideo for user : ", error);
    return {
      success: false,
      message: "Server Error ! Please try again later",
    };
  }
}

export async function getPosts(currentPage:number, query:string, sortBy:string){
  
  try {
    
    const postPerPage = 3;
    const skip = postPerPage * (currentPage -1);
   

    let orderBy;
    
    switch(sortBy){
      case "oldest" : orderBy =  asc(post.createdAt); break;
      default: orderBy = desc(post.createdAt); 
    }


    const result = await db
      .select({
        postId: post.id,
        postSlug: post.slug,
        postTitle: post.title,
        postThumbnail: post.thumbnailUrl,
        createdAt: post.createdAt!,
        totalCount: sql<number>`count(*) OVER()`,
      })
      .from(post)
      .where(
        query.length > 0
          ? sql`to_tsvector('english', ${post.title}) @@ websearch_to_tsquery('english', ${query}) AND ${post.isPending} = false`
          : sql`${post.isPending} = false` // no filter if query empty
      )
      .orderBy(orderBy)
      .limit(postPerPage)
      .offset(skip);

      // console.log("The value of result in useraction is : ", result);

      const totalPost = result.length>0? Number(result[0].totalCount) : 1;
       const totalPageCount = Math.ceil(totalPost / postPerPage);

      return {
        success: true,
        result,
        totalPageCount,
      };
  } catch (error) {
    console.log("Error in getAllPosts : ", error);
    return {
      success: false,
      result: [],
      message: "Internal server error! Please try again later"
    };
  }
}


export async function getPostByCategoryId(categoryId: number, currentPage: number, sortBy: string){
  try {

    const postPerPage = 2;
    const skip = postPerPage * (currentPage - 1);

    let orderBy;

    switch (sortBy) {
      case "oldest":
        orderBy = asc(post.createdAt);
        break;
      default:
        orderBy = desc(post.createdAt);
    }

    const result = await db
      .select({
        postId: post.id,
        postSlug: post.slug,
        postTitle: post.title,
        postThumbnail: post.thumbnailUrl,
        createdAt: post.createdAt!,
        totalCount: sql<number>`count(*) OVER()`,
      })
      .from(postCategory)
      .innerJoin(post, eq(post.id, postCategory.postId))
      .where(eq(postCategory.categoryId, categoryId))
      .orderBy(orderBy)
      .limit(postPerPage)
      .offset(skip);

      const totalPost = result.length > 0 ? Number(result[0].totalCount) : 1;
      const totalPageCount = Math.ceil(totalPost / postPerPage);


      return {
        success: true,
        result,
        totalPageCount,
      }
    
  } catch (error) {
    console.log("Error in getPostByCategoryName : ", error);
    return {
      success: false,
      message: "Internal server error!",
      result: [],
    }
  }
}

