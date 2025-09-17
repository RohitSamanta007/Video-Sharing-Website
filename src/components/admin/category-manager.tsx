"use client";
import { addNewCategory, deleteCategoryById } from "@/app/actions/admin-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Loader2, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const categorySchema = z.object({
  name: z
    .string()
    .min(3, "Category name must be atleast 3 characters long")
    .max(20, "Category name must be max 50 characters"),
});

type CategoryValue = z.infer<typeof categorySchema>;

function CategoryManager({
  categories
}: {
  categories: CategoryProps[];
}) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryValue>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const handleCategorySubmit = async ({ name }: CategoryValue) => {
    setIsLoading(true);

    try {
      const result = await addNewCategory(name);
      if (result.success) {
        toast.success(result.message);
      }
    } catch (error) {
      console.log("Error in Add new Category : ", error);
      toast.error("Something went wrong! Please try again later.");
    } finally {
      form.reset();
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async(categoryId: number) => {
    setIsLoading(true);

    try {
      const result = await deleteCategoryById(categoryId)

      if(result.success){
        toast.success(result.message)
      }
      else{
        toast.error(result.message)
      }
    } catch (error) {
       console.log("Error in delete Category : ", error);
       toast.error("Something went wrong! Please try again later.");
    }
    finally{
      setIsLoading(false);
    }
  }


  return (
    <div className="space-y-6 overflow-y-auto max-h-[600px]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCategorySubmit)}
          className="space-y-3"
        >
          <Label htmlFor="name">Your email address</Label>
          <div className="flex w-full gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      id={"name"}
                      placeholder="Enter new Category name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-20 cursor-pointer"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Add"}
            </Button>
          </div>
        </form>
      </Form>

      <div>
        <h3 className="text-lg md:text-xl font-semibold mb-4">Categories{categories.length > 0 && ` : ${categories.length}`}</h3>
        {categories.length === 0 ? (
          <p>No Category found. Add your first category above</p>
        ) : (
          <Table className="">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={"outline"}
                      className="cursor-pointer"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={isLoading}
                    >
                      <Trash className="size-5 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default CategoryManager;
