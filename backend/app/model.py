import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Features list
FEATURE_NAMES = [
    "engine_temp", "oil_pressure", "hydraulic_pressure", "fuel_flow", 
    "fuel_pressure", "vibration", "rpm", "voltage", "current", 
    "battery_soc", "altitude", "speed", "cabin_pressure", "cabin_temp", 
    "wind_speed"
]

# Labels (Components that can fail)
LABEL_NAMES = [
    "engine_fault", "hydraulic_fault", "electrical_fault", 
    "fuel_fault", "landing_gear_fault", "flight_control_fault"
]

MODEL_PATH = "aircraft_safety_model.pkl"
DATASET_PATH = "mock_flight_data.csv"

def generate_synthetic_data(num_samples: int = 1500) -> pd.DataFrame:
    """Generates synthetic aircraft flight data with logical correlation for ML training."""
    np.random.seed(42)
    
    # Base distributions
    engine_temp = np.random.normal(95, 15, num_samples)      # Normal: 70-120 C
    oil_pressure = np.random.normal(55, 10, num_samples)     # Normal: 40-70 PSI
    hydraulic_pressure = np.random.normal(3000, 200, num_samples) # Normal: 2600-3400 PSI
    fuel_flow = np.random.normal(2500, 500, num_samples)     # Normal: 1500-3500 kg/h
    fuel_pressure = np.random.normal(40, 8, num_samples)      # Normal: 30-50 PSI
    vibration = np.random.normal(3.5, 1.5, num_samples)      # Normal: 1.0-6.0 mm/s
    rpm = np.random.normal(8500, 1000, num_samples)          # Normal: 7000-10000 RPM
    voltage = np.random.normal(28, 1.5, num_samples)         # Normal: 26-30 V
    current = np.random.normal(120, 20, num_samples)         # Normal: 90-150 A
    battery_soc = np.random.uniform(70, 100, num_samples)    # Normal: 70-100%
    altitude = np.random.uniform(5000, 38000, num_samples)   # Normal: 5000-38000 ft
    speed = np.random.uniform(250, 520, num_samples)         # Normal: 250-520 knots
    cabin_pressure = np.random.normal(11.5, 0.8, num_samples) # Normal: 10-13 PSI
    cabin_temp = np.random.normal(22, 2, num_samples)        # Normal: 18-26 C
    wind_speed = np.random.exponential(15, num_samples)      # Normal: 0-50 knots
    
    # Create DataFrame
    df = pd.DataFrame({
        "engine_temp": engine_temp, "oil_pressure": oil_pressure, 
        "hydraulic_pressure": hydraulic_pressure, "fuel_flow": fuel_flow,
        "fuel_pressure": fuel_pressure, "vibration": vibration, "rpm": rpm, 
        "voltage": voltage, "current": current, "battery_soc": battery_soc, 
        "altitude": altitude, "speed": speed, "cabin_pressure": cabin_pressure, 
        "cabin_temp": cabin_temp, "wind_speed": wind_speed
    })
    
    # Introduce anomalies & failures based on rules
    engine_fault = []
    hydraulic_fault = []
    electrical_fault = []
    fuel_fault = []
    landing_gear_fault = []
    flight_control_fault = []
    
    for i in range(num_samples):
        # 1. Engine fault logic: high temperature + low oil pressure or excessive RPM
        e_fail = int(df.at[i, "engine_temp"] > 125 and df.at[i, "oil_pressure"] < 38)
        e_fail = e_fail or int(df.at[i, "rpm"] > 10500 and df.at[i, "engine_temp"] > 115)
        e_fail = e_fail or int(np.random.rand() < 0.02) # random noise
        engine_fault.append(e_fail)
        
        # 2. Hydraulic fault logic: low hydraulic pressure + high vibration
        h_fail = int(df.at[i, "hydraulic_pressure"] < 2500 and df.at[i, "vibration"] > 5.5)
        h_fail = h_fail or int(df.at[i, "hydraulic_pressure"] < 2200)
        h_fail = h_fail or int(np.random.rand() < 0.02)
        hydraulic_fault.append(h_fail)
        
        # 3. Electrical fault logic: over/under voltage + high current or low battery SoC
        el_fail = int((df.at[i, "voltage"] < 24.5 or df.at[i, "voltage"] > 31.5) and df.at[i, "current"] > 160)
        el_fail = el_fail or int(df.at[i, "battery_soc"] < 35)
        el_fail = el_fail or int(np.random.rand() < 0.02)
        electrical_fault.append(el_fail)
        
        # 4. Fuel fault logic: low fuel pressure + high fuel flow (leak) or critical fuel flow drop
        f_fail = int(df.at[i, "fuel_flow"] > 3800 and df.at[i, "fuel_pressure"] < 28)
        f_fail = f_fail or int(df.at[i, "fuel_pressure"] < 22)
        f_fail = f_fail or int(np.random.rand() < 0.01)
        fuel_fault.append(f_fail)
        
        # 5. Landing gear fault logic: high vibration at lower speeds/altitudes (attempted deployment)
        lg_fail = int(df.at[i, "altitude"] < 8000 and df.at[i, "vibration"] > 7.5 and df.at[i, "speed"] < 300)
        lg_fail = lg_fail or int(np.random.rand() < 0.01)
        landing_gear_fault.append(lg_fail)
        
        # 6. Flight control fault logic: extreme wind speed + high airframe vibration + low hydraulic pressure
        fc_fail = int(df.at[i, "wind_speed"] > 55 and df.at[i, "vibration"] > 6.0)
        fc_fail = fc_fail or int(df.at[i, "hydraulic_pressure"] < 2400 and df.at[i, "vibration"] > 6.5)
        fc_fail = fc_fail or int(np.random.rand() < 0.01)
        flight_control_fault.append(fc_fail)
        
    df["engine_fault"] = engine_fault
    df["hydraulic_fault"] = hydraulic_fault
    df["electrical_fault"] = electrical_fault
    df["fuel_fault"] = fuel_fault
    df["landing_gear_fault"] = landing_gear_fault
    df["flight_control_fault"] = flight_control_fault
    
    return df

