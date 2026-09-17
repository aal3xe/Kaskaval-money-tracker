<p align="center">
  <img src="public/banner.jpg" alt="Kaskaval Hero Banner" width="100%" style="border-radius: 16px; max-width: 850px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
</p>

<h1 align="center">🧀 Kaskaval</h1>

<p align="center">
  <strong>Smart, Minimalist Personal Finance Tracker & Budget Planner</strong><br>
  <em>Clean Material 3 UI • Offline-First Persistence • Firebase Cloud Sync • Progressive Web App (PWA)</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-4F46E5?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/Architecture-Clean%20%26%20Offline--First-10B981?style=flat-square" alt="Architecture" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28?style=flat-square&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/PWA-Ready-F59E0B?style=flat-square" alt="PWA" />
</p>

---

## 🌟 Despre Kaskaval (Overview)

**Kaskaval** este o aplicație modernă de gestiune a finanțelor personale, concepută pentru a fi rapidă, intuitivă și plăcută la utilizare zilnică. Inspirată din principiile de design **Material 3 / Jetpack Compose**, aplicația combină simplitatea vizuală cu o arhitectură robustă: funcționează perfect offline și sincronizează automat datele în cloud atunci când ești conectat.

Instalată pe ecranul telefonului ca **PWA (Progressive Web App)**, Kaskaval rulează **pe tot ecranul (fullscreen)**, fără bara de adrese a browserului, oferind senzația unei aplicații native descărcate din Google Play Store.

---

## ✨ Funcționalități Cheie (Key Features)

- 📱 **Experiență Nativă de Mobil (PWA)**: Se instalează direct pe ecranul telefonului cu iconiță dedicată, lansare instantanee și mod complet fără margini de browser.
- ⚡ **Offline-First (Room DB Pattern)**: Fiecare tranzacție se salvează pe loc în memoria locală. Poți adăuga cheltuieli chiar și fără conexiune la internet.
- ☁️ **Sincronizare Cloud & Google Auth**: Conectare sigură cu contul tău Google prin Firebase Authentication și stocare securizată în Google Cloud Firestore.
- 📊 **Rapoarte Financiare Avansate**:
  - **Grafic Inelar (Round)**: Proporția dintre venituri și cheltuieli cu indicator de excedent/deficit.
  - **Grafic Liniar (Bars)**: Bare procentuale pentru fiecare categorie de cheltuieli (Chirie, Mâncare, Transport, etc.).
  - **Evoluție pe 7 Zile**: Grafic dinamic al cheltuielilor zilnice pentru identificarea vârfurilor de consum.
- 👆 **Gesturi Fluide (Swipe-to-Delete)**: Ștergerea tranzacțiilor prin glisare stânga/dreapta cu acțiune de *Undo* (anulare) de 5 secunde, identică cu experiența din Gmail.
- 🌐 **Complet Bilingvă**: Schimbare instantanee între **Română** 🇷🇴 și **English** 🇬🇧 direct din meniu.

---

## 💡 Sfaturi Practice pentru Bugetul Tău (Smart Financial Tips)

Aplicația este optimizată pentru a te ajuta să aplici principii financiare dovedite:

### 1. Regula 50 / 30 / 20
- **50% Nevoi (Needs)**: Chirie, utilități, mâncare de bază, transport.
- **30% Dorințe (Wants)**: Ieșiri în oraș, hobby-uri, electronice, divertisment.
- **20% Economii & Investiții (Savings)**: Fond de urgență, investiții pe termen lung.
> *Sfat Kaskaval*: Urmărește bara de proporție din ecranul principal. Dacă cheltuielile depășesc 70% din venituri, verifică distribuția categoriilor pentru a găsi scurgerile de buget.

### 2. „Plătește-te pe tine primul” (Pay Yourself First)
- Imediat ce înregistrezi un venit, alocă o sumă direct către un cont de economii înainte de a începe cheltuielile lunare.

### 3. Înregistrarea Zilnică a Micro-Cheltuielilor
- Micile achiziții de impuls (cafea zilnică, gustări, abonamente uitate) adunate lunar pot reprezenta peste 15-20% din buget. Înregistrează-le pe loc în Kaskaval imediat ce ai plătit!

---

## 🛠️ Tehnologii Utilizate (Tech Stack)

| Tehnologie | Rol |
|---|---|
| **React 18** | Bibliotecă declarativă pentru interfață |
| **TypeScript** | Siguranță strictă a tipurilor de date |
| **Vite** | Bundler ultra-rapid de ultimă generație |
| **Tailwind CSS** | Stiluri moderne și responsive bazate pe utilitare |
| **Firebase (Auth & Firestore)** | Autentificare Google și bază de date în Cloud |
| **Service Worker & Web Manifest** | Suport PWA, cache offline și instalare mobilă |
| **Lucide React** | Pictograme vectoriale optimizate |
| **Canvas Confetti** | Animații vizuale festive la adăugarea de tranzacții |

---

## 🚀 Instalare și Rulare Locală (Local Setup)

Dacă vrei să rulezi proiectul pe calculatorul tău:

1. **Clonează repository-ul**:
   ```bash
   git clone https://github.com/UTILIZATOR/kaskaval.git
   cd kaskaval
   ```

2. **Instalează dependențele**:
   ```bash
   npm install
   ```

3. **Pornește serverul local de dezvoltare**:
   ```bash
   npm run dev
   ```
   Deschide browserul la adresa indicată (de obicei `http://localhost:3000`).

4. **Construiește pentru producție**:
   ```bash
   npm run build
   ```

---

## 📲 Cum instalezi Kaskaval pe Telefon (PWA Guide)

### Pe Android (Google Chrome)
1. Deschide link-ul aplicației în **Chrome**.
2. Apasă pe butonul **„Instalează”** afișat în partea de sus a aplicației (sau apasă pe cele 3 puncte **⋮** din dreapta-sus -> **„Instalează aplicația”**).
3. Confirmă instalarea. Pe ecranul telefonului va apărea iconița **Kaskaval**.
4. Deschide aplicația: va rula **pe tot ecranul, fără nicio bară de adresă sau butoane de browser**.

### Pe iPhone / iOS (Safari)
1. Deschide link-ul aplicației în **Safari**.
2. Apasă pe butonul de Partajare (**Share** 📤 de la baza ecranului).
3. Derulează în jos și alege **„Adaugă pe ecranul principal” (Add to Home Screen)**.
4. Apasă **Add**. Kaskaval este acum gata pe ecranul tău principal!

---

## 🔒 Confidențialitate & Securitate (Privacy)

- **Datele îți aparțin**: Tranzacțiile tale sunt salvate pe dispozitivul tău și legate strict de contul tău personal de Google.
- **Fără partajare terță**: Nicio informație financiară nu este vândută sau partajată cu terți.
- **Reguli de securitate Cloud**: Baza de date Firestore utilizează reguli stricte prin care fiecare utilizator își poate citi și modifica doar propriile documente.

---

<p align="center">
  Creat cu pasiune pentru independență financiară și design de calitate.<br>
  <strong>Kaskaval © 2026</strong>
</p>
