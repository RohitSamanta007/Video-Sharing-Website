"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { category, post, postCategory, user } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import { and, count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getPostBySlug } from "./users-actions";
import { deleteAwsFiles, deleteAwsFolder } from "@/config/aws-config";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

export async function addNewCategory(name: string) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be admin to Continue");
  }
  name = name.trim();
  try {
    const existingCategory = await db
      .select()
      .from(category)
      .where(eq(category.name, name))
      .limit(1);
    if (existingCategory.length > 0) {
      return {
        success: false,
        message:
          "Category already exists! Please try with different category name",
      };
    }

    name = name.toLowerCase();
    await db.insert(category).values({ name });

    revalidatePath("/admin");
    return {
      success: true,
      message: "Category added successfully",
    };
  } catch (error) {
    console.log("Error in addNewCategory : ", error);
    return {
      success: false,
      message: "Something went wrong! Please try again later",
    };
  }
}

export async function getAllCategories() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be admin to Continue");
  }

  try {
    return await db.select().from(category).orderBy(category.name);
  } catch (error) {
    console.log("Error in getAllCategory : ", error);
    return [];
  }
}

export async function getCategoriesWithVideoCount() {
  try {
    const result = await db
      .select({
        count: count(postCategory.categoryId),
        name: category.name,
        id: category.id,
        createdAt: category.createdAt,
      })
      .from(postCategory)
      .groupBy(postCategory.categoryId, category.name, category.id)
      .rightJoin(category, eq(postCategory.categoryId, category.id))
      .orderBy(category.name);

    return result;
  } catch (error) {
    console.log("Error in getAllCategory : ", error);
    return [];
  }
}

export async function deleteCategoryById(categoryId: number) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be admin to Continue");
  }

  try {
    await db.delete(category).where(eq(category.id, categoryId));
    revalidatePath("/admin");
    return {
      success: true,
      message: "CategoryDeleted successfully",
    };
  } catch (error) {
    console.log("Error in deleteCategoryById : ", error);
    return {
      success: false,
      message: "Somethin went wrong! Please try again later",
    };
  }
}

export async function getUserCount() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be admin to Continue");
  }

  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(user);

    return result[0]?.count || 0;
  } catch (error) {
    console.log("Error in deleteCategoryById : ", error);
    return 0;
  }
}

export async function getPostCount() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be admin to Continue");
  }

  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(post);

    return result[0]?.count || 0;
  } catch (error) {
    console.log("Error in deleteCategoryById : ", error);
    return 0;
  }
}

export const addNewPost = async ({
  title,
  description,
  categoryIds,
  thumbnailKey,
  screenshotKeys,
  isPublic,
  videoUrl,
  videoKey,
}: PostFormPayloadProps) => {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be admin to Continue");
  }

  try {
    // console.log("Title : ", title);
    // console.log("Description : ", description);
    // console.log("categoryId : ", categoryIds);
    // console.log("ThumbnailKey : ", thumbnailKey);
    // console.log("Screenshots Key : ", screenshotKeys);
    // console.log("VideoUrl : ", videoUrl);
    // console.log("Ispublic : ", isPublic);

    const slug = slugify(title);

    const existingPost = await db
      .select()
      .from(post)
      .where(eq(post.slug, slug));
    if (existingPost.length > 0) {
      return {
        success: false,
        message: "Post already exists with the same Name",
      };
    }

    // const videoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${videoKey}`;
    const thumbnailUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${thumbnailKey}`;
    const screenshotUrls = screenshotKeys.map(
      (key) =>
        `https://${process.env.AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${key}`
    );

    const [result] = await db
      .insert(post)
      .values({
        title,
        slug,
        description,
        videoUrl,
        videoKey,
        thumbnailUrl,
        thumbnailKey,
        screenshotUrls,
        screenshotKeys,
        isPublic,
      })
      .returning();

    // console.log("The result of post insert : ", result);

    await Promise.all(
      categoryIds.map((id) =>
        db.insert(postCategory).values({
          postId: result.id,
          categoryId: Number(id),
        })
      )
    );

    revalidatePath("/");
    revalidatePath(`/post/${slug}`);
    revalidatePath(`/admin`);

    return {
      success: true,
      message: "Post added successfully",
      slug,
    };
  } catch (error) {
    console.log("Error in Add new Post : ", error);
    return {
      success: false,
      message: "Failed to create new Post",
    };
  }
};

