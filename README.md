# ✈️ AeroSentinel
### Explainable Edge AI Decision Support for Real-Time Aircraft Safety

AeroSentinel is a world-class Explainable Edge AI Decision Support platform designed for next-generation aircraft safety monitoring and predictive avionic telemetry maintenance. It identifies component fatigue and failures before they become critical, explaining the underlying AI reasoning through SHAP and LIME algorithms.

---

## 🌐 Unified Application Host Link

### 🔗 [http://localhost:3000](http://localhost:3000)

> **Single Access Point**: `http://localhost:3000` serves as the unified portal for all cock-pit pages, 3D visualizers, live WebSocket telemetry feeds, and backend prediction APIs (proxied dynamically via Next.js API rewrites).

---

## 🤖 Aero AI Assistant Chatbox

AeroSentinel includes **Aero**, a floating, interactive AI flight safety assistant orb.

- **Animated Hologram Orb**: Features breathing glow animations, eye blinking, and speaking soundwave effects.
- **Voice Commands (STT & TTS)**: Native Speech-to-Text microphone input and Text-to-Speech audio response synthesis.
- **Avionics Safety Q&A**: Answers technical questions regarding aircraft sensors, SHAP/LIME explanation weights, and edge safety protocols.

---

## 🏗️ System Architecture & Data Flow

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │                AEROSENTINEL AIRCRAFT                   │
                                    └──────────────────────────┬─────────────────────────────┘
                                                               │
                                         ┌─────────────────────▼─────────────────────┐
                                         │        ARINC 429 Telemetry Data Bus       │
                                         │  (Temp, PSI, RPM, Vibration, Volt, GPS)   │
                                         └─────────────────────┬─────────────────────┘
                                                               │
                                         ┌─────────────────────▼─────────────────────┐
                                         │          Onboard Micro-NPU Node           │
                                         │     Local Random Forest Inferencing       │
                                         │            (1.8ms Latency)                │
                                         └─────────────────────┬─────────────────────┘
                                                               │
                          ┌────────────────────────────────────┼────────────────────────────────────┐
                          │                                    │                                    │
            ┌─────────────▼─────────────┐        ┌─────────────▼─────────────┐        ┌─────────────▼─────────────┐
            │   3D Digital Twin Model   │        │   SHAP / LIME Explainer   │        │   Aero AI Voice Chatbox   │
            │  Subsystem Heatmaps & Risk│        │  Local Feature Attributions│        │  Audio STT / TTS Advisories│
            └─────────────┬─────────────┘        └─────────────┬─────────────┘        └─────────────┬─────────────┘
                          │                                    │                                    │
                          └────────────────────────────────────┼────────────────────────────────────┘
                                                               │
                                         ┌─────────────────────▼─────────────────────┐
                                         │       Unified Flight Safety Console       │
                                         │           http://localhost:3000           │
                                         └───────────────────────────────────────────┘
```

---

## 📂 Complete Project Folder Structure

```
aerosentinel/
├── docker-compose.yml              # Root Docker Compose orchestrator
├── render.yaml                     # Render.com Python backend deployment spec
├── README.md                       # Comprehensive system documentation
├── .gitignore                      # Git exclusion rules
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD automated pipeline
├── backend/                        # Python FastAPI Machine Learning Server
│   ├── Dockerfile                  # Backend Docker container build
│   ├── requirements.txt            # Python dependencies (fastapi, scikit-learn, shap, lime, reportlab)
│   └── app/
│       ├── __init__.py
│       ├── main.py                 # FastAPI application, REST APIs, & 1Hz WebSocket simulator
│       ├── auth.py                 # JWT token creation, password hashing, user DB
│       ├── model.py                # Synthetic flight data generation & Random Forest classifiers
│       ├── explain.py              # SHAP TreeExplainer & LIME local surrogate algorithms
│       └── reports.py              # Branded PDF, Excel, and CSV report export builders
└── frontend/                       # Next.js 15 React 19 Frontend Web Console
    ├── Dockerfile                  # Frontend Docker container build
    ├── next.config.ts              # API proxy rewrites to localhost:8000
    ├── package.json                # Dependencies (R3F, Framer Motion, Leaflet, Recharts, Lucide)
    ├── tsconfig.json               # TypeScript configurations
    ├── vercel.json                 # Vercel deployment and security header specs
    ├── components/
    │   ├── Navbar.tsx              # Glassmorphic header with live telemetry indicator
    │   ├── Footer.tsx              # Global aerospace footer with compliance disclosures
    │   ├── Aircraft3D.tsx          # 3D interactive wireframe digital twin (R3F & Three.js)
    │   ├── ChatBot.tsx             # Floating Aero AI Assistant with STT/TTS voice support
    │   └── LiveMapContainer.tsx    # Leaflet map container with CartoDB dark tiles
    └── app/
        ├── layout.tsx              # Root layout wrapper with radial glow backgrounds
        ├── page.tsx                # Hero landing page with animated radar sweeps
        ├── dashboard/page.tsx      # Main flight monitor, 3D viewer, & fault test bench
        ├── prediction/page.tsx     # CSV upload sheet intake & 15 manual parameter sliders
        ├── explainability/page.tsx # SHAP force plots, LIME rules, & Decision Tree pathways
        ├── edge-ai/page.tsx        # Edge NPU vs Satellite Cloud latency benchmarks
        ├── live-map/page.tsx       # Flight vector tracking & emergency airfield diversions
        ├── auth/page.tsx           # Pilot & Admin secure logon forms
        └── admin/page.tsx          # Threat logs, user registry, & Confusion Matrix cards
