import Image from "next/image";
import FilterPost from "@/components/post/filter-post";
import SearchInput from "@/components/post/search-input";
import PostContainer from "@/components/post/postContainer";
import { getPosts } from "@/actions/users-actions";
import SelectCategory from "@/components/home/select-category";
import { getCategoriesWithVideoCount } from "@/actions/admin-actions";
import PaginationWithLink from "./pagination-with-links";
import { notFound } from "next/navigation";


async function HomePagePosts({ searchParams }: SearchParamsProps) {

    const currentPage = parseInt((searchParams.page as string) || "1");
    const sortBy = (searchParams.sortBy as string) || "latest";
    const query = (searchParams.search_query as string) || "";

    console.log("The vlaue of current page : ", currentPage);
    console.log("The vlaue of sort by : ", sortBy);
    console.log("The vlaue of query : ", query);
    

  const [categories, posts] = await Promise.all([
    getCategoriesWithVideoCount(),
    getPosts(Number(currentPage), query, sortBy),
  ]);

  if(!posts.success){
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <h1 className="text-red-400 font-bold text-xl md:text-2xl lg:text-3xl">Internal serever Error! Please try again later</h1>
      </div>
    )
  }

  if(currentPage>posts.totalPageCount!){
    return notFound()
  }

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <div>
          <SelectCategory categories={categories} />
        </div>
        <div>
          <FilterPost sortBy={sortBy} />
        </div>
      </div>
      <div className="w-full max-w-lg mx-auto p-6">
        <SearchInput query={query} />
      </div>

      <div>
        <PostContainer posts={posts.result} />
      </div>

      <div className="my-8">
        <PaginationWithLink
          page={currentPage}
          totalPageCount={posts.totalPageCount!}
        />
      </div>
    </div>
  );
}

export default HomePagePosts;
