import { getPostByCategoryId } from '@/actions/users-actions';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'
import { toast } from 'react-toastify';
import CategoryClinetPage from './categoryClientPage';
import FilterPost from '@/components/post/filter-post';
import PostContainer from '@/components/post/postContainer';
import PaginationWithLink from '@/components/post/pagination-with-links';

async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryName: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { categoryName } = await params;
  const categoryId = categoryName?.split("-")[1];
  const category = decodeURIComponent(categoryName.split("-")[0]);
  // console.log("The value fo categoryId ; ", categoryId);

  const searchParamsResult = await searchParams;
  const currentPage = parseInt((searchParamsResult.page as string) || "1");
  const sortBy = (searchParamsResult.sortBy as string) || "latest";

  const result = await getPostByCategoryId(Number(categoryId), Number(currentPage), sortBy);

  if (!result.success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <h1 className="text-red-400 font-bold text-xl md:text-2xl lg:text-3xl">
          Internal serever Error! Please try again later
        </h1>
      </div>
    );
  }

  if (currentPage > result.totalPageCount!) {
    return notFound();
  }
  // console.log("The vlaue of result in post by category : ", result);
  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div>
        <h1 className="text-center text-xl font-semibold">
          Category : {category}
        </h1>
      </div>

      <div>
        <FilterPost sortBy={sortBy}/>
      </div>

      <div>
        <PostContainer posts={result.result}/>
      </div>

      <div className='my-8'>
        <PaginationWithLink
          page={currentPage}
          totalPageCount={result.totalPageCount!}
        />
      </div>
    </div>
  );
}

export default CategoryPage