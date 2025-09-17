"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { category, post, user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

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

export async function getAllCategories(){
    const session = await getServerSession();
    if(!session?.user || session.user.role !== "admin"){
        throw new Error("You must be admin to Continue");
    }

    try {
        return await db.select().from(category).orderBy(category.name)
    } catch (error) {
        console.log("Error in getAllCategory : ", error);
        return []
    }
}

export async function deleteCategoryById(categoryId:number){
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
        }
    } catch (error) {
        console.log("Error in deleteCategoryById : ", error);
        return {
            success: false,
            message: "Somethin went wrong! Please try again later"
        }
    }
}

export async function getUserCount (){
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be admin to Continue");
  }

  try {
    const result = await db.select({count: sql<number>`count(*)`}).from(user)

    return result[0]?.count || 0;
  } catch (error) {
     console.log("Error in deleteCategoryById : ", error);
     return 0;
  }
}

export async function getPostCount (){
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be admin to Continue");
  }

  try {
    const result = await db.select({count: sql<number>`count(*)`}).from(post)

    return result[0]?.count || 0;
  } catch (error) {
     console.log("Error in deleteCategoryById : ", error);
     return 0;
  }
}
