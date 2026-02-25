"use client";

import { useState } from "react";
import { useBalance } from "@/context/balance-context";
import { addComment } from "@/actions/comment-actions";
// import { toggleCommentLike } from "@/actions/comment-actions"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Send, MessageSquare, ThumbsUp, MessageCircle, Flame, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketComments({ marketId, initialComments }: { marketId: number, initialComments: any[] }) {
  const { user } = useBalance();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "top">("newest");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Analizini paylaşmak için giriş yapmalısın.");
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await addComment(marketId, newComment);
      
      const optimisticComment = {
        id: Math.random().toString(),
        content: newComment,
        created_at: new Date().toISOString(),
        likes_count: 0,
        user_has_liked: false,
        profiles: {
          full_name: user.user_metadata?.full_name || "Kullanıcı",
          avatar_url: user.user_metadata?.avatar_url
        }
      };
      
      setComments([optimisticComment, ...comments]);
      setNewComment("");
      setSortBy("newest"); 
      toast.success("Analizin başarıyla paylaşıldı!");
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleLike = async (commentId: string) => {
    if (!user) return toast.error("Etkileşim vermek için giriş yapmalısın.");

    setComments((currentComments) => 
      currentComments.map((c) => {
        if (c.id === commentId) {
          const isLiked = c.user_has_liked;
          return {
            ...c,
            likes_count: isLiked ? Math.max(0, (c.likes_count || 0) - 1) : (c.likes_count || 0) + 1,
            user_has_liked: !isLiked
          };
        }
        return c;
      })
    );

    try {
      // await toggleCommentLike(commentId);
    } catch (error) {
      toast.error("İşlem başarısız.");
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "top") return (b.likes_count || 0) - (a.likes_count || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="bg-card border-2 border-border/50 rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-sm flex flex-col h-[500px] sm:h-[600px] relative">
      
      {/* PREMIUM HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/50 bg-secondary/20 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
            <Zap size={20} className="text-primary z-10" />
            <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-ping opacity-20"></div>
          </div>
          <div>
            <h3 className="font-black text-base sm:text-lg tracking-tight flex items-center gap-2 text-foreground">
              Yatırımcı Analizleri
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
              {comments.length} AKTİF GÖRÜŞ
            </p>
          </div>
        </div>

        {/* FİLTRELER (Mobile Uyumlu, Kompakt) */}
        {comments.length > 0 && (
          <div className="flex bg-background p-1 rounded-xl border border-border/50 shadow-inner w-full sm:w-auto self-start sm:self-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSortBy("newest")}
              className={cn(
                "flex-1 sm:flex-none h-7 px-3 text-[10px] sm:text-xs font-black rounded-lg transition-all", 
                sortBy === "newest" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <Clock size={12} className="mr-1.5" /> YENİ
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSortBy("top")}
              className={cn(
                "flex-1 sm:flex-none h-7 px-3 text-[10px] sm:text-xs font-black rounded-lg transition-all", 
                sortBy === "top" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <Flame size={12} className="mr-1.5" /> POPÜLER
            </Button>
          </div>
        )}
      </div>

      {/* CHAT AKIŞI (Yorumlar) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar bg-gradient-to-b from-background to-secondary/5">
        {sortedComments.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60 px-4 text-center">
             <div className="bg-secondary/50 p-4 rounded-full mb-3">
               <MessageSquare size={32} className="opacity-50" />
             </div>
             <p className="font-black text-sm sm:text-base">Sessizliği ilk sen boz!</p>
             <p className="text-xs font-medium mt-1">Piyasa hakkındaki stratejini ve öngörünü toplulukla paylaş.</p>
           </div>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment.id} className="group flex gap-3 sm:gap-4 animate-in fade-in duration-300">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 border border-border shadow-sm rounded-lg sm:rounded-xl">
                <AvatarImage src={comment.profiles?.avatar_url} className="object-cover" />
                <AvatarFallback className="font-black text-xs sm:text-sm bg-primary/10 text-primary">
                  {comment.profiles?.full_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                  <span className="font-black text-xs sm:text-[13px] tracking-tight text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                    {comment.profiles?.full_name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-wider shrink-0">
                    • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: tr })}
                  </span>
                </div>
                
                <div className="pr-4 sm:pr-8">
                  <p className="text-xs sm:text-[13px] text-foreground/90 font-medium leading-relaxed break-words whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>

                {/* ETKİLEŞİM BUTONLARI */}
                <div className="flex items-center gap-4 mt-2 text-[10px] sm:text-[11px] font-black uppercase text-muted-foreground tracking-widest">
                  <button 
                    onClick={() => handleLike(comment.id)}
                    className={cn(
                      "flex items-center gap-1.5 transition-colors group/btn",
                      comment.user_has_liked ? "text-blue-500" : "hover:text-foreground"
                    )}
                  >
                    <div className={cn("p-1 rounded-md transition-colors", comment.user_has_liked ? "bg-blue-500/10" : "group-hover/btn:bg-secondary")}>
                      <ThumbsUp size={12} className={cn(comment.user_has_liked && "fill-blue-500")} /> 
                    </div>
                    {comment.likes_count > 0 ? comment.likes_count : "Destekle"}
                  </button>
                  
                  <button className="flex items-center gap-1.5 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 group/btn">
                     <div className="p-1 rounded-md group-hover/btn:bg-secondary transition-colors">
                       <MessageCircle size={12} />
                     </div> 
                     Yanıtla
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PREMIUM INPUT (Giriş Alanı) */}
      <div className="p-3 sm:p-4 border-t border-border/50 bg-background/80 backdrop-blur-md relative z-10">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
          {user && (
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-secondary shadow-sm shrink-0 rounded-xl hidden sm:block">
              <AvatarImage src={user.user_metadata?.avatar_url} className="object-cover" />
              <AvatarFallback className="font-black bg-primary/10 text-primary">
                {user.user_metadata?.full_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="relative w-full flex bg-secondary/30 border border-border/50 rounded-2xl focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all shadow-inner">
            <Input 
              placeholder={user ? "Kendi analizini toplulukla paylaş..." : "Yorum yapmak için giriş yapmalısın"} 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!user || loading}
              className="min-h-[48px] sm:min-h-[56px] border-none bg-transparent focus-visible:ring-0 px-4 py-3 sm:py-4 font-medium text-xs sm:text-sm shadow-none w-full"
              autoComplete="off"
            />
            <div className="p-1.5 sm:p-2 shrink-0 flex items-end">
              <Button 
                type="submit" 
                size="icon" 
                disabled={!user || loading || !newComment.trim()} 
                className={cn(
                  "h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-300",
                  newComment.trim() ? "bg-primary text-primary-foreground shadow-md hover:scale-105" : "bg-secondary text-muted-foreground opacity-50"
                )}
              >
                <Send size={16} className={cn("transition-transform", newComment.trim() && "translate-x-0.5 -translate-y-0.5")} />
              </Button>
            </div>
          </div>
        </form>
      </div>
      
    </div>
  );
}