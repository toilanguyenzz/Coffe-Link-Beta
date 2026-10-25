# 🎯 User Stories & Acceptance Criteria (AC)
## BeanLink (CoffeeLink Agri-OS) — Product Requirements

**Framework:** Agile Scrum with Gherkin Syntax (Given — When — Then)  
**Author:** Ta Nguyen Khoi Nguyen (Business Analyst & System Analyst)  

---

## Epic 1: Ultra Low-Friction Harvest Logging (Field UX)

### US-01: 2-Tap Harvest Entry
* **As a** coffee smallholder farmer with dirt on my hands,  
* **I want to** log my daily cherry coffee harvest in 2 taps without typing numbers,  
* **So that** I do not abandon digital logging at the end of an exhausting workday.

#### Acceptance Criteria (AC-01):
```gherkin
Scenario: Successful harvest logging via stepper buttons
  Given the farmer has the app open on the Field Dashboard
  And GPS location is enabled and locked with accuracy <= 15m
  When the farmer taps the "Quick Harvest" floating action button
  And taps the "+50kg" preset stepper button twice (Total: 100kg)
  And taps "Save Harvest"
  Then the system records a new HarvestLog entity with weight = 100, timestamp = CURRENT_TIME
  And stores the record in local IndexedDB
  And displays a prominent green confirmation toast with haptic feedback
  And updates the daily progress gauge within 300ms.

Scenario: Harvest logging under offline conditions
  Given the device has no internet connectivity (Airplane mode or no cellular signal)
  When the farmer completes a harvest log
  Then the transaction is stored with status "SYNC_PENDING"
  And an offline banner indicates "Saved locally (Will sync automatically when online)"
  And the record is added to the background sync queue.
```

---

### US-02: Voice-Driven Harvest Dictation
* **As an** elderly farmer who finds mobile keyboards hard to read,  
* **I want to** speak my harvest amount in Vietnamese,  
* **So that** the application automatically parses the variety and kilograms.

#### Acceptance Criteria (AC-02):
```gherkin
Scenario: Voice dictation recognition
  Given the farmer presses and holds the Microphone button
  When the farmer says "Hai bao Robusta tong cong tam muoi ky" (Two bags of Robusta, 80kg total)
  And releases the microphone button
  Then the system parses: Variety = "Robusta", Quantity = 80, Unit = "kg"
  And populates the confirmation modal with pre-filled values
  And waits for a single confirmation tap before committing.
```

---

## Epic 2: Cadastral Boundary & EUDR Due Diligence

### US-03: Cadastral Coordinate Conversion (VN2000 to WGS-84)
* **As a** farmer or cooperative officer holding a Vietnamese land-use certificate (So Do),  
* **I want to** input VN2000 local survey coordinates,  
* **So that** BeanLink transforms them into international WGS-84 polygons required by the European Commission.

#### Acceptance Criteria (AC-03):
```gherkin
Scenario: Coordinate transformation and Turf.js closure validation
  Given a set of 6 boundary corner points in VN2000 format (Zone 3-degree, Lam Dong Meridian 107.75)
  When the user submits the boundary form
  Then the system computes the 7-parameter Helmert transformation into WGS-84 (EPSG:4326)
  And validates that the polygon is geometrically closed (first point == last point)
  And checks with Turf.js that no edges intersect (isSimplePolygon == true)
  And calculates total area in hectares (ha)
  And renders the polygon over Mapbox/OpenStreetMap satellite imagery.
```

---

### US-04: EUDR Forest Encroachment Screening
* **As an** agricultural cooperative compliance auditor,  
* **I want to** check farm parcel polygons against the Dec 31, 2020 forest baseline,  
* **So that** we guarantee zero deforestation risk before shipping to EU ports.

#### Acceptance Criteria (AC-04):
```gherkin
Scenario: Parcel passes deforestation check
  Given a validated WGS-84 parcel polygon
  When the system queries the Copernicus Global Land Service deforestation raster mask
  And finds 0% overlap with protected primary forest canopy lost after 31/12/2020
  Then the parcel compliance status is set to "EUDR_VERIFIED"
  And a verifiable green badge is appended to all subsequent batch exports.
```

---

## Epic 3: Batch Aggregation & Centralized Warehouse Sync

### US-05: Collector Batch Generation & Handover
* **As a** local collector aggregating coffee at the farm gate,  
* **I want to** group multiple farmer harvest logs into a single QR-coded batch,  
* **So that** the receiving warehouse can scan and ingest all origin polygons in one second.

#### Acceptance Criteria (AC-05):
```gherkin
Scenario: Batch generation with weight tolerance check
  Given 12 individual farmer harvest logs totaling 1,200 kg
  When the collector initiates "Create Aggregated Batch"
  And records the scale weight as 1,185 kg (1.25% moisture loss)
  Then the system verifies the deviation is within tolerance (<= 2.5%)
  And generates an aggregated QR code embedding:
    - Batch UUID
    - Hash of constituent farmer parcel IDs
    - Total Gross & Net weight
    - Cryptographic HMAC signature
  And transitions batch status to "IN_TRANSIT_TO_WAREHOUSE".
```
