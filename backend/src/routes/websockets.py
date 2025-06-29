from typing import Any, Dict, List

from fastapi import APIRouter, WebSocket
from pydantic import BaseModel

from ..data.app_data import app_data


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected: {websocket.client}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


router = APIRouter()
ws_manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    await websocket.send_json({"event": "server:app-data", "data": app_data})

    try:
        while True:
            data = await websocket.receive_json()
            await ws_manager.broadcast(data)
    except Exception:
        ws_manager.disconnect(websocket)
        print("Client disconnected")


class LookoutVehicle(BaseModel):
    lookoutVehicle: str


class LookoutPerson(BaseModel):
    lookoutPerson: str


@router.post("/add-lookout-vehicle")
async def add_vehicle(vehicle: LookoutVehicle):
    app_data["lookoutVehicles"].append(vehicle.lookoutVehicle.strip().upper())
    await ws_manager.broadcast({"event": "server:app-data", "data": app_data})
    return {"message": "Vehicle added successfully"}


@router.post("/remove-lookout-vehicle")
async def remove_vehicle(vehicle: LookoutVehicle):
    vehicle_to_remove = vehicle.lookoutVehicle.strip().upper()
    if vehicle_to_remove in app_data["lookoutVehicles"]:
        app_data["lookoutVehicles"].remove(vehicle_to_remove)
        print(app_data["lookoutVehicles"])
        await ws_manager.broadcast({"event": "server:app-data", "data": app_data})
        return {"message": "Vehicle removed successfully"}
    else:
        return {"message": "Vehicle not found"}


@router.post("/add-lookout-person")
async def add_person(person: LookoutPerson):
    app_data["lookoutPersons"].append(person.lookoutPerson.strip().upper())
    await ws_manager.broadcast({"event": "server:app-data", "data": app_data})
    return {"message": "Person added successfully"}


@router.post("/remove-lookout-person")
async def remove_person(person: LookoutPerson):
    person_to_remove = person.lookoutPerson.strip().upper()
    if person_to_remove in app_data["lookoutPersons"]:
        app_data["lookoutPersons"].remove(person_to_remove)
        print(app_data["lookoutPersons"])
        await ws_manager.broadcast({"event": "server:app-data", "data": app_data})
        return {"message": "Person removed successfully"}
    else:
        return {"message": "Person not found"}
