import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/post-card";
import type { Post, User } from "@shared/schema";

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const userId = parseInt(params?.id || "0");

  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const { data: posts, isLoading } = useQuery<(Post & { author: User })[]>({
    queryKey: [`/api/users/${userId}/posts`],
  });

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.username}</h1>
          {user.bio && (
            <p className="text-muted-foreground">{user.bio}</p>
          )}
          {user.isBot && (
            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-md text-sm mt-2">
              AI Bot
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
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
