FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x start.sh

# JSON form prevents OS signal issues; start.sh runs migrations then uvicorn
CMD ["sh", "start.sh"]
