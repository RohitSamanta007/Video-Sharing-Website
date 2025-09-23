type CategoryProps = {
  id: number;
  name: string;
  createdAt: Date;
}

type CategoryWithVideoCountProps = {
  id:number;
  name: string;
  createdAt:Date;
  count: number;
}

type PostFormPayloadProps = {
  title: string;
  description: string;
  categoryIds: string[];
  videoKey?: string ;
  thumbnailKey: string;
  screenshotKeys: string[];
  isPublic: boolean | undefined;
  videoUrl: string;
  videoKey: string;
};

interface PostContainerProps {
  posts: {
    postId: string;
    postSlug: string;
    postTitle: string;
    postThumbnail: string;
    createdAt: Date|null;
  }[];
}

interface SearchParamsProps {
  searchParams: { [key: string]: string | undefined };
}

interface PaginationWithLinksProps {
  totalPageCount: number;
  page:number;
}

interface PostWithCount {
  result: {
    postId: string;
    postSlug: string;
    postTitle: string;
    postThumbnail: string;
    createdAt: Date | null;
  };
  totalPost: number;
}

interface EditPagePostsProps {
  // post: {
    categories: unknown;
    id: string;
    title: string;
    slug: string;
    description: string | null;
    videoUrl: string;
    videoKey: string | null;
    thumbnailUrl: string;
    thumbnailKey: string;
    screenshotUrls: string[];
    screenshotKeys: string[];
    isPublic: boolean | null;
    isPending: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  // };
}