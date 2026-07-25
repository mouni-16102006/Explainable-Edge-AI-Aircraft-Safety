import asyncio
import json
import random
import math
from typing import Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

from app.auth import (
    USERS_DB, verify_password, get_password_hash, create_access_token,
    get_current_user
)
from app.model import FEATURE_NAMES, LABEL_NAMES, predict_safety, models
from app.explain import calculate_shap_values, calculate_lime_explanation
from app.reports import generate_pdf_report, generate_excel_report, generate_csv_report

app = FastAPI(
    title="AeroSentinel Edge AI Backend",
    description="Explainable Edge AI Aircraft Safety Decision Support API",
    version="1.0.0"
)

# CORS Configuration for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request validation classes
class LoginRequest(BaseModel):
    username: str
    password: str

class SignupRequest(BaseModel):
    username: str
    password: str
    name: str
    role: str = "pilot"

class PredictionRequest(BaseModel):
    sensors: Dict[str, float]

class ChatRequest(BaseModel):
    message: str

# ----------------- AUTH API -----------------

@app.post("/api/auth/login")
async def login(credentials: LoginRequest):
    user = USERS_DB.get(credentials.username)
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_access_token(data={"sub": user["username"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "name": user["name"],
            "role": user["role"],
            "avatar": user["avatar"]
        }
    }

@app.post("/api/auth/signup")
async def signup(user_data: SignupRequest):
    if user_data.username in USERS_DB:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    USERS_DB[user_data.username] = {
        "username": user_data.username,
        "hashed_password": get_password_hash(user_data.password),
        "role": user_data.role,
        "name": user_data.name,
        "avatar": f"/avatars/avatar_{random.randint(1, 4)}.jpg"
    }
    
    token = create_access_token(data={"sub": user_data.username})
    user = USERS_DB[user_data.username]
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "name": user["name"],
            "role": user["role"],
            "avatar": user["avatar"]
        }
    }

# ----------------- PREDICTION & XAI API -----------------

@app.post("/api/predict")
async def predict(data: PredictionRequest):
    for feat in FEATURE_NAMES:
        if feat not in data.sensors:
            nominals = {
                "engine_temp": 95.0, "oil_pressure": 55.0, "hydraulic_pressure": 3000.0,
                "fuel_flow": 2500.0, "fuel_pressure": 40.0, "vibration": 3.5, "rpm": 8500.0,
                "voltage": 28.0, "current": 120.0, "battery_soc": 90.0, "altitude": 20000.0,
                "speed": 380.0, "cabin_pressure": 11.5, "cabin_temp": 22.0, "wind_speed": 15.0
            }
            data.sensors[feat] = nominals[feat]
            
    res = predict_safety(data.sensors)
    return res

@app.post("/api/explain/shap")
async def get_shap(data: PredictionRequest, target: str = Query(..., description="Target system label to explain")):
    if target not in LABEL_NAMES:
        raise HTTPException(status_code=400, detail=f"Target must be one of {LABEL_NAMES}")
    shap_data = calculate_shap_values(data.sensors, target)
    return shap_data

@app.post("/api/explain/lime")
async def get_lime(data: PredictionRequest, target: str = Query(..., description="Target system label to explain")):
    if target not in LABEL_NAMES:
        raise HTTPException(status_code=400, detail=f"Target must be one of {LABEL_NAMES}")
    lime_data = calculate_lime_explanation(data.sensors, target)
    return lime_data

# ----------------- EXPORT REPORTS -----------------

class ReportDownloadRequest(BaseModel):
    sensors: Dict[str, float]
    predictions: Dict[str, Any]
    format: str

@app.post("/api/reports/download")
async def download_report(req: ReportDownloadRequest):
    fmt = req.format.lower()
    
    if fmt == "pdf":
        pdf_data = generate_pdf_report(req.sensors, req.predictions)
        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=aerosentinel_safety_audit.pdf"}
        )
    elif fmt == "xlsx":
        xlsx_data = generate_excel_report(req.sensors, req.predictions)
        return Response(
            content=xlsx_data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=aerosentinel_safety_audit.xlsx"}
        )
    elif fmt == "csv":
        csv_data = generate_csv_report(req.sensors, req.predictions)
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=aerosentinel_safety_audit.csv"}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: pdf, xlsx, csv")

