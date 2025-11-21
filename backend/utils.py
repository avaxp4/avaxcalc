import re
import re

def sanitize_input(text):
    """
    تنظيف المدخلات بذكاء لدعم الرموز الخاصة والضرب الضمني
    """
    if not text:
        return ""
    text = text.replace("π", "pi")
    text = text.replace("θ", "theta")
    text = text.replace("√", "sqrt")
    
    text = re.sub(r'root', 'sqrt', text, flags=re.IGNORECASE)

    text = text.replace("^", "**")
    
    text = re.sub(r'(\d)([a-zA-Z\(])', r'\1*\2', text)
    
    text = re.sub(r'(\))(\()', r'\1*\2', text)         # )( -> )*(
    text = re.sub(r'(\))([a-zA-Z0-9])', r'\1*\2', text) # )x -> )*x
    
    return text

def get_matrix_css():
    """
    تصميم الماتريكس مع تحسينات التجاوب (Mobile Responsive)
    """
    return """
    <style>
        /* --- الإعدادات العامة (Desktop & Mobile) --- */
        .stApp {
            background-color: #000000;
            font-family: 'Courier New', Courier, monospace;
        }
        
        /* لون النصوص الأخضر */
        p, label, h1, h2, h3, .stMarkdown, .stRadio > label {
            color: #00ff41 !important;
        }
        
        /* حقول الإدخال */
        .stTextInput > div > div > input {
            background-color: #0d0d0d;
            color: #00ff41;
            border: 1px solid #00ff41;
            font-size: 18px; /* تكبير الخط قليلاً */
        }
        
        /* الأزرار (شكل عام) */
        .stButton > button {
            background-color: #000000;
            color: #00ff41;
            border: 1px solid #00ff41;
            width: 100%; /* لملء العرض المتاح */
            font-weight: bold;
            transition: 0.3s;
        }
        .stButton > button:hover {
            background-color: #00ff41;
            color: #000000;
            box-shadow: 0 0 10px #00ff41;
        }

        /* صناديق النتائج */
        .metric-box {
            background-color: #0d0d0d;
            border: 1px solid #003b00;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            color: #ffffff; 
        }

        /* --- تحسينات خاصة بالموبايل (Media Queries) --- */
        @media only screen and (max-width: 600px) {
            /* تقليل الهوامش الجانبية */
            .block-container {
                padding-left: 1rem;
                padding-right: 1rem;
                padding-top: 2rem;
            }
            
            /* تكبير أزرار الكيبورد لتسهيل الضغط */
            div[data-testid="column"] button {
                min-height: 50px; /* جعل الزر أطول */
                font-size: 20px;  /* تكبير الرمز */
                margin-bottom: 5px;
            }
            
            /* جعل العنوان أصغر قليلاً لكي لا يخرج عن الشاشة */
            .typing-effect {
                font-size: 18px !important;
            }
            
            /* تحسين عرض المعادلات */
            .katex {
                font-size: 1.1em; /* تكبير المعادلات */
            }
        }
        
        /* أنيميشن العنوان */
        @keyframes typing { from { width: 0 } to { width: 100% } }
        .typing-effect {
            overflow: hidden;
            white-space: nowrap;
            border-right: .15em solid orange;
            animation: typing 3.5s steps(40, end);
            color: #00ff41;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
    """
