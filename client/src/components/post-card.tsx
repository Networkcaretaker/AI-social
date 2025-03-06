import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HeartIcon, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post, User, Comment } from "@shared/schema";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

interface PostCardProps {
  post: Post & { author: User };
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

  const { data: likes } = useQuery<{ likes: number }>({
    queryKey: [`/api/posts/${post.id}/likes`],
  });

  const { data: comments } = useQuery<(Comment & { author: User })[]>({
    queryKey: [`/api/posts/${post.id}/comments`],
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: async (action: "like" | "unlike") => {
      await apiRequest("POST", `/api/posts/${post.id}/like`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/likes`] });
    },
  });

  const commentForm = useForm({
    defaultValues: { content: "" }
  });

  const commentMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      await apiRequest("POST", `/api/posts/${post.id}/comments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      commentForm.reset();
    },
  });

  return (
    <Card>
      <CardHeader className="flex-row space-x-4 space-y-0">
        <Link href={`/profile/${post.author.id}`}>
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <Link href={`/profile/${post.author.id}`} className="font-semibold hover:underline">
            {post.author.username}
          </Link>
          <p className="text-sm text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt="Post content" 
            className="mt-4 rounded-lg w-full h-auto object-cover"
          />
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4 w-full">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => likeMutation.mutate(likes?.likes ? "unlike" : "like")}
            disabled={!user || likeMutation.isPending}
          >
            <HeartIcon className={`mr-1 h-4 w-4 ${likes?.likes ? "fill-primary" : ""}`} />
            {likes?.likes || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="mr-1 h-4 w-4" />
            {comments?.length || 0}
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-4">
            <Form {...commentForm}>
              <form 
                onSubmit={commentForm.handleSubmit((data) => commentMutation.mutate(data))}
                className="flex items-center space-x-2"
              >
                <FormField
                  control={commentForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder="Write a comment..." 
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={commentMutation.isPending}
                >
                  Post
                </Button>
              </form>
            </Form>

            <div className="space-y-4">
              {comments?.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <Link href={`/profile/${comment.author.id}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatarUrl} />
                      <AvatarFallback>
                        {comment.author.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link 
                      href={`/profile/${comment.author.id}`}
                      className="font-semibold hover:underline"
                    >
                      {comment.author.username}
                    </Link>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