# ----------------- AEROSENTINEL AI ASSISTANT CHATBOT -----------------

@app.post("/api/chatbot/query")
async def chat_query(req: ChatRequest):
    msg = req.message.lower().strip()
    
    # 1. Greeting Handlers
    if any(k in msg for k in ["hello", "hi", "hey", "greetings", "start"]):
        response = (
            "Welcome to AeroSentinel AI Assistant! ✈️\n\n"
            "I'm here to help you understand the AeroSentinel platform, aircraft safety, Edge AI, "
            "Explainable AI, predictive maintenance, system features, and aviation technologies.\n\n"
            "How can I assist you today?"
        )
    
    # 2. What is AeroSentinel?
    elif "what is aerosentinel" in msg or ("about" in msg and "project" in msg):
        response = (
            "AeroSentinel is an intelligent aircraft safety decision support platform that combines "
            "Edge Artificial Intelligence (Edge AI), Explainable AI (XAI), and real-time aircraft telemetry.\n\n"
            "• Analyzes live sensor data (temperatures, pressures, vibration, voltage, RPM).\n"
            "• Predicts component failures before they become dangerous.\n"
            "• Explains WHY predictions were made using SHAP and LIME.\n"
            "• Operates on low-latency onboard edge computing hardware for zero-delay offline safety decision support."
        )

    # 3. How does Edge AI work / Benefits?
    elif "edge ai" in msg or "edge computing" in msg:
        response = (
            "Edge AI processes telemetry predictions locally on physical avionic micro-nodes rather than routing over satellites to remote clouds.\n\n"
            "Key Advantages:\n"
            "• Low Latency: Sub-2ms decision loops vs 350-800ms cloud lag.\n"
            "• Offline Autonomy: Continues working 100% even if satellite links drop.\n"
            "• Bandwidth Savings: Eliminates expensive streaming of raw 100Hz sensor feeds over SATCOM.\n"
            "• Data Security: Keeps flight telemetry contained onboard."
        )

    # 4. What is Explainable AI (XAI) / SHAP / LIME?
    elif "explainable ai" in msg or "shap" in msg or "lime" in msg or "xai" in msg:
        response = (
            "Explainable AI (XAI) converts black-box neural networks and tree ensembles into transparent, auditable decision paths.\n\n"
            "AeroSentinel uses two primary XAI frameworks:\n"
            "• SHAP (Shapley Additive exPlanations): Calculates mathematical Shapley contribution weights showing which sensors increased or decreased total failure risk.\n"
            "• LIME (Local Interpretable Model-agnostic Explanations): Builds localized linear surrogate models creating human-readable rule thresholds (e.g. Engine Temp > 120°C)."
        )

    # 5. Predictive Maintenance & Anomaly Detection
    elif "predictive maintenance" in msg or "anomaly detection" in msg or "risk" in msg:
        response = (
            "Predictive maintenance uses machine learning classifiers to estimate mechanical degradation before physical breakage.\n\n"
            "AeroSentinel constantly monitors 15 sensor variables (engine core heat, oil pressure, hydraulic line pressure, wing vibration, electrical bus voltage).\n"
            "When sensor correlations drift from nominal envelopes, the system flags Warning, Critical, or Emergency risk ratings and recommends specific maintenance actions."
        )

    # 6. Deep Learning & ML Models (CNN, LSTM, Transformers, Random Forest)
    elif any(k in msg for k in ["model", "algorithm", "cnn", "lstm", "transformer", "scikit", "random forest", "xgboost"]):
        response = (
            "AeroSentinel leverages an ensemble machine learning architecture for multi-output fault classification:\n\n"
            "• Random Forest & Gradient Boosting (scikit-learn/XGBoost): Primary high-speed tabular classifiers evaluating 6 subsystem failure categories.\n"
            "• LSTM & Transformers: Time-series sequence forecasting modeling temporal degradation trends over flight hours.\n"
            "• Convolutional Neural Networks (CNN): Frequency spectrum analysis of vibration accelerometers for structural fatigue detection."
        )

    # 7. Dashboard & System Features
    elif "dashboard" in msg or "feature" in msg or "3d" in msg or "map" in msg:
        response = (
            "AeroSentinel provides an all-in-one safety monitoring console:\n\n"
            "• 3D Interactive Digital Twin: Rotate and zoom a wireframe aircraft model highlighting faulty subsystems (Engine, Wings, Landing Gear, Cockpit) in Green/Yellow/Orange/Red.\n"
            "• Diagnostic Test Bench: Inject manual telemetry anomalies to test safety alerts.\n"
            "• Live Navigation Map: Leaflet CARTO dark tile tracking of flight vectors, weather cells, and emergency diversion runways.\n"
            "• PDF / Excel Report Exporter: Compile formal safety audit documents."
        )

    # 8. Technologies Used & Architecture
    elif "tech" in msg or "stack" in msg or "architecture" in msg or "python" in msg or "next" in msg:
        response = (
            "AeroSentinel Tech Stack & Architecture:\n\n"
            "• Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Three.js (R3F), Leaflet, Recharts.\n"
            "• Backend: Python FastAPI, Uvicorn, WebSockets, JWT Auth, ReportLab, openpyxl.\n"
            "• AI & ML: Scikit-learn, XGBoost, SHAP, LIME, TensorFlow/PyTorch.\n"
            "• DevOps: Docker, Docker Compose, Render, Vercel, GitHub Actions CI/CD."
        )

    # 9. System Workflow
    elif "workflow" in msg or "process" in msg or "step" in msg:
        response = (
            "AeroSentinel 9-Step Operational Workflow:\n\n"
            "1. Receive aircraft telemetry via ARINC data bus.\n"
            "2. Validate incoming sensor ranges.\n"
            "3. Process inputs using onboard Edge AI models.\n"
            "4. Detect telemetry anomalies.\n"
            "5. Predict subsystem failure probabilities.\n"
            "6. Compute SHAP & LIME explainable explanations.\n"
            "7. Display pilot decision support advisories.\n"
            "8. Trigger visual/audio cockpit alerts if risk exceeds margins.\n"
            "9. Log results into audit PDF/Excel reports."
        )

    # 10. Aircraft Subsystem specific questions (Engine, Hydraulics, Electrical, Fuel, Landing Gear)
    elif "engine" in msg or "temp" in msg or "rpm" in msg:
        response = (
            "Engine core failures are predicted when core temperature exceeds 120°C accompanied by oil pressure drops below 38 PSI or over-revving RPM (>10,500). "
            "SHAP attributes thermal stress weights to notify maintenance teams."
        )
    elif "hydraulic" in msg or "flaps" in msg:
        response = (
            "Hydraulic line leaks cause system pressure drops below 2,500 PSI. Combined with high airframe vibration (>5.5 mm/s), "
            "this flags hydraulic and flight control surface degradation."
        )

    # 11. Out-of-Domain Question Handler
    elif any(k in msg for k in ["football", "movie", "recipe", "crypto", "joke", "weather in tokio"]):
        response = (
            "I am AeroSentinel AI Assistant, specialized in aviation safety, Edge AI, and flight telemetry diagnostics. "
            "While I primary focus on aerospace systems, I can help answer any questions regarding aircraft safety, sensor anomalies, or SHAP explainability!"
        )

    # 12. General Unclear Question Fallback
    else:
        response = (
            "I'm not completely sure what you mean. Could you please provide a little more detail about which aircraft subsystem, "
            "Explainable AI feature (SHAP/LIME), or Edge AI module you'd like to explore?"
        )
        
    return {"response": response, "timestamp": datetime.now().isoformat()}

