# ☕ BeanLink — Coffee Traceability & Farm Management App

> A mobile-first app that helps coffee smallholders in Vietnam log their harvests digitally, track farm plots on a map, and meet EU export compliance requirements (EUDR).

<div align="center">

[![React](https://img.shields.io/badge/React-19_TypeScript-61dafb.svg?style=flat-square&logo=react)](#)
[![Mobile](https://img.shields.io/badge/Mobile-Capacitor_Android-119EFF.svg?style=flat-square&logo=capacitor)](#)
[![GIS](https://img.shields.io/badge/GIS-Leaflet_Turf.js-199900.svg?style=flat-square&logo=leaflet)](#)
[![AI](https://img.shields.io/badge/AI-Google_Gemini-8E75C2.svg?style=flat-square&logo=google)](#)

</div>

---

## What This Project Is

This is a **self-initiated project** I worked on with one teammate during Sep–Dec 2025. I was the **Business Analyst & UX Researcher** — I interviewed farmers, mapped out the current workflow, figured out the EU compliance requirements, and designed the app's user experience.

**The problem:** Vietnam is the world's 2nd largest coffee producer, but most smallholder farmers still use paper notebooks to track their harvests. When the EU introduced new deforestation regulations (EUDR), exporters suddenly needed precise GPS boundaries for every farm plot — and farmers had no way to provide that digitally.

**Our solution:** A simple mobile app where farmers can log harvests in 2 taps, view their farm plots on a map, and automatically generate the GPS data that exporters need for EUDR compliance.

---

## My BA & Research Contributions

### 1. Field Research & Process Mapping

I visited **20+ coffee farms in Lam Dong** and interviewed farmers about their daily workflow. Based on those interviews, I drew:

- **As-Is process map (BPMN):** How farmers currently track harvests (paper notebooks → collector picks up → no digital record → export paperwork is guesswork)
- **To-Be process map (BPMN):** How the app changes this (farmer logs harvest in app → data syncs to collector dashboard → GPS coordinates auto-generated for EUDR)

Key finding from interviews: Most farmers are 45–65 years old, have limited smartphone experience, and often wear work gloves. This shaped every UX decision we made.

### 2. EUDR Compliance Requirements

I researched what the EU Deforestation Regulation actually requires and translated it into app features:

- Farm plots in Vietnam use a local coordinate system called **VN2000**. EUDR requires **WGS-84** (standard GPS coordinates). I specified the conversion logic and the team implemented it using Turf.js.
- Each export batch needs proof that the farm plot doesn't overlap with protected forest areas. We built a checker that compares plot boundaries against forest boundary datasets.

### 3. UX Design (Figma Prototyping)

Designed the mobile screens with these constraints in mind:
- **Large buttons, high contrast** — farmers are often outdoors in bright sunlight
- **2-tap harvest logging** — select crop type → tap "Log Harvest" → done
- **Voice commands** — for hands-free use when wearing gloves
- Tested the prototype with farmers in the field and iterated based on their feedback (e.g., they wanted bigger text sizes than I initially designed)

### 4. Database Schema & API Testing

- Designed the database tables for farms, plots, harvests, and users
- Used **Postman** to test API endpoints and make sure harvest data synced correctly between the mobile app and the collector's warehouse dashboard

---

## How the App Works

```
[Farmer with smartphone]
       │
       ├──► 2-tap harvest logging (weight, crop type, photo)
       ├──► View farm plot boundaries on map
       ├──► AI "Plant Doctor" — snap a photo of damaged leaves for diagnosis
       └──► Soil moisture readings from IoT sensor (if available)
              │
[Collector / Exporter] ──► Batch tracking dashboard ──► EUDR compliance report with GPS polygons
```

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Mobile** | Capacitor 8 (builds to Android APK) |
| **Maps & GIS** | Leaflet, React-Leaflet, Turf.js |
| **AI** | Google Gemini SDK (plant disease diagnosis) |
| **Backend** | Firebase Firestore (real-time sync & storage) |

---

## Field Testing Results

- Tested with **20+ farmers** in Lam Dong Province
- **85% task completion rate** on first use without any training
- Daily logging time dropped from **~15 minutes** (paper notebook) to **under 45 seconds** (app)

---

## Running Locally

```bash
git clone https://github.com/toilanguyenzz/Coffe-Link-Beta.git
cd Coffe-Link-Beta
npm install
npm run dev
```

---

## What I Learned & What I'd Improve

- **Biggest lesson:** Talking to actual users before designing anything saved us from building features nobody wanted. The farmers didn't care about analytics dashboards — they just wanted fast, simple logging.
- **Current limitation:** Map satellite imagery has limited resolution over steep terraced coffee plantations.
- **Next step:** Add offline-first SQLite storage for areas without cell service (which is common in highland coffee regions).

---

<div align="center">
Built by <strong>Ta Nguyen Khoi Nguyen</strong> · FPT University · Self-initiated Project (Fall 2025)
</div>
