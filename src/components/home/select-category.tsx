"use client";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useRouter } from "next/navigation";

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
      <Select onValueChange={handleChange} value={category}>
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
      </Select>
    </div>
  );
}

export default FilterPost;
