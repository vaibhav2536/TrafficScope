import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AppData, Detections } from "@/types";
import { emptyDetections } from "@/lib/constants";

interface IAppContext {
  isBackendConnected: boolean;
  detections: Detections;
  appData: AppData | null;
}

const AppContext = createContext<null | IAppContext>(null);
export const useAppContext = () => useContext(AppContext) as IAppContext;

const AppProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [detections, setDetections] = useState<Detections>(emptyDetections);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(
      `ws://${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/ws`
    );
    wsRef.current = ws; // Store WebSocket reference in useRef
    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsBackendConnected(true);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // console.log("Received data:", data);

      if (data.event === "server:app-data") {
        setAppData(data.data);
      }

      if (data.event === "server:red-light-violation") {
        setDetections((prev) => ({
          ...prev,
          redLightPassing: [data.data, ...prev.redLightPassing],
        }));
      }

      if (data.event === "server:no-helmet-violation") {
        setDetections((prev) => ({
          ...prev,
          noHelmet: [data.data, ...prev.noHelmet],
        }));
      }

      if (data.event === "server:remove-no-helmet-violation") {
        setDetections((prev) => ({
          ...prev,
          noHelmet: prev.noHelmet.filter((item) => item.id !== data.data.id),
        }));
      }

      if (data.event === "server:overspeeding") {
        setDetections((prev) => ({
          ...prev,
          overspeeding: [data.data, ...prev.overspeeding],
        }));
      }

      if (data.event === "server:update-overspeeding") {
        setDetections((prev) => ({
          ...prev,
          overspeeding: prev.overspeeding.map((item) =>
            item.id === data.data.id
              ? { ...item, highestSpeed: data.data.highestSpeed }
              : item
          ),
        }));
      }

      if (data.event === "server:pothole") {
        setDetections((prev) => ({
          ...prev,
          pothole: [data.data, ...prev.pothole],
        }));
      }

      if (data.event === "server:wrong-way") {
        setDetections((prev) => ({
          ...prev,
          wrongWay: [data.data, ...prev.wrongWay],
        }));
      }

      if (data.event === "server:vehicle-found") {
        setDetections((prev) => ({
          ...prev,
          vehicleFinder: [data.data, ...prev.vehicleFinder],
        }));
      }

      if (data.event === "server:traffic-control") {
        setDetections((prev) => ({
          ...prev,
          trafficControl: [...prev.trafficControl, data.data],
        }));
      }

      if (data.event === "server:person_detected") {
        setDetections((prev) => ({
          ...prev,
          personDetector: [data.data, ...prev.personDetector],
        }));
      }
    };
    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setIsBackendConnected(false);
      wsRef.current = null;

      // Attempt to reconnect after a short delay
      setTimeout(() => {
        console.log("Reconnecting...");
        connectWebSocket();
      }, 1000);
    };
    return ws;
  }, []);

  useEffect(() => {
    const ws = connectWebSocket();
    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  return (
    <AppContext.Provider value={{ isBackendConnected, appData, detections }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
