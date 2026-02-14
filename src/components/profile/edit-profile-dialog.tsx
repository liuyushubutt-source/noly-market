"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/actions/profile-actions";
import { toast } from "sonner";
import { Loader2, Settings2, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Özenle seçilmiş, şık varsayılan avatarlar
const DEFAULT_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Nolcak1&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Trader&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Whale&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bull&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Alpha&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sigma&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot1&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot2&backgroundColor=d1d4f9",
];

export function EditProfileDialog({ 
  currentName, 
  currentAvatar 
}: { 
  currentName: string; 
  currentAvatar: string;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState(currentName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || DEFAULT_AVATARS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("fullName", name);
      formData.append("avatarUrl", selectedAvatar);
      
      await updateProfile(formData);
      
      toast.success("Profilin başarıyla güncellendi!");
      
      // Navbar'daki resmi anında güncellemek için sinyal gönder
      window.dispatchEvent(new CustomEvent('avatar-update', { detail: selectedAvatar }));

      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4 font-bold border-border/50 bg-secondary/30 hover:bg-secondary">
          <Settings2 size={16} className="mr-2" /> Profili Düzenle
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-border/50 shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-center">Profilini Özelleştir</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 mt-2">
          
          {/* İSİM ALANI */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">
              Kullanıcı Adı
            </label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Görünmesini istediğin isim" 
              className="h-12 bg-secondary/30 border-border/50 rounded-xl focus-visible:ring-primary text-lg font-bold"
              maxLength={20}
              required
            />
          </div>

          {/* AVATAR SEÇİMİ (GÜNCELLENMİŞ KISIM) */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">
              Bir Avatar Seç
            </label>
            
            <div className="grid grid-cols-4 gap-4 p-2">
              {DEFAULT_AVATARS.map((avatar, idx) => {
                const isSelected = selectedAvatar === avatar;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    // GÜNCELLEME: Ring kalınlığı azaltıldı (ring-2), boyut büyütüldü, padding sıfırlandı.
                    className={`
                      relative group rounded-full transition-all duration-300 ease-out p-0 aspect-square flex items-center justify-center
                      ${isSelected 
                        ? 'ring-[3px] ring-primary ring-offset-2 ring-offset-background scale-110 shadow-lg' 
                        : 'opacity-70 hover:opacity-100 hover:scale-105 hover:ring-2 hover:ring-border hover:ring-offset-1'
                      }
                    `}
                  >
                    <Avatar className="h-16 w-16 cursor-pointer">
                       <AvatarImage src={avatar} className="object-cover h-full w-full" />
                       <AvatarFallback>AV</AvatarFallback>
                    </Avatar>
                    
                    {/* Seçili İkonu (Opsiyonel Şıklık) */}
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-background">
                        <Check size={10} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-12 font-black text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "DEĞİŞİKLİKLERİ KAYDET"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}