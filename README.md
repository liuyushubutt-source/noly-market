# Noly Market 

> Türkiye'nin nabzını tutan, gerçek zamanlı ve modern tahmin piyasası (Prediction Market) platformu.

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/ersozberk/noly-market/edit/main/README.md)
[![pt-br](https://img.shields.io/badge/lang-tr-green.svg)](https://github.com/ersozberk/noly-market/edit/main/README-tr.md)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)


## Proje Hakkında

**Noly Market**, kullanıcıların güncel olaylar (Ekonomi, Spor, Siyaset, Teknoloji vb.) üzerine öngörülerini yarıştırdığı bir tahmin piyasasıdır. Globaldeki *Polymarket* konseptinin Türkiye dinamiklerine, diline ve kullanıcı alışkanlıklarına göre yeniden hayal edilmiş halidir.

Bu platformda sadece "bence böyle olur" demezsiniz; bilginizi ve sezgilerinizi sanal bakiye (TP) ile destekleyerek piyasanın nabzını anlık olarak izlersiniz.

### Temel Özellikler

* ⚡️ **Sıfır Gecikme (Optimistic UI):** İşlem yapıldığı an sunucu yanıtını beklemeden arayüz ve bakiye güncellenir.
* 📊 **Canlı ve Akıllı Grafikler:** İşlem oldukça güncellenen, trend yönüne göre renk değiştiren profesyonel alan (area) grafikleri (Recharts).
* 🤖 **SQL Tetikleyicileri (Triggers):** Her işlemi otomatik olarak geçmiş fiyat veritabanına kaydeden sağlam backend mimarisi.
* 🔐 **Kesintisiz Kimlik Doğrulama:** Supabase Auth ile Google üzerinden tek tıkla güvenli giriş.
* 🎨 **Modern ve Dinamik Arayüz:** Tailwind CSS ve Shadcn/UI ile oluşturulmuş, tamamen responsive ve göz yormayan tasarım.
* 🎭 **Kişiselleştirilebilir Profil:** Veritabanını yormayan, DiceBear destekli şık varsayılan avatar havuzu.

---

## 🛠️ Kullanılan Teknolojiler

* **Frontend:** Next.js 14 (App Router), React, TypeScript
* **Stil & UI:** Tailwind CSS, Shadcn/UI, Lucide Icons
* **Grafik:** Recharts
* **Backend & Veritabanı:** Supabase (PostgreSQL, Auth, Row Level Security)
* **Tarih Yönetimi:** date-fns

---

## ⚙️ Kurulum (Geliştiriciler İçin)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Depoyu Klonlayın
```Bash
git clone https://github.com/ersozberk/noly-market/
cd noly-market
```

### 2. Bağımlılıkları Yükleyin
```Bash
npm install
```

### 3. Çevre Değişkenlerini Ayarlayın
Kök dizinde .env.local adında bir dosya oluşturun ve Supabase bilgilerinizi ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=senin_supabase_proje_url_adresin
NEXT_PUBLIC_SUPABASE_ANON_KEY=senin_supabase_anon_key_sifren
```

### 4. Veritabanını Kurun
Supabase SQL Editor üzerinden, projede bulunan SQL tablolarını ve trigger'ları ( markets, prices, profiles vb.) oluşturun.

### 5. Sunucuyu Başlatın
```Bash
npm run dev
```

Tarayıcınızda http://localhost:3000 adresine giderek projeyi görüntüleyebilirsiniz.

## 🤝 Katkıda Bulunma
Noly Market açık kaynaklı bir vizyonla geliştirilmektedir. Yeni özellikler eklemek, bug çözmek veya arayüzü iyileştirmek isterseniz katkılarınızı bekliyoruz!

Nasıl Katkı Sağlayabilirsiniz?

Bu depoyu "Fork"layın.

Kendi özelliğiniz için yeni bir dal (branch) oluşturun:
```
git checkout -b feature/HarikaBirOzellik
```

Değişikliklerinizi commit edin:
```
git commit -m 'Yeni bir HarikaBirOzellik eklendi'
```

Dalınıza gönderin (Push):
```
git push origin feature/HarikaBirOzellik
```
Bir Pull Request (PR) açın.

Lütfen PR açarken kodunuzun mevcut mimariye uygun olduğundan ve varsa yeni eklediğiniz özelliklerin gerektirdiği SQL kodlarını açıklamaya eklediğinizden emin olun.

## Lisans
Bu proje MIT Lisansı altında lisanslanmıştır. Dilediğiniz gibi kullanabilir, değiştirebilir ve dağıtabilirsiniz.
