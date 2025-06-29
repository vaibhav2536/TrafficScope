from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.live_stream import router as VideoStreamRouter
from src.routes.websockets import router as WebSocketRouter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(VideoStreamRouter, tags=["Video Stream"], prefix="")
app.include_router(WebSocketRouter, tags=["WebSocket"], prefix="")


@app.get("/", tags=["Welcome"])
def welcome():
    return {"message": "Welcome to RoadLens!"}
