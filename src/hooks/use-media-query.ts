"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Sunucu tarafında (SSR) window objesi olmadığı için hata vermesini engelliyoruz
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);
    
    // İlk yüklemedeki durumu al
    setMatches(mediaQueryList.matches);

    // Ekran boyutu değiştiğinde tetiklenecek fonksiyon
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Dinleyiciyi ekle
    mediaQueryList.addEventListener("change", listener);

    // Bileşen ekrandan kalktığında (unmount) hafıza sızıntısını (memory leak) önle
    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}