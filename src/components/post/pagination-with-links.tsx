"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { ReactNode, useCallback } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { cn } from "@/lib/utils";

function PaginationWithLink({
  page,
  totalPageCount,
}: PaginationWithLinksProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathName = usePathname();

  const buildLink = useCallback(
    (newPage: number) => {
      const key = "page";
      if (!searchParams) return `${pathName}?${key}=${newPage}`;

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set(key, String(newPage));

      return `${pathName}?${newSearchParams.toString()}`;
    },
    [searchParams, pathName]
  );

  const renderPageNumbers = () => {
    const items: ReactNode[] = [];
    const maxVisiblePages = 5;

    if (totalPageCount <= maxVisiblePages) {
      for (let i = 1; i <= totalPageCount; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink href={buildLink(i)} isActive={page === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink href={buildLink(1)} isActive={page === 1}>
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPageCount - 1, page + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink href={buildLink(i)} isActive={page === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < totalPageCount - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <Pagination key={totalPageCount}>
          <PaginationLink
            href={buildLink(totalPageCount)}
            isActive={page === totalPageCount}
          >
            {totalPageCount}
          </PaginationLink>
        </Pagination>
      );
    }

    return items;
  };

  return (
    <div className="w-full flex items-center justify-center ">
      <Pagination>
        <PaginationContent className="max-sm:gap-0">
          <PaginationItem>
            <PaginationPrevious
              href={buildLink(Math.max(page - 1, 1))}
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : undefined}
              className={cn(page == 1 && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem>
            <PaginationNext
              href={buildLink(Math.min(page + 1, totalPageCount))}
              aria-disabled={page === totalPageCount}
              tabIndex={page === totalPageCount? -1 : undefined}
              className={cn(page == totalPageCount && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default PaginationWithLink;
