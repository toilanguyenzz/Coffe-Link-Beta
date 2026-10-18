# ☕ BeanLink (Agri-OS) — Coffee Supply Chain & EUDR Compliance Platform

> **A Low-Friction Digital Operating System for Coffee Smallholders, Harvest Traceability, and EUDR Deforestation Compliance in Vietnam.**

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](#)
[![React](https://img.shields.io/badge/React-19.2_TypeScript-61dafb.svg?style=flat-square&logo=react)](#)
[![Capacitor](https://img.shields.io/badge/Mobile-Capacitor_Android-119EFF.svg?style=flat-square&logo=capacitor)](#)
[![GIS](https://img.shields.io/badge/GIS-Leaflet_%26_Turf.js-199900.svg?style=flat-square&logo=leaflet)](#)
[![AI](https://img.shields.io/badge/AI-Google_Gemini_GenAI-8E75C2.svg?style=flat-square&logo=google)](#)
[![Compliance](https://img.shields.io/badge/Standard-EUDR_Regulation-green.svg?style=flat-square)](#)

</div>

---

## 📌 Executive Summary & Business Context

Vietnam is the world's second-largest coffee producer, with smallholder farmers accounting for over 90% of total production in key regions such as Lam Dong and Dak Lak. However, the coffee export value chain faces an urgent regulatory disruption: **The European Union Deforestation Regulation (EUDR)**, requiring precise polygon-based land geolocation and proof of zero deforestation down to each individual plot.

### The Core Pain Points (As-Is Process Bottlenecks):
1. **Paper-Based Logging & Traceability Gaps:** Smallholder farming journals are maintained on paper or via memory, leading to lost harvest records and batch mixing during collector consolidation.
2. **Severe User Inertia:** Field farmers cannot and will not operate bloated enterprise ERP systems while working in coffee orchards.
3. **EUDR & Geolocation Barriers:** Cadastral boundaries in Vietnam utilize the **VN2000** coordinate reference system, which must be mathematically transformed into global WGS-84 polygons to prove compliance with EU satellite registries.
4. **Soil & Climate Blindness:** Lack of real-time soil moisture monitoring leads to irregular irrigation and suboptimal harvest yields.

---

## 💡 The BeanLink Solution (To-Be Architecture)

**BeanLink (Agri-OS)** bridges the gap between field agriculture and international export compliance via a **low-friction, mobile-first ecosystem**:

```
[Smallholder Farmer]
       │
       ├──► 2-Tap Harvest Logging (Voice-Assisted & Offline-First)
       ├──► IoT Soil Moisture & Microclimate Sensor Stream
       ├──► VN2000 to WGS-84 Polygon Transformation & EUDR Compliance Audit
       └──► Gemini GenAI "Plant Doctor" (Visual Pest & Disease Diagnosis)
       │
[Central Collector & Export Hub] ──► Batch QR Generation & Blockchain/Firebase Traceability Ledger
```

---

## 📐 Key Functional Modules & Business Analysis Deliverables

### 1. EUDR Compliance Engine & GIS Geofencing
* **Cadastral Transformation (`VN2000Converter.ts`):** Converts local Vietnamese projection coordinates to WGS84 latitude/longitude polygons using `@turf/turf`.
* **Deforestation Audit (`EUDRChecker.ts`):** Verifies farm plot coordinates against protected forest boundary datasets to provide instant EUDR export eligibility checks.
* **Exif Photo Verification (`ImageWatermarkService.ts`):** Embeds cryptographic GPS timestamp watermarks into field verification photos to prevent fraudulent certification claims.

### 2. Low-Friction Farmer UX & Voice Interface
* Designed specifically for non-tech-savvy users wearing field gloves: 2-tap fast logging, high-contrast visual cues, and **Voice Command Assistant (`VoiceCommandService.ts`)**.
* Automated lunar calendar agricultural scheduling (`LunarCalendarService.ts`) synchronized with regional rainfall forecasts (`WeatherService.ts`).

### 3. IoT Sensor Stream & Microclimate Analytics
* Real-time monitoring of soil volumetric water content (`MoistureService.ts`) to optimize drip irrigation intervals and reduce water waste.
* Automatic alert dispatching for drought stress and fungal disease vulnerability windows.

### 4. Gemini GenAI "Plant Doctor" Consultation
* Multi-modal visual diagnosis (`PlantDoctorService.ts`, `AIConsultationService.ts` powered by `@google/genai`): Farmers snap a photo of damaged coffee leaves/cherries to receive step-by-step bio-fungicide treatment recommendations.

### 5. Smallholder Trust Scoring & Green Credit Ledger
* Dynamic credit rating engine (`GreenCreditService.ts`, `trustScoring.ts`) quantifying sustainable agricultural practices (water conservation, organic fertilizer ratio) to unlock low-interest micro-loans from partnered financial institutions.

---

## 🛠️ System Architecture & Technology Stack

| Layer | Technologies Employed |
| :--- | :--- |
| **Frontend & UI** | React 19, TypeScript 5.8, Vite 6, Tailwind CSS, Lucide Icons |
| **Mobile Runtime** | Capacitor 8 (Cross-platform Android / Web PWA) |
| **GIS & Mapping** | Leaflet 1.9, React-Leaflet, Turf.js (Spatial Analysis) |
| **Artificial Intelligence** | Google Gemini GenAI SDK (`@google/genai`) |
| **Backend & Storage** | Firebase Firestore (Realtime Sync & Ledger), LocalStorage Cache |
| **Hardware Integration** | Soil IoT Sensor Telemetry, Camera Hardware API, Exif Metadata |

---

## 🧪 Field Usability Testing & Metrics

* **Sample Size:** Pilot field testing across **20+ smallholder coffee plots** in Lam Dong Province.
* **Task Completion Rate:** **85%** on initial interaction without prior instructional training.
* **Logging Time Reduction:** Reduced daily operational journaling from an estimated **15 minutes** (manual paper ledger) to **under 45 seconds** (mobile 2-tap log).

---

## 🚀 Running the Project Locally

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/toilanguyenzz/Coffe-Link-Beta.git

# Navigate to project directory
cd Coffe-Link-Beta

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

---

## 📋 Retrospective & Future Roadmap (Post-Mortem Analysis)

* **Current Limitation:** Satellite imagery overlay currently relies on public GIS APIs with limited resolution over steep terraced coffee plantations.
* **Next Steps:** 
  1. Integrate offline-sync SQLite database for deep-jungle areas without cellular data coverage.
  2. Implement smart contract QR verification for end-to-end "farm-to-espresso" batch certification.

---

<div align="center">
Developed by <strong>Ta Nguyen Khoi Nguyen</strong> • Business Analyst &amp; System Architect
</div>
