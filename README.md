# ✈️ AeroSentinel
### Explainable Edge AI Decision Support for Real-Time Aircraft Safety

AeroSentinel is a world-class Explainable Edge AI Decision Support platform designed for next-generation aircraft safety monitoring and predictive avionic telemetry maintenance. It identifies component fatigue and failures before they become critical, explaining the underlying AI reasoning through SHAP and LIME algorithms.

---

## 🌐 Unified Application Host Link

### 🔗 [http://localhost:3000](http://localhost:3000)

> **Note**: `http://localhost:3000` serves as the single unified web application URL for both frontend cock-pit controls and backend prediction APIs (proxied automatically via Next.js API rewrites).

---

## 🤖 Aero AI Assistant Chatbox

AeroSentinel includes **Aero**, a floating, interactive AI flight safety assistant orb.

- **Animated Hologram Orb**: Features breathing glow animations, eye blinking, and speaking soundwave effects.
- **Voice Commands (STT & TTS)**: Native Speech-to-Text microphone input and Text-to-Speech audio response synthesis.
- **Avionics Safety Q&A**: Answers technical questions regarding aircraft sensors, SHAP/LIME explanation weights, and edge safety protocols.

---

## 🌟 Key Features

1. **3D Interactive Digital Twin**: Real-time wireframe holographic aircraft built using React Three Fiber (R3F) and Three.js. Inspect components (Engines, Wings, Landing Gear, Cockpit) with live degradation highlights (Green, Yellow, Orange, Red).
2. **Predictive Edge Telemetry**: Multi-output ensemble classifier predicting failures across 6 subsystems (Propulsion, Hydraulics, Electrical Bus, Fuel System, Landing Gear, Flight Controls).
3. **Explainable AI (SHAP & LIME)**: Transparent local feature attributions showing exactly *why* a failure was predicted, including decision tree rule paths and feature force plots.
4. **Live Navigation Map**: Dark-themed CARTO Leaflet map tracking aircraft coordinates, emergency airports, diversion runways, and severe weather warning cells.
5. **Dynamic Report Generator**: Download official PDF safety audit reports, color-styled Excel workbooks, and CSV logs.

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
