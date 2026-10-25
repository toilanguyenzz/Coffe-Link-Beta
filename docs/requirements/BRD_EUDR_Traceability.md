# 📋 Business Requirements Document (BRD)
## Project: BeanLink (CoffeeLink Agri-OS) — EUDR Coffee Traceability Platform

**Document Version:** 2.1  
**Author:** Ta Nguyen Khoi Nguyen (Business Analyst & System Analyst)  
**Target Audience:** Engineering Leads, Product Managers, Compliance Officers, Agricultural Cooperatives  

---

## 1. Executive Summary
The European Union Deforestation Regulation (EUDR - Regulation (EU) 2023/1115) mandates that from 2025 onwards, all coffee imported into the EU must prove:
1. It was produced on land that has not been subject to deforestation after **December 31, 2020**.
2. It has been harvested in compliance with the relevant legislation of the country of production.
3. It is covered by a Due Diligence Statement (DDS) containing **verifiable GPS polygon coordinates** for every farm plot larger than 4 hectares (or single point coordinates for smaller plots).

In Vietnam (Lam Dong, Dak Lak), over 85% of coffee is cultivated by smallholder farmers with an average parcel size of 0.8–2.5 hectares. The current supply chain relies entirely on paper journals, leading to a 0% digital auditability rate at the source. **BeanLink** resolves this systemic vulnerability by providing an offline-first mobile application that digitizes harvest logging and translates local cadastral records (VN2000) into EUDR-compliant WGS-84 polygons.

---

## 2. Business Objectives & Success Metrics
| Metric ID | Objective | Baseline (As-Is) | Target (To-Be with BeanLink) |
|:---|:---|:---|:---|
| **OBJ-01** | EUDR Due Diligence Readiness | 0% digital traceability | 100% export batches have certified GPS/Polygon audit trails |
| **OBJ-02** | Harvest Log Cycle Time | 8.5 minutes/log (manual paper entry) | < 15 seconds (2-tap logging + voice dictation) |
| **OBJ-03** | Farmer Usability & Adoption | 12% adoption with standard ERP tools | > 85% task completion rate among elderly smallholders |
| **OBJ-04** | Inventory Reconciliation Error | 14.2% shrinkage/discrepancy | < 0.8% weight deviation across collector-to-warehouse flow |

---

## 3. Stakeholder Profiles
* **Smallholder Farmer (Actor: Farmer):** Elderly demographic (45–65 y/o), low digital literacy, operates in remote areas with unstable 3G/4G connectivity. Requires low-friction UI, high outdoor contrast, and voice inputs.
* **Local Collector / Middleman (Actor: Collector):** Aggregates cherry coffee from 30–50 farmers daily; requires fast batch validation, offline QR code generation, and mobile scale Bluetooth integration.
* **Warehouse Manager (Actor: Warehouse):** Manages regional reception hubs; verifies physical weight against digital manifests and synchronizes verified stock with ERP systems.
* **EU Compliance Auditor (Actor: Auditor):** Validates GeoJSON polygons against European Copernicus Sentinel-2 satellite imagery to verify zero post-2020 forest degradation.

---

## 4. Business Rules (BR01 – BR10)

* **BR01 (Geolocation Mandatory):** Every harvest log must be atomically stamped with valid latitude/longitude coordinates and an altitude accuracy radius <= 15 meters.
* **BR02 (EUDR Deforestation Cutoff):** Parcels overlapping with primary forest boundaries recorded after December 31, 2020, must be flagged as `HIGH_RISK_REJECTED` and blocked from export batch generation.
* **BR03 (Polygon Enclosure Integrity):** For farm plots >= 4.0 hectares, the farmer must provide a closed polygon containing at least 6 coordinate vertices. Polygons with self-intersections or duplicate consecutive vertices are rejected by client-side Turf.js validation.
* **BR04 (Offline Tamper-Resistance):** When offline, harvest transactions are written to IndexedDB with an incremental hash-chain ($H_n = \text{SHA256}(H_{n-1} + \text{Payload})$) preventing retrospective timestamp tampering.
* **BR05 (Batch Weight Reconciliation):** A collector batch weight cannot deviate by more than ±2.5% from the cumulative sum of constituent farmer harvest logs (accounting for moisture loss during transit).
* **BR06 (Single-Parcel Allocation):** A single harvest event can only be allocated to exactly one registered cadastral parcel ID.
* **BR07 (Voice-to-Text Fallback):** If voice transcription fails due to regional dialects (Central Highlands accents), the UI must default to numeric quick-increment steppers (+10kg, +50kg, +100kg).
* **BR08 (Cadastral Transformation):** All cadastral red-book coordinates in VN2000 (3-degree/6-degree zone) must be converted server-side or via Turf.js to WGS-84 (EPSG:4326) prior to EU export package assembly.
* **BR09 (Audit Retention):** All raw telemetry, photos, and polygon vertices must be preserved for a statutory minimum of 5 years in immutable Cloud Firestore storage.
* **BR10 (Graceful Degradation):** In complete network blackouts, the mobile application must maintain 100% core offline functionality for up to 14 consecutive days.

---

## 5. Functional Requirements (High-Priority Scope)
* **FR-01 (Farmer Onboarding):** Support phone OTP authentication with one-click profile creation and voice profile setup.
* **FR-02 (2-Tap Harvest Logger):** Home screen widget allowing harvest entry with: [Select Variety] -> [Confirm Weight via Stepper/Voice] -> [Save].
* **FR-03 (Interactive Parcel Mapping):** Mobile GIS map utilizing Leaflet and Turf.js displaying parcel boundaries, centroid coordinates, and satellite base layers.
* **FR-04 (VN2000 to WGS-84 Converter):** Input interface for official cadastral landmark points with real-time conversion and boundary verification.
* **FR-05 (Offline Queue Manager):** Background synchronization daemon using Web Workers to retry synchronization with exponential backoff.
* **FR-06 (EUDR Compliance Pre-checker):** Client-side heuristic evaluating plot location against known protected conservation zones.
* **FR-07 (QR Batch Pass Generator):** Generates high-density QR code encoding batch metadata, parcel UUID, and cryptographic hash for collector scanning.
* **FR-08 (Gemini Plant Doctor):** Multi-modal plant disease scanning using device camera with localized treatment prescriptions.
