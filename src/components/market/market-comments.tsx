"use client";

import { useState } from "react";
import { useBalance } from "@/context/balance-context";
import { addComment } from "@/actions/comment-actions";
// Eğer like action'ın varsa buraya import etmelisin:
// import { toggleCommentLike } from "@/actions/comment-actions"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Send, MessageSquare, ThumbsUp, MessageCircle, Flame, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketComments({ marketId, initialComments }: { marketId: number, initialComments: any[] }) {
  const { user } = useBalance();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  
  // YENİ: Sıralama Filtresi State'i
  const [sortBy, setSortBy] = useState<"newest" | "top">("newest");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Yorum yapmak için giriş yapmalısınız.");
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
      setSortBy("newest"); // Yeni yorum yaptığında en yenileri görebilsin diye sekmeyi değiştir
      toast.success("Yorum eklendi!");
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  // YENİ: Beğeni İşlemi (Optimistic UI)
  const handleLike = async (commentId: string) => {
    if (!user) return toast.error("Beğenmek için giriş yapmalısınız.");

    // Anında ekranda sayıyı artır/azalt
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
      // Backend'e bildir (Eğer fonksiyonun varsa yorum satırını kaldır)
      // await toggleCommentLike(commentId);
    } catch (error) {
      toast.error("Beğeni işlemi başarısız oldu.");
      // Hata olursa eski haline getirilebilir
    }
  };

  // YENİ: Yorumları seçili filtreye göre sıralama
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "top") {
      return (b.likes_count || 0) - (a.likes_count || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="bg-card border-2 border-border/50 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[600px]">
      
      {/* BAŞLIK VE FİLTRELER */}
      <div className="flex flex-col border-b border-border/50 bg-secondary/10">
        <div className="p-4 flex items-center gap-3">
          <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
            <MessageSquare size={16} className="text-primary z-10" />
            <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-50"></div>
          </div>
          <div>
            <h3 className="font-black text-lg leading-tight flex items-center gap-2">
              Tartışma Panosu
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {comments.length} Canlı Görüş
            </p>
          </div>
        </div>

        {/* SIRALAMA SEKMELERİ (Filtreler) */}
        {comments.length > 0 && (
          <div className="flex px-4 pb-2 gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSortBy("newest")}
              className={cn(
                "h-8 text-xs font-bold rounded-full transition-all", 
                sortBy === "newest" ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Clock size={12} className="mr-1.5" /> En Yeni
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSortBy("top")}
              className={cn(
                "h-8 text-xs font-bold rounded-full transition-all", 
                sortBy === "top" ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Flame size={12} className="mr-1.5" /> En İyi
            </Button>
          </div>
        )}
      </div>

      {/* YORUM LİSTESİ */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar scroll-smooth">
        {sortedComments.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
             <MessageSquare size={40} className="mb-3 opacity-50" />
             <p className="font-bold text-sm">Sessizliği ilk sen boz!</p>
             <p className="text-xs mt-1">Bu piyasada henüz bir öngörü paylaşılmamış.</p>
           </div>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment.id} className="group flex gap-3 animate-in fade-in duration-300">
              <Avatar className="h-10 w-10 shrink-0 border border-border shadow-sm">
                <AvatarImage src={comment.profiles?.avatar_url} />
                <AvatarFallback className="font-bold bg-primary/10 text-primary">
                  {comment.profiles?.full_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[13px] tracking-tight text-foreground/90">
                    {comment.profiles?.full_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: tr })}
                  </span>
                </div>
                
                <div className="bg-secondary/40 border border-border/50 p-3.5 rounded-2xl w-full transition-colors group-hover:bg-secondary/60">
                  <p className="text-[13px] text-foreground font-medium leading-relaxed">
                    {comment.content}
                  </p>
                </div>

                {/* AKTİF BEĞENİ VE YANITLA BUTONLARI */}
                <div className="flex items-center gap-4 px-2 text-[11px] font-bold text-muted-foreground">
                  <button 
                    onClick={() => handleLike(comment.id)}
                    className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      comment.user_has_liked ? "text-blue-500" : "hover:text-foreground"
                    )}
                  >
                    <ThumbsUp size={14} className={cn(comment.user_has_liked && "fill-blue-500")} /> 
                    {comment.likes_count > 0 ? comment.likes_count : "Beğen"}
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                    <MessageCircle size={14} /> Yanıtla
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* YORUM GİRİŞ ALANI */}
      <div className="p-4 border-t border-border/50 bg-secondary/10">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 relative">
          {user && (
            <Avatar className="h-10 w-10 border border-border shadow-sm shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="font-bold bg-primary text-primary-foreground">
                {user.user_metadata?.full_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="relative w-full">
            <Input 
              placeholder={user ? "Senin analizin nedir?" : "Yorum yapmak için giriş yapın"} 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!user || loading}
              className="h-12 rounded-2xl bg-background border-border/50 pr-12 focus-visible:ring-primary font-medium text-sm"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!user || loading || !newComment.trim()} 
              className="absolute right-1.5 top-1.5 h-9 w-9 rounded-xl shadow-sm hover:scale-105 transition-transform"
            >
              <Send size={16} className={newComment.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}