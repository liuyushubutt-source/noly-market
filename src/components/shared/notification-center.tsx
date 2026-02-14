"use client";

import { useState, useEffect } from "react";
import { Bell, Gift, Clock, CheckCircle2, Info, TrendingUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getUserNotifications, markNotificationsAsRead, claimHourlyReward } from "@/actions/notification-actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useRouter } from "next/navigation";

export function NotificationCenter({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [lastClaim, setLastClaim] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [claiming, setClaiming] = useState(false);
  const router = useRouter();

  // Verileri çek
  useEffect(() => {
    if (!userId) return;
    getUserNotifications().then(data => {
      setNotifications(data.notifications);
      setLastClaim(data.lastClaim);
    });
  }, [userId, open]); // Her menü açıldığında yenile

  // Geri Sayım Sayacı Mantığı
  useEffect(() => {
    if (!lastClaim) return;
    
    const calculateTimeLeft = () => {
      const claimTime = new Date(lastClaim).getTime();
      const now = Date.now();
      const diff = claimTime + 3600000 - now; // 1 saat eklendi
      return diff > 0 ? diff : 0;
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [lastClaim]);

  // Sayacı MM:SS formatına çevir
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await claimHourlyReward();
      toast.success("100 TP hesabınıza eklendi! 💸");
      setLastClaim(new Date().toISOString());
      setTimeLeft(3600000); // 1 saati sıfırla
      window.dispatchEvent(new CustomEvent('tp-update', { detail: 100 }));
      router.refresh(); // Bakiyeyi üstte güncellemek için sayfayı yenile
    } catch (error: any) {
      toast.error(error.message);
    }
    setClaiming(false);
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      markNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  if (!userId) return null; // Giriş yapmamışsa gösterme

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const isReadyToClaim = timeLeft === 0;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-secondary/80">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 md:w-96 p-0 rounded-2xl border-border/50 shadow-2xl bg-background/95 backdrop-blur-xl overflow-hidden">
        
        {/* SAATLİK ÖDÜL KARTI (EN ÜSTTE) */}
        <div className="bg-gradient-to-br from-primary/20 to-pink-500/10 p-5 border-b border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-xl ${isReadyToClaim ? 'bg-green-500/20 text-green-500 animate-pulse' : 'bg-secondary text-muted-foreground'}`}>
              <Gift size={24} />
            </div>
            <div>
              <h4 className="font-black text-sm">Saatlik Ücretsiz TP</h4>
              <p className="text-xs font-medium text-muted-foreground">Her saat başı gel, 100 TP'yi kap.</p>
            </div>
          </div>
          
          <Button 
            onClick={handleClaim} 
            disabled={!isReadyToClaim || claiming}
            className={`w-full font-black shadow-sm ${isReadyToClaim ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
          >
            {claiming ? "Alınıyor..." : isReadyToClaim ? "🎁 100 TP'Yİ AL" : (
              <span className="flex items-center gap-2"><Clock size={14} /> {formatTime(timeLeft)} SONRA HAZIR</span>
            )}
          </Button>
        </div>

        {/* BİLDİRİM LİSTESİ */}
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 no-scrollbar">
          <div className="px-2 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Son Bildirimler
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm font-medium">
              Henüz bildiriminiz yok.
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className={`p-3 rounded-xl flex items-start gap-3 transition-colors hover:bg-secondary/50 ${!notif.is_read ? 'bg-secondary/30' : ''}`}>
                <div className={`mt-0.5 shrink-0 ${notif.type === 'reward' ? 'text-green-500' : notif.type === 'market' ? 'text-blue-500' : 'text-primary'}`}>
                   {notif.type === 'reward' ? <CheckCircle2 size={16} /> : notif.type === 'market' ? <TrendingUp size={16} /> : <Info size={16} />}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold leading-none">{notif.title}</p>
                  <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{notif.message}</p>
                  <p className="text-[9px] font-bold text-muted-foreground/50 uppercase">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: tr })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}