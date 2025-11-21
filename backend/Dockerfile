# استخدام صورة بايثون خفيفة
FROM python:3.9-slim

# إعداد مجلد العمل
WORKDIR /app

# نسخ ملف المتطلبات وتثبيتها
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# نسخ باقي الملفات
COPY . .

# --- إعدادات خاصة بـ Hugging Face ---
# إنشاء مستخدم غير الروت (شرط أمني للمنصة)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# تحديد مجلد العمل للمستخدم الجديد
WORKDIR $HOME/app
COPY --chown=user . $HOME/app

# المنصة تعمل دائماً على بورت 7860
EXPOSE 7860

# أمر التشغيل
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]