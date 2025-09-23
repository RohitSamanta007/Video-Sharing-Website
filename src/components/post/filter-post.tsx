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
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function FilterPost({sortBy}:{sortBy:string}) {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const [filter, setFilter] = useState(sortBy);

  const buildLink = (query: string) => {
    const key = "sortBy";
    if (!searchParams) return `${pathName}?${key}=${query}`;

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(key, query);
    return `${pathName}?${newSearchParams.toString()}`;
  };

   const onSubmitHandle = (value: string) => {
    if(value === filter) return;
    setFilter(value);
    router.push(buildLink(value))
   };

  //   console.log("the value of categoris is : ", categories);
  return (
    <div className="flex flex-col gap-2">
      <p>Filter : {filter.length > 0 && filter} </p>
      <Select onValueChange={(value) => onSubmitHandle(value)} value={filter}>
        <SelectTrigger>
          <SelectValue placeholder="Select filters" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>Filters : </SelectLabel>
            <SelectItem value={"latest"}>Latest</SelectItem>
            <SelectItem value={"oldest"}>Oldest</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default FilterPost;
