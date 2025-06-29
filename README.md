# TrafficScope 🚦

**TrafficScope** is a full-stack application that combines a Python-based backend and a Next.js frontend. This project helps in detecting and analyzing road traffic and related data using modern web and AI technologies.

---

## 📁 Project Structure

```
TrafficScope/
│
├── backend/          # Python backend using uv
│   └── main.py       # Entry point for backend
│
├── frontend/         # Next.js frontend application
│   ├── pages/
│   ├── components/
│   └── ...
│
├── README.md         # Project setup and instructions
```

---

## ⚙️ Prerequisites

Make sure you have the following installed on your system:

- **Python (3.10+)**
- **Node.js (16+)**
- **pnpm** (recommended, or use npm/yarn)
- **uv** (Python dependency manager) – install via `pip install uv`

---

## 🧠 Backend Setup (Python)

1. **Navigate to the backend directory:**

```bash
cd backend
```

2. **Install `uv`:**

```bash
pip install uv
```

3. **Install Python dependencies:**

```bash
uv sync
```

Or manually via:

```bash
uv pip install -r pyproject.toml
```

4. **Run the server:**

```bash
uv run main.py
```

Your backend will start running locally.

---

## 🌐 Frontend Setup (Next.js)

1. **Navigate to the frontend directory:**

```bash
cd ../frontend
```

2. **Install dependencies:**

```bash
pnpm install
```

Or if you're using `npm`:

```bash
npm install
```

3. **Start the development server:**

```bash
pnpm dev
```

Or:

```bash
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## 🚀 Running the Full Project

To run both frontend and backend simultaneously:

1. Open two terminal windows or split the terminal.
2. In the first one, run the **backend** as shown above.
3. In the second, run the **frontend**.

---
