# Noly Market

> A real-time and modern prediction market platform that keeps its finger on the pulse of Türkiye.

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/ersozberk/noly-market/main/README.md)
[![pt-br](https://img.shields.io/badge/lang-tr-green.svg)](https://github.com/ersozberk/noly-market/main/README-tr.md)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)

## About the Project

**Noly Market** is a prediction marketplace where users compete with their predictions on current events (Economy, Sports, Politics, Technology, etc.). It is a reimagined version of the global *Polymarket* concept, adapted to Turkish dynamics, language, and user habits.

On this platform, you don't just say "I think it will be like this"; By supporting your knowledge and intuition with virtual balance (TP), you can monitor the pulse of the market in real time.

### Key Features

* ⚡️ **Zero Latency (Optimistic UI):** The interface and balance are updated instantly without waiting for a server response.
* 📊 **Live and Smart Charts:** Professional area charts (Recharts) that are updated as transactions occur and change color according to the trend direction.
* 🤖 **SQL Triggers:** Robust backend architecture that automatically records every transaction to the historical price database.
* 🔐 **Seamless Authentication:** Secure login with one-click via Google using Supabase Auth.
* 🎨 **Modern and Dynamic Interface:** Fully responsive and eye-friendly design created with Tailwind CSS and Shadcn/UI.
* 🎭 **Customizable Profile:** A stylish default avatar pool powered by DiceBear that doesn't strain the database.

---

## 🛠️ Technologies Used

* **Frontend:** Next.js 14 (App Router), React, TypeScript

* **Style & UI:** Tailwind CSS, Shadcn/UI, Lucide Icons

* **Graphics:** Recharts

* **Backend & Database:** Subbase (PostgreSQL, Auth, Row Level Security)

* **Date Management:** date-fns

---

## ⚙️ Setup (For Developers)

To run the project on your own computer, follow these steps:

### 1. Clone the Repository
```Bash
git clone https://github.com/ersozberk/noly-market/
cd noly-market
```

### 2. Install Dependencies
```Bash
npm install
```

### 3. Environment Variables Setup
Create a file named .env.local in the root directory and add your Supabase information:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_address
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_password
```

### 4. Set Up the Database
Create the SQL tables and triggers (markets, prices, profiles, etc.) in the project using the Supabase SQL Editor.

### 5. Start the Server
```Bash
npm run dev
```
You can view the project by going to http://localhost:3000 in your browser.

## 🤝 Contributing
Noly Market is developed with an open-source vision. We welcome your contributions if you want to add new features, fix bugs, or improve the interface!

How Can You Contribute?

Fork this repository.

Create a new branch for your feature:
```
git checkout -b feature/AGreatFeature
```
Commit your changes:
```
git commit -m 'A new AgreatFeature added'
```
Push to your branch:
```
git push origin feature/AgreatFeature
```
Open a Pull Request (PR).

Please ensure your code is compatible with the existing architecture when opening the PR and that you include any SQL code required by the newly added features in the description.

## License
This project is licensed under the MIT License. You may use, modify, and distribute it as you wish.
