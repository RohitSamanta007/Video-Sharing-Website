"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import Link from "next/link";

function FilterPost({
  categories,
}: {
  categories: CategoryWithVideoCountProps[];
}) {
    const router = useRouter();
  const [category, setCategory] = useState("");

  //   console.log("the value of categoris is : ", categories);
    const handleChange = (value: string) => {
      setCategory(value);
      router.push(`/category/${value}`)
    };

  return (
    <div className="flex flex-col gap-2">
      <p>Category : {category.length > 0 && category} </p>
      {/* <Select onValueChange={handleChange} value={category}>
        <SelectTrigger>
          <SelectValue placeholder="Select a Category" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>Categories</SelectLabel>
            {categories.map((item, index) => (
              <SelectItem
                key={index}
                value={item.name}
                className="flex justify-between w-full"
              >
                <span>{item.name}</span>
                <span>{item.count}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select> */}

      <Sheet>
        <SheetTrigger asChild>
          <Button variant={"outline"} className="cursor-pointer">All Categories</Button>
        </SheetTrigger>

        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-center text-lg font-bold text-orange-400">Select a category</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>

        <div className="grid grid-cols-2 gap-2 py-4 px-4 items-center justify-center">
          {categories.map((item) => (
            <SheetClose asChild key={item.id} className="border px-4 py-0.5 rounded-md flex gap-1 justify-between overflow-y-auto">
              <Link href={`/category/${item.name}-${item.id}`}>
              <span>{item.name}</span>
              <span>{item.count}</span>
              </Link>
            </SheetClose>
          ))}
        </div>

        </SheetContent>
      </Sheet>
    </div>
  );
}

export default FilterPost;