```

---

## 📦 System Modules & Key Features

### 1. 3D Digital Twin & Flight Cockpit (`/dashboard`)
- **Interactive Wireframe Aircraft**: Built using React Three Fiber and Three.js. Allows rotation and zooming while inspecting components (Engines, Wings, Landing Gear, Cockpit, Stabilizers).
- **Subsystem Degradation Heatmaps**: Components dynamically change colors based on failure probability (**Green**: Nominal, **Yellow**: Warning, **Orange**: Critical, **Red**: Emergency).
- **Diagnostic Test Bench**: Interactive anomaly injector allowing instant simulation of Propulsion Overheating, Hydraulic Pressure Drops, or Electrical Voltage Loss.

### 2. Predictive Diagnostic Terminal (`/prediction`)
- **Flight Sheet Intake**: Upload raw CSV/XLSX flight logs to populate sensor inputs.
- **15 Parameter Override Matrix**: Interactive glassmorphic sliders for Engine Temp, RPM, Oil Pressure, Hydraulic Pressure, Vibration, Fuel Flow, Bus Voltage, Altitude, Airspeed, and Cabin Pressure.

### 3. Explainable AI Audit Panel (`/explainability`)
- **SHAP Feature Importance**: Horizontal bar charts displaying positive (risk-increasing) and negative (system-stabilizing) Shapley values.
- **LIME Local Surrogate Rules**: Boundary rule checklists defining exact threshold conditions (e.g. `Engine Temp > 120 °C`).
- **Decision Tree Pathway**: Step-by-step logic tree showing which decision nodes fired to produce a safety rating.

### 4. Edge AI vs Cloud Benchmark (`/edge-ai`)
- **Avionic Hardware Matrix**: Comparison showing local NPU execution (<1.8ms latency, 0 SATCOM bandwidth cost) vs cloud satellite routing.

### 5. Live Navigation & Diversion Map (`/live-map`)
- **CartoDB Dark Matter Mapping**: Leaflet map tracking real-time GPS coordinates, heading angles, thunderstorm warning cells, and nearest emergency diversion airfields.

### 6. Aero AI Assistant Chatbox (Floating Orb)
- **Voice Commands**: Integrated Web Speech API for Speech-to-Text input and Text-to-Speech synthesis.
- **Avionics Knowledge Base**: Answers questions regarding telemetry anomalies, SHAP metrics, and safety protocols.

### 7. System Admin & Validation Deck (`/admin`)
- **User Registry**: Manage pilot and flight inspector credentials.
- **Event Logs**: Real-time event log tracking websocket connections and anomaly injections.
- **Model Validation Cards**: View confusion matrices, precision/recall, and ROC AUC indexes.

### 8. Audit Report Exporter
- Download formal PDF reports (via ReportLab), color-styled Excel workbooks (via openpyxl), and CSV logs.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, Lucide Icons, Recharts, Leaflet.
- **Backend**: Python FastAPI, Uvicorn, Scikit-learn, Pandas, NumPy, SHAP, LIME, ReportLab, OpenPyXL, WebSockets, JWT Authentication.
- **DevOps**: Docker, Docker Compose, Vercel, Render.com, GitHub Actions CI/CD.

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/mouni-16102006/Explainable-Edge-AI-Aircraft-Safety.git
cd Explainable-Edge-AI-Aircraft-Safety

# Launch both backend APIs and frontend UI in a single command
docker-compose up --build
```

Access the unified portal:
- **Unified Application**: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Login Credentials

- **Pilot Deck**: `pilot@aerosentinel.com` | Password: `pilot123`
- **Admin Deck**: `admin@aerosentinel.com` | Password: `admin123`

---

## 📑 License

Federal Aviation Class 1 UAS Safety Specification. Proprietary License.
