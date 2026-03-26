import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";


// Sayfanın statik oluşturulmasını engeller, her istekte sunucuda çalışmasını sağlar.
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-6">
      <div className="bg-red-500/10 p-6 rounded-full">
        <AlertCircle size={64} className="text-red-500" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">404</h1>
        <h2 className="text-xl md:text-2xl font-bold text-muted-foreground">
          Aradığın piyasa burada yok şef!
        </h2>
      </div>

      <p className="max-w-[500px] text-muted-foreground font-medium">
        Belki silindi, belki hiç var olmadı, belki de yanlış bir adrese geldin. 
        Ana sayfaya dönüp fırsatları kovalamaya devam et.
      </p>

      <div className="pt-4">
        <Link href="/">
          <Button size="lg" className="rounded-full px-8 font-black shadow-lg hover:shadow-primary/20 transition-all">
            ANA SAYFAYA DÖN
          </Button>
        </Link>
      </div>
    </div>
  );
}