export const updatePostAction = async (
  {
    title,
    description,
    categoryIds,
    thumbnailKey,
    screenshotKeys,
    isPublic,
    videoUrl,
    videoKey,
  }: PostFormPayloadProps,
  slug: string
) => {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be admin to Continue");
  }

  try {
    const slug = slugify(title);

    // const videoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${videoKey}`;
    const thumbnailUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${thumbnailKey}`;
    const screenshotUrls = screenshotKeys.map(
      (key) =>
        `https://${process.env.AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${key}`
    );

    const [result] = await db
      .update(post)
      .set({
        description,
        videoUrl,
        videoKey,
        thumbnailUrl,
        thumbnailKey,
        screenshotUrls,
        screenshotKeys,
        isPublic,
      })
      .where(eq(post.slug, slug))
      .returning();

    // console.log("The result of post update : ", result);

    const existingCategoryIdsResult = await db
      .select()
      .from(postCategory)
      .where(eq(postCategory.postId, result.id));

    const existingCategories = existingCategoryIdsResult.map(
      (cat) => cat.categoryId
    );

    const categoriesToAdd: number[] = categoryIds
      ? categoryIds
          .filter((item) => !existingCategories.includes(Number(item)))
          .map((item) => Number(item))
      : [];
    console.log("Categories to be added value is : ", categoriesToAdd);

    const categoriesToDeleted: number[] = existingCategories
      ? existingCategories.filter((item) => !categoryIds.includes(String(item)))
      : [];
    console.log("Categories to be deleted value is : ", categoriesToDeleted);

    await Promise.all(
      categoriesToAdd.map((id) =>
        db.insert(postCategory).values({
          postId: result.id,
          categoryId: Number(id),
        })
      )
    );

    await Promise.all(
      categoriesToDeleted.map((id) =>
        db
          .delete(postCategory)
          .where(
            and(
              eq(postCategory.categoryId, id),
              eq(postCategory.postId, result.id)
            )
          )
      )
    );

    revalidatePath("/");
    revalidatePath(`/post/${slug}`);
    revalidatePath(`/admin`);

    return {
      success: true,
      message: "Post added successfully",
      slug,
    };
  } catch (error) {
    console.log("Error in Add new Post : ", error);
    return {
      success: false,
      message: "Failed to create new Post",
    };
  }
};

export async function getPostForEditBySlug(slug: string) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be admin to Continue");
  }

  try {
    const result = await db
      .select({
        ...getTableColumns(post),
        categories: sql /*sql*/ `
      COALESCE(
        json_agg(
          json_build_object(
            'id', ${category.id},
            'name', ${category.name}
          )
        ) FILTER (WHERE ${category.id} IS NOT NULL),
        '[]'
      )
    `.as("categories"),
      })
      .from(post)
      .leftJoin(postCategory, eq(postCategory.postId, post.id))
      .leftJoin(category, eq(category.id, postCategory.categoryId))
      .where(eq(post.slug, slug))
      .groupBy(post.id);

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.log("Error in get PostBySlug : ", error);
    return {
      success: false,
      message: "Server Error! Please try again later.",
    };
  }
}

export async function deletePostBySlug(slug: string) {
  if (!slug) {
    return {
      success: false,
      message: "Invalid Request",
    };
  }

  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be admin to Continue");
  }

  try {
    const existingPostResult = await db
      .select()
      .from(post)
      .where(eq(post.slug, slug));
    if (existingPostResult.length === 0) {
      return {
        success: false,
        message: "No post found",
      };
    }
    const existingPost = existingPostResult[0];
    const keysToDelete = [
      existingPost.thumbnailKey,
      ...existingPost.screenshotKeys,
    ];

    await Promise.all(
      keysToDelete.map((key) => {
        console.log("The value of key going deleted : ", key);
        deleteAwsFiles(key);
      })
    );

    // delete aws video folder
    const folderName = existingPost.videoKey.split("/index.m3u8")[0];
    console.log(folderName);
    await deleteAwsFolder(folderName);

    await db.delete(post).where(eq(post.id, existingPost.id));

    revalidatePath("/");
    revalidatePath(`/admin`);

    return {
      success: true,
      message: "Delete post successfully",
    };
  } catch (error) {
    console.log("Error in Delete post by slug action : ", error);
    return {
      success: false,
      message: "Internal Server Error! Please try again later",
    };
  }
}
