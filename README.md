<p align="center">
  <img src="public/banner.jpg" alt="Kaskaval Hero Banner - kaskaval.online" width="100%" style="border-radius: 16px; max-width: 850px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

<h1 align="center">🧀 Kaskaval</h1>

<p align="center">
  <strong>Smart, Minimalist Personal Finance Tracker & Budget Planner</strong><br>
  <em>Clean Architecture • Offline-First Persistence • Firebase Cloud Sync • Progressive Web App (PWA)</em><br>
  🌐 <strong>Live Application:</strong> <a href="https://kaskaval.online">https://kaskaval.online</a>
</p>

<p align="center">
  <a href="https://kaskaval.online"><img src="https://img.shields.io/badge/Website-kaskaval.online-F3C77C?style=flat-square&logo=googlechrome&logoColor=black" alt="Website" /></a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT" />
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-4F46E5?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/Architecture-Offline--First%20%26%20Clean-10B981?style=flat-square" alt="Architecture" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=flat-square&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/PWA-Installable-F59E0B?style=flat-square" alt="PWA" />
</p>

---

## 🌟 Overview

**Kaskaval** ([kaskaval.online](https://kaskaval.online)) is a fast, modern personal finance tracker engineered for effortless daily expense recording, clean visual analytics, and absolute reliability. Designed around the aesthetics of **dark obsidian and warm gold** with an Android Jetpack Compose inspired flair, Kaskaval combines offline-first local persistence with seamless Firebase cloud synchronization.

Installed on your phone as a **Progressive Web App (PWA)**, Kaskaval runs in **edge-to-edge full-screen mode** without any browser address bar, providing the tactile feel and speed of a native app.

---

## ✨ Key Features

- 📱 **Native Mobile Feel (PWA)**: Installs directly to your home screen with a dedicated launcher icon, instant startup, and zero browser chrome.
- ⚡ **Offline-First (Room DB Pattern)**: Transactions save instantly to local storage. Log expenses seamlessly even without an internet connection or while traveling.
- ☁️ **Cloud Sync & Google Auth**: One-tap secure login with Google via Firebase Authentication, with automatic real-time sync across all your devices using Google Cloud Firestore.
- 📊 **Visual Financial Analytics**:
  - **Dynamic Donut & Ratio Chart**: Live visualization of your Income vs. Expense ratio with real-time Surplus/Deficit calculation and monthly budget target monitoring.
  - **7-Day Spending Evolution**: Daily expenditure trend bars with zero-baseline markers, scale references, and tap-to-inspect tooltips.
  - **Category Breakdown**: Proportional horizontal progress bars for categories (Rent, Food & Dining, Transport, Entertainment, etc.).
- 👆 **Fluid Gestures (Swipe-to-Delete)**: Delete transactions via left/right swipe with a 5-second Gmail-style **Undo** toast for accidental removals.
- 💵 **Multi-Currency Ready**: Switch on the fly between **USD ($)**, **EUR (€)**, **GBP (£)**, and **RON (Romanian Leu)**.
- 🌐 **Bilingual Support**: Instant toggle between **English** 🇬🇧 and **Romanian** 🇷🇴.
- 🎯 **Clean Slate by Default**: Starts cleanly at **0.00** without hardcoded test noise, allowing every user to begin tracking their personal finances immediately.

---

## 💡 Practical Budgeting Principles

Kaskaval is built to support proven financial frameworks:

### 1. The 50 / 30 / 20 Rule
- **50% Needs**: Housing, utilities, groceries, transportation.
- **30% Wants**: Dining out, hobbies, gadgets, entertainment.
- **20% Savings & Investments**: Emergency fund, debt reduction, long-term wealth building.
> *Kaskaval Tip*: Keep an eye on your Monthly Budget Overview card. If your spending exceeds 70% of income early in the month, check your category breakdown to pinpoint leaks.

### 2. Pay Yourself First
- Whenever new income is logged, immediately set aside a fixed percentage into your savings before starting discretionary monthly spending.

### 3. Log Micro-Expenses Daily
- Small, unnoticed purchases (daily coffee, snacks, forgotten recurring subscriptions) often total 15–20% of monthly income. Log them in Kaskaval the moment you pay.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | Modern declarative UI with hooks and transitions |
| **TypeScript 5.8** | Full static type safety and maintainable contracts |
| **Vite 6** | Lightning-fast development server and optimized build bundling |
| **Tailwind CSS v4** | Modern utility-first responsive styling |
| **Firebase (Firestore & Auth)** | Google OAuth authentication and Cloud Firestore cloud backup |
| **Service Worker & Web App Manifest** | PWA offline capability, caching, and home screen installation |
| **Lucide React** | Clean, optimized vector icon set |
| **Canvas Confetti** | Subtle celebratory animations when hitting financial milestones |

---

## 🚀 Getting Started (Local Development)

Follow these steps to run Kaskaval locally on your machine:

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** or **bun** / **yarn**

### 1. Clone the repository
```bash
git clone https://github.com/alex3adrian/kaskaval.git
cd kaskaval
```

*Or use the hosted version directly:* **[https://kaskaval.online](https://kaskaval.online)**

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for production
```bash
npm run build
```
Production assets are generated in the `dist/` directory.

---

## 📲 How to Install Kaskaval on Mobile (PWA Guide)

### On Android (Google Chrome)
1. Navigate to **[kaskaval.online](https://kaskaval.online)** in **Chrome**.
2. Tap the **Burger Menu (top right)** -> **"Install Application"** (or tap the **⋮** menu in Chrome -> **"Install app"** / **"Add to Home screen"**).
3. Confirm the prompt. The **Kaskaval** icon will appear on your home screen and app drawer.
4. Launching it opens the application in **standalone full-screen mode** without any browser controls.

### On iPhone / iOS (Safari)
1. Navigate to **[kaskaval.online](https://kaskaval.online)** in **Safari**.
2. Tap the **Share** button (📤 at the bottom toolbar).
3. Scroll down and select **"Add to Home Screen"**.
4. Tap **Add**. Kaskaval is now installed on your iPhone home screen!

---

## 🔒 Security & Privacy

- **Your Data Stays Yours**: When using Guest Mode, your transactions reside exclusively in your device's local storage.
- **Strict Firestore Security Rules**: Cloud Firestore rules enforce authenticated user scoping — users can only read, write, and delete their own records.
- **No Third-Party Trackers**: No third-party ad networks or data brokerage integrations.

---

## 🤝 Contributing

Contributions, feature requests, and bug reports are welcome!
Feel free to open an issue or submit a pull request:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<p align="center">
  Crafted for financial clarity and clean software architecture.<br>
  <strong><a href="https://kaskaval.online">Kaskaval</a> © 2026</strong>
</p>
