"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { revalidatePath } from "next/cache";

const inputSchema = z.object({
  input: z
    .string()
    .min(3, "Enter atleast three characters")
    .max(300, "Input must be less than 40 charactes"),
});

type InputValues = z.infer<typeof inputSchema>;

function SearchInput({query}:{query:string}) {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(query);

  const form = useForm<InputValues>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      input: query,
    },
  });

  const buildLink = (query: string, key: string) => {
    if (!searchParams) return `${pathName}?${key}=${query}`;
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(key, query);
    return `${pathName}?${newSearchParams.toString()}`;
  };

  const removeSearch = () => {
    setSearchInput("");
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("search_query");
    router.push(`${pathName}?${newSearchParams.toString()}`)
    router.refresh();
  };

  const onSubmit = (values: InputValues) => {
    setSearchInput(values.input);
    const key = "search_query";
    router.push(buildLink(values.input, key));
    form.reset();
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
          <FormField
            control={form.control}
            name="input"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Search something" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="bg-blue-400 hover:bg-blue-500 cursor-pointer"
          >
            Search
          </Button>
        </form>
      </Form>

      {searchInput.length > 0 && (
        <div className="mt-4 text-center flex items-center justify-center gap-3">
          <p>Search Result for : {searchInput}</p>
          <Button variant={"ghost"} className="p-0" onClick={()=> removeSearch()}>
            <X className="text-red-400 size-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default SearchInput;
