import sympy as sp
from utils import sanitize_input

class EquationSolver:
    def __init__(self):
        self.x = sp.symbols('x')
    
    def solve_equation(self, eq_str):
        result = {
            "status": "success",
            "type": "معادلة",
            "final_latex": "",
            "original_latex": ""
        }

        try:
            # 1. معالجة النص (تحويل = إلى معادلة صفرية)
            # المستخدم يدخل: 2x + 5 = 15
            # SymPy يريدها: 2x + 5 - 15 (تساوي صفر)
            eq_str = sanitize_input(eq_str)
            if "=" in eq_str:
                lhs_str, rhs_str = eq_str.split("=")
                lhs = sp.sympify(lhs_str)
                rhs = sp.sympify(rhs_str)
                equation_expr = lhs - rhs
                # للعرض: نعرض المعادلة كما هي x = y
                display_eq = sp.Eq(lhs, rhs)
            else:
                # إذا نسي المستخدم علامة = نعتبرها معادلة صفرية
                equation_expr = sp.sympify(eq_str)
                display_eq = sp.Eq(equation_expr, 0)
            
            result['original_latex'] = sp.latex(display_eq)

            # 2. الحل (بدون خطوات، حل نهائي مباشر)
            # نستخدم solveset لأنها أدق رياضياً وتتعامل مع الحالات الخاصة
            solutions = sp.solve(equation_expr, self.x)
            
            # 3. تنسيق المخرجات
            if not solutions:
                # مجموعة الحل فاي
                result['final_latex'] = r"\phi \quad (\text{لا يوجد حل حقيقي})"
                result['type'] = "معادلة مستحيلة الحل"
            else:
                # تجميع الحلول في نص واحد (x = 1, x = 2)
                sol_latex_list = []
                for sol in solutions:
                    sol_latex_list.append(f"x = {sp.latex(sol)}")
                
                # دمج الحلول بفاصلة
                result['final_latex'] = r"\displaystyle " + r" , \quad ".join(sol_latex_list)
                
                # تحديد نوع المعادلة (لأغراض البحث)
                deg = sp.degree(equation_expr, self.x)
                if deg == 1:
                    result['type'] = "معادلة خطية (درجة أولى)"
                elif deg == 2:
                    result['type'] = "معادلة تربيعية (درجة ثانية)"
                else:
                    result['type'] = f"معادلة من الدرجة {deg}"

            return result

        except Exception as e:
            result['status'] = "error"
            result['message'] = "تأكد من كتابة المعادلة بشكل صحيح (مثال: 2*x + 5 = 15)"
            return result