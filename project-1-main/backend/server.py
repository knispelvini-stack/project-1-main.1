from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

try:
    # MongoDB connection
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'lpa_ecommerce')
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client[db_name]
except Exception as e:
    print(f"CRITICAL ERROR: Could not initialize database connection: {e}")

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'lpa_ecommerce_secret_key_2024')
JWT_ALGORITHM = 'HS256'

# Logging setup - file-based logger
LOG_DIR = ROOT_DIR / 'log'
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / 'lpalog.log'

file_handler = logging.FileHandler(LOG_FILE)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))

logger = logging.getLogger('lpa_ecommerce')
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(console_handler)

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class CustomerRegister(BaseModel):
    first_name: str
    last_name: str
    address: str
    phone: str
    username: str
    password: str

class CustomerLogin(BaseModel):
    username: str
    password: str

class CustomerResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    first_name: str
    last_name: str
    address: str
    phone: str
    username: str

class ProductResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    lpa_stock_ID: str
    lpa_stock_name: str
    lpa_stock_description: str
    lpa_stock_price: float
    lpa_stock_quantity: int
    lpa_stock_category: str
    lpa_stock_image: str

class OrderItem(BaseModel):
    lpa_stock_ID: str
    lpa_stock_name: str
    lpa_stock_price: float
    quantity: int
    amount: float

class OrderCreate(BaseModel):
    customer_id: str
    first_name: str
    last_name: str
    address: str
    phone: str
    payment_method: str
    items: List[OrderItem]
    total: float

class OrderResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    invoice_id: str
    customer_id: str
    total: float
    payment_method: str
    status: str
    created_at: str

class LogEntry(BaseModel):
    level: str = "INFO"
    message: str
    category: str = "ACTIVITY"

class LogEntryResponse(BaseModel):
    timestamp: str
    level: str
    message: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, username: str) -> str:
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.now(timezone.utc).timestamp() + 86400
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> Optional[dict]:
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.customers.find_one({'id': payload['user_id']}, {'_id': 0})
        return user
    except Exception:
        return None

