import sympy as sp
from utils import sanitize_input

class TrigSolver:
    def __init__(self):
        self.theta = sp.symbols('theta')

    def analyze_angle(self, angle_deg, is_radians=False):
        try:
            clean_str = sanitize_input(angle_deg)
            expr = sp.sympify(clean_str)
            
            if is_radians:
                angle_deg_expr = expr * 180 / sp.pi
            else:
                angle_deg_expr = expr

            angle = float(angle_deg_expr.evalf())
            
            # --- التحديث الجديد: حساب الإحداثيات الدقيقة (Exact Coordinates) ---
            # نحول الزاوية لراديان للحساب
            val_rad = angle_deg_expr * sp.pi / 180
            # نستخدم simplify للحصول على جذور وكسور (مثل sqrt(3)/2)
            exact_sin = sp.simplify(sp.sin(val_rad))
            exact_cos = sp.simplify(sp.cos(val_rad))
            
            # تنسيق الإحداثيات كزوج مرتب (x, y) = (cos, sin)
            coords_latex = f"\\left( {sp.latex(exact_cos)}, {sp.latex(exact_sin)} \\right)"
            # ---------------------------------------------------------------

            smallest_pos = angle % 360
            largest_neg = smallest_pos - 360
            extra_pos = smallest_pos + 360
            extra_neg = largest_neg - 360
            
            frac_deg = sp.Rational(str(smallest_pos)) 
            rad_val = sp.simplify(frac_deg * sp.pi / 180)
            
            if smallest_pos == 0 or smallest_pos == 180 or smallest_pos == 360: quad = "Axial (X-Axis)"
            elif smallest_pos == 90 or smallest_pos == 270: quad = "Axial (Y-Axis)"
            elif 0 < smallest_pos < 90: quad = "Quadrant I"
            elif 90 < smallest_pos < 180: quad = "Quadrant II"
            elif 180 < smallest_pos < 270: quad = "Quadrant III"
            else: quad = "Quadrant IV"

            return {
                "status": "success",
                "type": "angle_analysis",
                "base_deg": float(smallest_pos),
                "base_rad": sp.latex(rad_val),
                "neg_deg": float(largest_neg),
                "extra_pos": float(extra_pos),
                "extra_neg": float(extra_neg),
                "quadrant": quad,
                "input_interpretation": sp.latex(expr) + (" rad" if is_radians else "^\\circ"),
                "coords_latex": coords_latex # إرسال الإحداثيات للواجهة
            }
        except Exception as e:
            return {"status": "error", "message": f"Input Error: {str(e)}"}
    
    def solve_from_one_func(self, func_name, value_str, quadrant_idx):
        try:
            clean_val_str = sanitize_input(value_str)
            val = sp.sympify(clean_val_str)
            abs_val = sp.Abs(val)
            
            if func_name == 'sin':
                ref_angle_rad = sp.asin(abs_val)
            elif func_name == 'cos':
                ref_angle_rad = sp.acos(abs_val)
            elif func_name == 'tan':
                ref_angle_rad = sp.atan(abs_val)
            
            ref_angle_deg = sp.deg(ref_angle_rad)
            
            angles_map = {
                1: ref_angle_deg,
                2: 180 - ref_angle_deg,
                3: 180 + ref_angle_deg,
                4: 360 - ref_angle_deg
            }
            
            sin_v = abs_val if func_name == 'sin' else sp.sqrt(1 - sp.cos(ref_angle_rad)**2)
            if func_name == 'tan':
                numer, denom = abs_val.as_numer_denom()
                hypot = sp.sqrt(numer**2 + denom**2)
                sin_v = numer/hypot
                cos_v = denom/hypot
            else:
                cos_v = abs_val if func_name == 'cos' else sp.sqrt(1 - sin_v**2)

            final_sin, final_cos = sin_v, cos_v
            q = int(quadrant_idx)
            
            q_sin_sign = 1 if q in [1, 2] else -1
            q_cos_sign = 1 if q in [1, 4] else -1
            
            final_sin = final_sin * q_sin_sign
            final_cos = final_cos * q_cos_sign
            
            # --- التعديل الجديد: تجهيز الإحداثيات للعرض ---
            coords_latex = f"\\left( {sp.latex(final_cos)}, {sp.latex(final_sin)} \\right)"
            # ---------------------------------------------

            res = {
                'sin': sp.latex(final_sin),
                'cos': sp.latex(final_cos),
                'tan': sp.latex(final_sin/final_cos),
                'csc': sp.latex(1/final_sin),
                'sec': sp.latex(1/final_cos),
                'cot': sp.latex(final_cos/final_sin),
                'coords_latex': coords_latex, # إرسال الإحداثيات
                'status': 'success',
                'angles_analysis': [] 
            }
            
            signs_map = {}
            if func_name == 'sin': signs_map = {1: '+', 2: '+', 3: '-', 4: '-'}
            elif func_name == 'cos': signs_map = {1: '+', 2: '-', 3: '-', 4: '+'}
            elif func_name == 'tan': signs_map = {1: '+', 2: '-', 3: '+', 4: '-'}

            for i in range(1, 5):
                angle_val = angles_map[i]
                sign = signs_map[i]
                signed_value = abs_val if sign == '+' else -abs_val
                angle_float = float(angle_val.evalf())
                
                res['angles_analysis'].append({
                    'quad': i,
                    'angle_latex': sp.latex(angle_val),
                    'value_latex': sp.latex(signed_value),
                    'angle_float': angle_float,
                    'is_selected': (i == q)
                })
            
            return res

        except Exception as e:
            print(f"Error in trig logic: {e}")
            return {"status": "error", "message": f"Calculation Error: {str(e)}"}    
