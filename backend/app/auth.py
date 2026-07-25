import datetime
from typing import Optional, Dict
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Security Configurations
SECRET_KEY = "AEROSENTINEL_SUPER_SECRET_KEY_FOR_JWT_SECURITY_DO_NOT_LEAK"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_bearer = HTTPBearer()

# In-memory users for demonstration and pilot validation
USERS_DB: Dict[str, dict] = {
    "admin@aerosentinel.com": {
        "username": "admin@aerosentinel.com",
        "hashed_password": pwd_context.hash("admin123"),
        "role": "admin",
        "name": "Commander Sarah Jenkins",
        "avatar": "/avatars/jenkins.jpg"
    },
    "pilot@aerosentinel.com": {
        "username": "pilot@aerosentinel.com",
        "hashed_password": pwd_context.hash("pilot123"),
        "role": "pilot",
        "name": "Captain Marcus Vance",
        "avatar": "/avatars/vance.jpg"
    }
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_bearer)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = USERS_DB.get(username)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Insufficient access permissions")
    return current_user