async def require_auth(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

# ==================== LOGGING HELPERS ====================

def write_log(level: str, message: str, category: str = "SYSTEM"):
    timestamp = datetime.now(timezone.utc).isoformat()
    log_line = f"[{timestamp}] [{level}] [{category}] {message}"
    if level == "ERROR":
        logger.error(f"[{category}] {message}")
    elif level == "WARNING":
        logger.warning(f"[{category}] {message}")
    else:
        logger.info(f"[{category}] {message}")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(data: CustomerRegister):
    existing = await db.customers.find_one({'username': data.username}, {'_id': 0})
    if existing:
        write_log("WARNING", f"Registration failed - username '{data.username}' already exists", "AUTH")
        raise HTTPException(status_code=400, detail="Username already exists")
    
    customer_id = str(uuid.uuid4())
    customer = {
        'id': customer_id,
        'first_name': data.first_name,
        'last_name': data.last_name,
        'address': data.address,
        'phone': data.phone,
        'username': data.username,
        'password': hash_password(data.password),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.customers.insert_one(customer)
    
    token = create_token(customer_id, data.username)
    write_log("INFO", f"New customer registered: {data.username}", "AUTH")
    
    return {
        'token': token,
        'user': {
            'id': customer_id,
            'first_name': data.first_name,
            'last_name': data.last_name,
            'address': data.address,
            'phone': data.phone,
            'username': data.username
        }
    }

@api_router.post("/auth/login")
async def login(data: CustomerLogin):
    write_log("INFO", f"Login attempt for user: {data.username}", "AUTH")
    user = await db.customers.find_one({'username': data.username}, {'_id': 0})
    if not user or not verify_password(data.password, user['password']):
        write_log("WARNING", f"Failed login attempt for user: {data.username}", "AUTH")
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_token(user['id'], user['username'])
    write_log("INFO", f"User logged in: {data.username}", "AUTH")
    
    return {
        'token': token,
        'user': {
            'id': user['id'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'address': user['address'],
            'phone': user['phone'],
            'username': user['username']
        }
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(require_auth)):
    return {
        'id': user['id'],
        'first_name': user['first_name'],
        'last_name': user['last_name'],
        'address': user['address'],
        'phone': user['phone'],
        'username': user['username']
    }

# ==================== PRODUCT ROUTES ====================

@api_router.get("/products")
async def get_products(search: Optional[str] = None, category: Optional[str] = None):
    write_log("INFO", f"Product catalog accessed (search={search}, category={category})", "ACTIVITY")
    query = {}
    if search:
        query['$or'] = [
            {'lpa_stock_name': {'$regex': search, '$options': 'i'}},
            {'lpa_stock_description': {'$regex': search, '$options': 'i'}}
        ]
    if category:
        query['lpa_stock_category'] = category
    
    products = await db.lpa_stock.find(query, {'_id': 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.lpa_stock.find_one({'lpa_stock_ID': product_id}, {'_id': 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# ==================== ORDER ROUTES ====================

@api_router.post("/orders")
async def create_order(data: OrderCreate):
    invoice_id = f"INV-{str(uuid.uuid4())[:8].upper()}"
    
    invoice = {
        'invoice_id': invoice_id,
        'customer_id': data.customer_id,
        'first_name': data.first_name,
        'last_name': data.last_name,
        'address': data.address,
        'phone': data.phone,
        'total': data.total,
        'payment_method': data.payment_method,
        'status': 'completed',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.invoices.insert_one(invoice)
    
    for item in data.items:
        invoice_item = {
            'invoice_id': invoice_id,
            'lpa_stock_ID': item.lpa_stock_ID,
            'lpa_stock_name': item.lpa_stock_name,
            'lpa_stock_price': item.lpa_stock_price,
            'quantity': item.quantity,
            'amount': item.amount
        }
        await db.invoice_items.insert_one(invoice_item)
        
        await db.lpa_stock.update_one(
            {'lpa_stock_ID': item.lpa_stock_ID},
            {'$inc': {'lpa_stock_quantity': -item.quantity}}
        )
    
    write_log("INFO", f"Order created: {invoice_id} for customer {data.customer_id}, total: ${data.total}", "ORDER")
    
    return {'invoice_id': invoice_id, 'status': 'completed', 'message': 'Order placed successfully'}

# ==================== LOG ROUTES ====================

@api_router.get("/log")
async def read_log():
    write_log("INFO", "Log file accessed", "ACTIVITY")
    if not LOG_FILE.exists():
        return {'entries': [], 'message': 'Log file is empty'}
    
    with open(LOG_FILE, 'r') as f:
        lines = f.readlines()
    
    entries = []
    for line in lines[-100:]:
        entries.append(line.strip())
    
    return {'entries': entries}

@api_router.post("/log")
async def create_log(entry: LogEntry):
    write_log(entry.level, entry.message, entry.category)
    return {'status': 'logged', 'message': entry.message}

# ==================== SEED DATA ====================

SEED_PRODUCTS = [
    {
        'lpa_stock_ID': 'LPA-KB-001',
        'lpa_stock_name': 'Neon Striker Mk.1',
        'lpa_stock_description': 'Mechanical RGB gaming keyboard with Cherry MX switches, per-key lighting, and aircraft-grade aluminum frame.',
        'lpa_stock_price': 129.99,
        'lpa_stock_quantity': 50,
        'lpa_stock_category': 'Keyboards',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1644560288792-829d056ce302?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHw0fHxnYW1pbmclMjBrZXlib2FyZCUyMG5lb24lMjByZ2J8ZW58MHx8fHwxNzczODIxNzkwfDA&ixlib=rb-4.1.0&q=85'
    },
    {
        'lpa_stock_ID': 'LPA-KB-002',
        'lpa_stock_name': 'Void Mechanical TKL',
        'lpa_stock_description': 'Compact tenkeyless mechanical keyboard with hot-swappable switches and wireless connectivity.',
        'lpa_stock_price': 89.99,
        'lpa_stock_quantity': 75,
        'lpa_stock_category': 'Keyboards',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1644560286950-1807431fc64f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBrZXlib2FyZCUyMG5lb24lMjByZ2J8ZW58MHx8fHwxNzczODIxNzkwfDA&ixlib=rb-4.1.0&q=85'
    },
    {
        'lpa_stock_ID': 'LPA-MS-001',
        'lpa_stock_name': 'Phantom Glide Wireless',
        'lpa_stock_description': 'Ultra-lightweight wireless gaming mouse with 25K DPI sensor and 70-hour battery life.',
        'lpa_stock_price': 79.99,
        'lpa_stock_quantity': 100,
        'lpa_stock_category': 'Mice',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1766601269332-6f012c9e80f9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxnYW1pbmclMjBtb3VzZSUyMHdpcmVsZXNzJTIwcmdifGVufDB8fHx8MTc3MzgyMTc5Mnww&ixlib=rb-4.1.0&q=85'
    },
    {
        'lpa_stock_ID': 'LPA-MS-002',
        'lpa_stock_name': 'Viper Precision Wired',
        'lpa_stock_description': 'Ergonomic wired gaming mouse with adjustable weight system and 8 programmable buttons.',
        'lpa_stock_price': 49.99,
        'lpa_stock_quantity': 120,
        'lpa_stock_category': 'Mice',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1629083255546-92b8587eb116?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBtb3VzZSUyMHdpcmVsZXNzJTIwcmdifGVufDB8fHx8MTc3MzgyMTc5Mnww&ixlib=rb-4.1.0&q=85'
    },
    {
        'lpa_stock_ID': 'LPA-HS-001',
        'lpa_stock_name': 'Sonic Immersion Pro',
        'lpa_stock_description': 'Premium 7.1 surround sound gaming headset with noise-canceling microphone and memory foam cushions.',
        'lpa_stock_price': 149.99,
        'lpa_stock_quantity': 60,
        'lpa_stock_category': 'Headsets',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1761521538789-bd477946a639?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBoZWFkc2V0JTIwZnV0dXJpc3RpY3xlbnwwfHx8fDE3NzM4MjE3OTJ8MA&ixlib=rb-4.1.0&q=85'
    },
    {
        'lpa_stock_ID': 'LPA-HS-002',
        'lpa_stock_name': 'Echo Lite Wireless',
        'lpa_stock_description': 'Lightweight wireless headset with 40mm drivers, 30-hour battery, and detachable boom mic.',
        'lpa_stock_price': 69.99,
        'lpa_stock_quantity': 90,
        'lpa_stock_category': 'Headsets',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1761521538789-bd477946a639?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBoZWFkc2V0JTIwZnV0dXJpc3RpY3xlbnwwfHx8fDE3NzM4MjE3OTJ8MA&ixlib=rb-4.1.0&q=85'
    },
    {
        'lpa_stock_ID': 'LPA-MN-001',
        'lpa_stock_name': 'OLED Curved 240Hz',
        'lpa_stock_description': '27-inch curved OLED gaming monitor with 240Hz refresh rate, 0.03ms response time, and HDR10+.',
        'lpa_stock_price': 899.99,
        'lpa_stock_quantity': 25,
        'lpa_stock_category': 'Monitors',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1597049176495-60ca7846c7ba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBtb25pdG9yJTIwY3VydmVkJTIwNGt8ZW58MHx8fHwxNzczODIxNzkzfDA&ixlib=rb-4.1.0&q=85'
    },
    {
        'lpa_stock_ID': 'LPA-MN-002',
        'lpa_stock_name': 'UltraWide IPS 165Hz',
        'lpa_stock_description': '34-inch ultrawide IPS display with 165Hz, QHD resolution, and built-in KVM switch.',
        'lpa_stock_price': 549.99,
        'lpa_stock_quantity': 30,
        'lpa_stock_category': 'Monitors',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1597049176495-60ca7846c7ba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBtb25pdG9yJTIwY3VydmVkJTIwNGt8ZW58MHx8fHwxNzczODIxNzkzfDA&ixlib=rb-4.1.0&q=85'
    },
    {
        'lpa_stock_ID': 'LPA-WC-001',
        'lpa_stock_name': 'StreamCam 4K AI',
        'lpa_stock_description': '4K webcam with AI auto-framing, noise-reduction mic, and adjustable ring light.',
        'lpa_stock_price': 199.99,
        'lpa_stock_quantity': 45,
        'lpa_stock_category': 'Webcams',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1763905180930-892ee8d37ea6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwzfHx3ZWJjYW0lMjBzdHJlYW1pbmclMjBzZXR1cHxlbnwwfHx8fDE3NzM4MjE3OTN8MA&ixlib=rb-4.1.0&q=85'
    },
    {
        'lpa_stock_ID': 'LPA-MP-001',
        'lpa_stock_name': 'RGB Extended Mat',
        'lpa_stock_description': 'Extra-large RGB mousepad with 14 lighting zones, micro-texture surface, and USB passthrough.',
        'lpa_stock_price': 29.99,
        'lpa_stock_quantity': 150,
        'lpa_stock_category': 'Mousepads',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1744627550030-fba19e445d08?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxnYW1pbmclMjBtb3VzZXBhZCUyMHJnYiUyMGRlc2slMjBtYXR8ZW58MHx8fHwxNzczODIxNzk0fDA&ixlib=rb-4.1.0&q=85'
    },
    {
        'lpa_stock_ID': 'LPA-MP-002',
        'lpa_stock_name': 'Stealth Control Pad',
        'lpa_stock_description': 'Premium control-type mousepad with stitched edges and non-slip rubber base. 450x400mm.',
        'lpa_stock_price': 19.99,
        'lpa_stock_quantity': 200,
        'lpa_stock_category': 'Mousepads',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1744627550030-fba19e445d08?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxnYW1pbmclMjBtb3VzZXBhZCUyMHJnYiUyMGRlc2slMjBtYXR8ZW58MHx8fHwxNzczODIxNzk0fDA&ixlib=rb-4.1.0&q=85'
    },
    {
        'lpa_stock_ID': 'LPA-KB-003',
        'lpa_stock_name': 'Apex 60% Compact',
        'lpa_stock_description': '60% form factor mechanical keyboard with Gateron switches, PBT keycaps, and USB-C.',
        'lpa_stock_price': 69.99,
        'lpa_stock_quantity': 80,
        'lpa_stock_category': 'Keyboards',
        'lpa_stock_image': 'https://images.unsplash.com/photo-1644560286950-1807431fc64f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBrZXlib2FyZCUyMG5lb24lMjByZ2J8ZW58MHx8fHwxNzczODIxNzkwfDA&ixlib=rb-4.1.0&q=85'
    }
]

@app.on_event("startup")
async def startup_event():
    write_log("INFO", "LPA Ecommerce server starting up", "SYSTEM")
    count = await db.lpa_stock.count_documents({})
    if count == 0:
        await db.lpa_stock.insert_many(SEED_PRODUCTS)
        write_log("INFO", f"Seeded {len(SEED_PRODUCTS)} products into database", "SYSTEM")
    write_log("INFO", "Server startup complete", "SYSTEM")

@app.on_event("shutdown")
async def shutdown_event():
    write_log("INFO", "LPA Ecommerce server shutting down", "SYSTEM")
    client.close()

# CORS should be added to the app instance before or after routes, 
# but using the standard FastAPI pattern:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, use "*" to eliminate CORS as a suspect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router after CORS setup
app.include_router(api_router)
