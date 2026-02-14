"use client";

import { useState } from "react";
import { useBalance } from "@/context/balance-context";
import { addComment } from "@/actions/comment-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Send, MessageSquare } from "lucide-react";

export function MarketComments({ marketId, initialComments }: { marketId: number, initialComments: any[] }) {
  const { user } = useBalance();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Yorum yapmak için giriş yapmalısınız.");
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await addComment(marketId, newComment);
      
      // Optimistic UI: Yorumu anında ekrana basıyoruz
      const optimisticComment = {
        id: Math.random().toString(),
        content: newComment,
        created_at: new Date().toISOString(),
        profiles: {
          full_name: user.user_metadata?.full_name || "Kullanıcı",
          avatar_url: user.user_metadata?.avatar_url
        }
      };
      setComments([optimisticComment, ...comments]);
      setNewComment("");
      toast.success("Yorum eklendi!");
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[500px]">
      <div className="p-4 border-b border-border/50 bg-secondary/20 flex items-center gap-2">
        <MessageSquare size={18} className="text-primary" />
        <h3 className="font-black text-lg">Piyasa Tartışması</h3>
        <span className="ml-auto text-xs font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {comments.length} Yorum
        </span>
      </div>

      {/* YORUM LİSTESİ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {comments.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70">
             <MessageSquare size={32} className="mb-2" />
             <p className="font-medium text-sm">İlk yorumu sen yap!</p>
           </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={comment.profiles?.avatar_url} />
                <AvatarFallback>{comment.profiles?.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 bg-secondary/30 p-3 rounded-2xl rounded-tl-sm w-full">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{comment.profiles?.full_name}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: tr })}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 font-medium leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* YORUM GİRİŞ ALANI */}
      <div className="p-4 border-t border-border/50 bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <Input 
            placeholder={user ? "Bu piyasa hakkında ne düşünüyorsun?" : "Yorum yapmak için giriş yapın"} 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user || loading}
            className="h-12 rounded-xl bg-secondary/50 border-transparent pr-12 focus-visible:ring-primary"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!user || loading || !newComment.trim()} 
            className="absolute right-1.5 h-9 w-9 rounded-lg"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}