def train_and_save_models():
    """Trains a multi-label Random Forest classifier and caches it."""
    print("Generating synthetic flight dataset...")
    df = generate_synthetic_data()
    df.to_csv(DATASET_PATH, index=False)
    
    X = df[FEATURE_NAMES]
    models = {}
    
    print("Training component-specific failure classifiers...")
    for label in LABEL_NAMES:
        y = df[label]
        # Train random forest with fixed depth for explainability
        clf = RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42)
        clf.fit(X, y)
        models[label] = clf
        
    # Save the models dictionary
    joblib.dump(models, MODEL_PATH)
    print("Models trained and cached successfully.")

def load_models():
    """Loads the trained Random Forest models from file. Trains them if missing."""
    if not os.path.exists(MODEL_PATH):
        train_and_save_models()
    return joblib.load(MODEL_PATH)

# Auto-train models on load if missing
try:
    models = load_models()
except Exception as e:
    print(f"Error loading models, retraining: {e}")
    train_and_save_models()
    models = load_models()

def predict_safety(sensor_input: dict) -> dict:
    """
    Takes sensor reading dictionary and outputs probabilities for each system failure.
    Also determines safety level (Normal, Warning, Critical, Emergency).
    """
    # Parse inputs to order
    x_input = np.array([[sensor_input.get(feat, 0.0) for feat in FEATURE_NAMES]])
    
    probabilities = {}
    for label in LABEL_NAMES:
        clf = models[label]
        # Predict probability of class 1 (failure)
        prob = clf.predict_proba(x_input)[0][1]
        probabilities[label] = float(prob)
        
    # Overall risk score calculation (weighted sum of top probabilities)
    max_prob = max(probabilities.values())
    avg_prob = sum(probabilities.values()) / len(probabilities)
    risk_score = (max_prob * 0.7) + (avg_prob * 0.3)
    
    # Map to flight safety state
    if risk_score < 0.15:
        safety_status = "NORMAL"
        status_color = "green"
        recommendation = "All systems functioning within nominal parameters. Continue standard flight envelope."
    elif risk_score < 0.40:
        safety_status = "WARNING"
        status_color = "yellow"
        recommendation = "Minor anomalies detected in telemetry. Monitor subsystem readings closely and advise maintenance team."
    elif risk_score < 0.70:
        safety_status = "CRITICAL"
        status_color = "orange"
        recommendation = "Significant system degradation. Initiate sensor verification and prepare safety margin backup protocols."
    else:
        safety_status = "EMERGENCY"
        status_color = "red"
        recommendation = "Failure imminent or occurred. Command primary backup systems, initiate emergency descent procedures, and route to nearest airfield."
        
    return {
        "probabilities": probabilities,
        "risk_score": float(risk_score),
        "safety_status": safety_status,
        "status_color": status_color,
        "recommendation": recommendation,
        "confidence": float(1.0 - abs(risk_score - 0.5) * 0.2) # Model confidence metric
    }
