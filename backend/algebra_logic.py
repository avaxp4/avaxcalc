import sympy as sp
from utils import sanitize_input

class AlgebraFactorizer:
    def __init__(self):
        self.x = sp.symbols('x')
    
    def analyze_expression(self, expr_str):
        result = {
            "status": "success",
            "type": "تحليل عام",
            "final_latex": "",
            "original_latex": ""
        }

        try:
            # تنظيف وإعداد
            expr_str = sanitize_input(expr_str)
            expr = sp.sympify(expr_str)
            result['original_latex'] = sp.latex(expr)

            # 1. المحاولة الأولى: التحليل التقليدي (أقواس)
            factored_expr = sp.factor(expr)

            # 2. التحقق: هل نجح التحليل؟
            # إذا كانت النتيجة هي نفسها المدخلات، فهذا يعني أن التحليل فشل
            if factored_expr == expr:
                
                # هنا نتدخل بذكاء: هل هي معادلة تربيعية تحتاج للقانون العام؟
                poly = sp.Poly(expr, self.x)
                if poly.degree() == 2:
                    # استخراج المعاملات
                    a, b, c = poly.all_coeffs()
                    discriminant = b**2 - 4*a*c
                    
                    if discriminant >= 0:
                        # يوجد حل حقيقي (جذور)
                        result['type'] = "غير قابل للتحليل المباشر (استخدام القانون العام)"
                        
                        # حساب الجذور لعرضها
                        # الشكل: (-b ± sqrt(delta)) / 2a
                        sol1 = (-b + sp.sqrt(discriminant)) / (2*a)
                        sol2 = (-b - sp.sqrt(discriminant)) / (2*a)
                        
                        # تنسيق الناتج بشكل جذور جميلة
                        # نستخدم القائمة لدمج الحلين
                        result['final_latex'] = r"\displaystyle x = " + sp.latex(sol1) + r", \quad x = " + sp.latex(sol2)
                    else:
                        # المميز سالب
                        result['type'] = "لا يوجد تحليل في الأعداد الحقيقية (المميز سالب)"
                        result['final_latex'] = r"\Delta = " + str(discriminant) + r" < 0"
                else:
                    # ليست تربيعية ولم تتحلل (ربما أولية)
                    result['type'] = "مقدار أولي (لا يقبل التحليل)"
                    result['final_latex'] = sp.latex(expr)
            
            else:
                # نجح التحليل التقليدي (أقواس)
                result['final_latex'] = r"\displaystyle " + sp.latex(factored_expr)
                
                # تصنيف النوع (للعرض فقط)
                terms = sp.Add.make_args(expr)
                if len(terms) == 2:
                    if "-" in str(expr) and "x**2" in str(expr):
                        result['type'] = "فرق بين مربعين"
                    elif "x**3" in str(expr):
                        result['type'] = "مجموع/فرق مكعبين"
                    else:
                        result['type'] = "إخراج عامل مشترك"
                elif len(terms) == 3:
                     poly = sp.Poly(expr, self.x)
                     if poly.coeffs()[0] == 1:
                         result['type'] = "مقدار ثلاثي بسيط"
                     else:
                         result['type'] = "مقدار ثلاثي غير بسيط (المقص)"
                elif len(terms) == 4:
                    result['type'] = "تحليل بالتقسيم"

            return result

        except Exception as e:
            result['status'] = "error"
            result['message'] = str(e)
            return result