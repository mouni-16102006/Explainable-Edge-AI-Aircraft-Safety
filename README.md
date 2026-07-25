# ✈️ AeroSentinel
### Explainable Edge AI Decision Support for Real-Time Aircraft Safety

AeroSentinel is a world-class Explainable Edge AI Decision Support platform designed for next-generation aircraft safety monitoring and predictive avionic telemetry maintenance. It identifies component fatigue and failures before they become critical, explaining the underlying AI reasoning through SHAP and LIME algorithms.

---

## 🌟 Key Features

1. **3D Interactive Digital Twin**: Real-time wireframe holographic aircraft built using React Three Fiber (R3F) and Three.js. Inspect components (Engines, Wings, Landing Gear, Cockpit) with live degradation highlights (Green, Yellow, Orange, Red).
2. **Predictive Edge Telemetry**: Multi-output ensemble classifier predicting failures across 6 subsystems (Propulsion, Hydraulics, Electrical Bus, Fuel System, Landing Gear, Flight Controls).
3. **Explainable AI (SHAP & LIME)**: Transparent local feature attributions showing exactly *why* a failure was predicted, including decision tree rule paths and feature force plots.
4. **Interactive AI Assistant ("Aero")**: Animated floating AI orb with soundwave blinking, voice support (Speech-To-Text / Text-To-Speech), answering technical questions on avionic sensors and SHAP explainability.
5. **Live Navigation Map**: Dark-themed CARTO Leaflet map tracking aircraft coordinates, emergency airports, diversion runways, and severe weather warning cells.
6. **Dynamic Report Generator**: Download official PDF safety audit reports, color-styled Excel workbooks, and CSV logs.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, Lucide Icons, Recharts, Leaflet.
- **Backend**: Python FastAPI, Uvicorn, Scikit-learn, Pandas, NumPy, SHAP, LIME, ReportLab, OpenPyXL, WebSockets, JWT Authentication.
- **DevOps**: Docker, Docker Compose, Vercel, Render.com, GitHub Actions CI/CD.

---

## 🚀 Quick Start (Local Development)

### Option 1: Running Backend & Frontend via Docker Compose (Recommended)

```bash
# Navigate to the project folder
cd C:\Users\Administrator\Music\aerospace\aerosentinel

# Launch both Python FastAPI backend (port 8000) and Next.js frontend (port 3000)
docker-compose up --build
```

Access the application:
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend FastAPI API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Running Services Separately

#### 1. Start Python FastAPI Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start uvicorn server
uvicorn app.main:app --reload --port 8000
```

#### 2. Start Next.js Frontend
```bash
cd frontend

# Install npm packages
npm install --legacy-peer-deps

# Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

- **Pilot Deck**: `pilot@aerosentinel.com` | Password: `pilot123`
- **Admin Deck**: `admin@aerosentinel.com` | Password: `admin123`

---

## 📑 License

Federal Aviation Class 1 UAS Safety Specification. Proprietary License.
