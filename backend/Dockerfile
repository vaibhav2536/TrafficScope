FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
  build-essential \
  cmake \
  libboost-all-dev \
  libopenblas-dev \
  liblapack-dev \
  libx11-dev \
  libgl1-mesa-glx \
  libglib2.0-0 \
  python3-dev \
  libglib2.0-0 \
  libsm6 \
  libxext6 \
  libxrender-dev \
  libgl1-mesa-glx \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get clean

COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
  && pip install --no-cache-dir -r requirements.txt

COPY . /app/

RUN mkdir -p /root/.deepface/weights \
  && cp /app/src/assets/weights/vgg_face_weights.h5 /root/.deepface/weights/


EXPOSE 8000

CMD ["python", "main.py"]