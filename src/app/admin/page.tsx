import CategoryManager from "@/components/admin/category-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getAllCategories, getPostCount, getUserCount } from "../actions/admin-actions";

async function AdminPage() {
  const [categories, userCount, postCount] = await Promise.all([getAllCategories(), getUserCount(), getPostCount()])

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex flex-col justify-center items-center gap-6 mb-6">
        <h1 className="text-xl md:text-2xl font-medium text-center">
          Admin Dashboard
        </h1>
        <Button asChild className="self-center">
          <Link href={"/admin/upload-post"}>Create New Post</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-medium">
              <User className="mr-2 h-5 w-5 text-amber-500" />
              Total Users
            </CardTitle>
            <CardDescription>All Registered users on the platform</CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-2xl md:text-3xl font-bold text-orange-400">{userCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-medium">
              <User className="mr-2 h-5 w-5 text-amber-500" />
              Total Posts
            </CardTitle>
            <CardDescription>All Uploaded Posts on the platform</CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-2xl md:text-3xl font-bold text-orange-400">{postCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl text-center font-bold">Category Mangement</CardTitle>
        </CardHeader>

        <CardContent>
          <CategoryManager categories={categories}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminPage;
