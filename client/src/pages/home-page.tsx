import { useQuery } from "@tanstack/react-query";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post, User } from "@shared/schema";

export default function HomePage() {
  const { data: posts, isLoading } = useQuery<(Post & { author: User })[]>({
    queryKey: ["/api/posts"],
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <CreatePost />
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[140px]" />
                </div>
              </div>
              <Skeleton className="h-[200px] w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
