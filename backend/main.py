from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import time  # مكتبة الوقت

# استيراد الملفات المنطقية
from algebra_logic import AlgebraFactorizer
from equation_logic import EquationSolver
from trig_logic import TrigSolver

app = FastAPI(title="Matrix Math Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

algebra_engine = AlgebraFactorizer()
equation_engine = EquationSolver()
trig_engine = TrigSolver()

# --- تقديرات الزمن البشري (بالثواني) ---
HUMAN_BENCHMARKS = {
    # الجبر
    "فرق بين مربعين": 10,
    "مجموع/فرق مكعبين": 30,
    "إخراج عامل مشترك": 10,
    "مقدار ثلاثي بسيط": 15,
    "مقدار ثلاثي غير بسيط (المقص)": 100,
    "تحليل بالتقسيم": 80,
    "غير قابل للتحليل المباشر (استخدام القانون العام)": 100,
    # المعادلات
    "معادلة خطية (درجة أولى)": 20,
    "معادلة تربيعية (درجة ثانية)": 50,
    # المثلثات
    "تحليل زاوية": 10,
    "إيجاد الدوال": 100,
    "default": 60
}

# --- Models ---
class ExpressionRequest(BaseModel):
    expression: str

class AngleRequest(BaseModel):
    angle: str
    is_radians: bool = False

class TrigRequest(BaseModel):
    func: str
    value: str
    quadrant: int

# --- Helper: دالة لقياس الوقت وإضافة البيانات ---
def process_with_benchmark(func, *args, **kwargs):
    start_time = time.perf_counter()
    result = func(*args, **kwargs)
    end_time = time.perf_counter()
    
    machine_time = end_time - start_time
    
    # تحديد الزمن البشري بناءً على نوع المسألة
    problem_type = result.get('type', 'default')
    # تنظيف النص للعثور على المفتاح في القاموس (بحث تقريبي)
    human_time = HUMAN_BENCHMARKS.get('default')
    for key, val in HUMAN_BENCHMARKS.items():
        if key in problem_type:
            human_time = val
            break
            
    # حساب عامل التفوق
    safe_machine_time = max(machine_time, 0.000001)
    speedup = int(human_time / safe_machine_time)
    
    # إضافة البيانات للنتيجة
    result['benchmarks'] = {
        'machine_time': f"{machine_time:.6f}",
        'human_time': human_time,
        'speedup': speedup
    }
    return result

# --- Endpoints ---

@app.get("/")
def home():
    return {"status": "Online"}

@app.post("/solve/algebra")
def solve_algebra(req: ExpressionRequest):
    return process_with_benchmark(algebra_engine.analyze_expression, req.expression)

@app.post("/solve/equation")
def solve_equation(req: ExpressionRequest):
    return process_with_benchmark(equation_engine.solve_equation, req.expression)

@app.post("/solve/trig/analyze")
def analyze_angle(req: AngleRequest):
    # نضيف نوع وهمي للبحث عنه في البنشمارك
    def wrapper(ang, is_rad):
        res = trig_engine.analyze_angle(ang, is_rad)
        res['type'] = "تحليل زاوية" 
        return res
    return process_with_benchmark(wrapper, req.angle, req.is_radians)

@app.post("/solve/trig/functions")
def solve_trig_functions(req: TrigRequest):
    def wrapper(f, v, q):
        res = trig_engine.solve_from_one_func(f, v, q)
        res['type'] = "إيجاد الدوال"
        return res
    return process_with_benchmark(wrapper, req.func, req.value, req.quadrant)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)