# ----------------- REAL-TIME WEBSOCKET SIMULATOR -----------------

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    
    tick = 0
    altitude = 12000.0
    speed = 340.0
    heading = 270.0
    lat = 37.7749
    lng = -122.4194
    anomaly_injected = None
    
    try:
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
                event = json.loads(data)
                if event.get("type") == "inject_anomaly":
                    anomaly_injected = event.get("subsystem")
                elif event.get("type") == "reset_anomaly":
                    anomaly_injected = None
            except asyncio.TimeoutError:
                pass
            
            tick += 1
            
            engine_temp = 95.0 + math.sin(tick / 10.0) * 2.0
            oil_pressure = 55.0 + math.cos(tick / 8.0) * 1.5
            hydraulic_pressure = 3000.0 + math.sin(tick / 5.0) * 30.0
            fuel_flow = 2500.0 + math.sin(tick / 15.0) * 50.0
            fuel_pressure = 40.0 + math.cos(tick / 10.0) * 1.0
            vibration = 3.2 + abs(math.sin(tick / 4.0)) * 0.5
            rpm = 8500.0 + math.sin(tick / 6.0) * 100.0
            voltage = 28.0 + math.sin(tick / 20.0) * 0.2
            current = 120.0 + math.cos(tick / 12.0) * 4.0
            battery_soc = max(10.0, 95.0 - tick * 0.01)
            cabin_pressure = 11.5 + math.sin(tick / 30.0) * 0.1
            cabin_temp = 22.0 + math.cos(tick / 25.0) * 0.5
            wind_speed = 15.0 + abs(math.sin(tick / 5.0)) * 5.0
            
            lat += 0.0005 * math.cos(math.radians(heading))
            lng += 0.0005 * math.sin(math.radians(heading))
            altitude += math.sin(tick / 50.0) * 10.0
            speed += math.cos(tick / 40.0) * 2.0
            
            if anomaly_injected == "engine":
                engine_temp = 128.5 + (tick % 10) * 1.5
                oil_pressure = 32.0 - (tick % 5) * 1.0
                rpm = 10800.0 + random.randint(-100, 100)
            elif anomaly_injected == "hydraulics":
                hydraulic_pressure = 2100.0 - (tick % 10) * 20.0
                vibration = 6.8 + (tick % 5) * 0.4
            elif anomaly_injected == "electrical":
                voltage = 23.8 - (tick % 10) * 0.2
                current = 175.0 + (tick % 5) * 5.0
                battery_soc = 28.0 - (tick % 10) * 1.5
            elif anomaly_injected == "fuel":
                fuel_flow = 4100.0 + (tick % 10) * 40.0
                fuel_pressure = 24.5 - (tick % 5) * 0.8
            elif anomaly_injected == "landing_gear":
                vibration = 8.2 + (tick % 10) * 0.3
                speed = 280.0
                altitude = 4500.0
            elif anomaly_injected == "flight_controls":
                wind_speed = 68.0 + (tick % 10) * 2.0
                vibration = 7.1 + (tick % 5) * 0.5
                hydraulic_pressure = 2350.0 - (tick % 5) * 15.0
                
            sensor_payload = {
                "engine_temp": float(engine_temp),
                "oil_pressure": float(oil_pressure),
                "hydraulic_pressure": float(hydraulic_pressure),
                "fuel_flow": float(fuel_flow),
                "fuel_pressure": float(fuel_pressure),
                "vibration": float(vibration),
                "rpm": float(rpm),
                "voltage": float(voltage),
                "current": float(current),
                "battery_soc": float(battery_soc),
                "altitude": float(altitude),
                "speed": float(speed),
                "cabin_pressure": float(cabin_pressure),
                "cabin_temp": float(cabin_temp),
                "wind_speed": float(wind_speed),
                "gps_lat": float(lat),
                "gps_lng": float(lng),
                "heading": float(heading),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            prediction_res = predict_safety(sensor_payload)
            
            broadcast_frame = {
                "sensors": sensor_payload,
                "prediction": prediction_res,
                "anomaly_injected": anomaly_injected
            }
            
            await websocket.send_json(broadcast_frame)
            await asyncio.sleep(1.0)
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Error in telemetry websocket: {e}")
