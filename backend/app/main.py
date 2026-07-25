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
    get_current_user, create_access_token
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
    allow_origins=["*"], # In development, allow all. Change to specific domain for production
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
    # Validate features
    for feat in FEATURE_NAMES:
        if feat not in data.sensors:
            # fill missing values with nominals
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
    format: str # "pdf", "xlsx", "csv"

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

# ----------------- CHATBOT "AERO" -----------------

@app.post("/api/chatbot/query")
async def chat_query(req: ChatRequest):
    msg = req.message.lower()
    
    # Simple semantic rule-based response parser for aviation safety, explainable AI, and edge sensors
    if "hello" in msg or "hi" in msg:
        response = (
            "Hello Captain! I'm Aero, your onboard Edge AI Safety assistant. "
            "I monitor flight telemetry in real-time. Ask me about system faults, sensors, or AI confidence!"
        )
    elif "engine" in msg and ("fail" in msg or "fault" in msg or "hot" in msg):
        response = (
            "Engine faults are usually predicted when engine core temperature exceeds 120°C and oil pressure drops below 40 PSI. "
            "If RPM exceeds 10,500 under load, it creates mechanical fatigue. Our Random Forest model detects these anomalies "
            "within milliseconds on the avionics edge hardware."
        )
    elif "hydraulic" in msg or "flight control" in msg:
        response = (
            "Hydraulic line leaks cause pressure drops below 2,500 PSI. Combined with high airframe vibration, "
            "this leads to flight control stiffness or landing gear lockups. We monitor hydraulic pressure and wing "
            "accel sensors at 1Hz."
        )
    elif "shap" in msg or "explain" in msg or "lime" in msg:
        response = (
            "SHAP (Shapley Additive exPlanations) attributes a risk percentage contribution to each sensor. "
            "LIME builds localized surrogate linear models to create human-readable safety envelopes (e.g. 'voltage < 24.5V'). "
            "Together, they make our black-box ML models completely auditable by flight pilots and safety authorities."
        )
    elif "edge" in msg or "latency" in msg:
        response = (
            "Edge AI processes telemetry directly on the aircraft's avionic computers. This reduces data latency from 350ms "
            "(cloud routing) to less than 2ms, bypasses satellite bandwidth constraints, guarantees pilot privacy, "
            "and ensures safety operations continue even when offline."
        )
    elif "sensor" in msg or "telemetry" in msg:
        response = (
            "I actively monitor 15 critical flight sensors: thermal sensors (engine/cabin), pressure transceivers "
            "(oil/fuel/cabin), electrical (voltage/current/soc), structural accelerometers (vibration), and flight "
            "envelope readings (speed, altitude, wind speed)."
        )
    elif "safety" in msg or "emergency" in msg:
        response = (
            "In case of Warning, monitor anomalies. Critical states require backup cross-checks. In an Emergency, "
            "AeroSentinel initiates pilot voice alerts, enables redundant primary flight computers, and calculates "
            "emergency route paths to the nearest airfields."
        )
    else:
        response = (
            "That is an interesting question, Captain! As an aviation safety bot, I can explain aircraft telemetry anomalies, "
            "predictive maintenance algorithms, SHAP/LIME explainability, and Edge AI flight computer systems. "
            "Could you specify which aircraft subsystem (Engine, Electrical, Fuel, Hydraulics) you're asking about?"
        )
        
    return {"response": response, "timestamp": datetime.now().isoformat()}

# ----------------- REAL-TIME WEBSOCKET SIMULATOR -----------------

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """
    Simulates a live flight telemetry feed.
    Pushes 15 sensors and AI predictions at 1Hz, periodically injecting failures.
    """
    await websocket.accept()
    
    # Simulation parameters
    tick = 0
    altitude = 12000.0 # ft
    speed = 340.0 # knots
    heading = 270.0 # degrees
    lat = 37.7749  # Start from SFO
    lng = -122.4194
    anomaly_injected = None
    
    try:
        while True:
            # Parse possible incoming manual anomaly injections from client
            # (Non-blocking check if client sends data)
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
                event = json.loads(data)
                if event.get("type") == "inject_anomaly":
                    anomaly_injected = event.get("subsystem") # e.g. "engine", "hydraulics"
                    print(f"Injecting anomaly into subsystem: {anomaly_injected}")
                elif event.get("type") == "reset_anomaly":
                    anomaly_injected = None
                    print("Resetting telemetry to nominal state")
            except asyncio.TimeoutError:
                pass # No messages received from client, continue simulation
            
            tick += 1
            
            # Base nominal values + minor fluctuation
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
            
            # Simulated GPS update (flying westward)
            lat += 0.0005 * math.cos(math.radians(heading))
            lng += 0.0005 * math.sin(math.radians(heading))
            altitude += math.sin(tick / 50.0) * 10.0 # minor altitude adjustments
            speed += math.cos(tick / 40.0) * 2.0
            
            # Apply injected anomalies
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
            
            # Predict safety
            prediction_res = predict_safety(sensor_payload)
            
            # Combine into single broadcast frame
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
