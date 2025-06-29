export interface GeneralDetectionData {
  id: string;
  imgSrc: string;
  className: string;
  detectedAt: number;
}

export interface OverspeedingData {
  id: string;
  imgSrc: string;
  className: string;
  highestSpeed: string;
  detectedAt: number;
}

export interface PotholeData {
  id: string;
  imgSrc: string;
  className: string;
  detectedAt: number;
  coordinate: {
    lat: number;
    long: number;
  };
}

export interface VehicleFinderData {
  id: string;
  imgSrc: string;
  className: string;
  detectedAt: number;
  plateNumber: string;
}

export interface LeftTrafficControlData {
  video_id: "Left";
  detections: {
    className: string;
    confScore: number;
    elapsedTime: number;
  }[];
}

export interface TopTrafficControlData {
  video_id: "Top";
  detections: {
    className: string;
    confScore: number;
    elapsedTime: number;
  }[];
}

export interface RightTrafficControlData {
  video_id: "Right";
  detections: {
    className: string;
    confScore: number;
    elapsedTime: number;
  }[];
}

export interface BottomTrafficControlData {
  video_id: "Bottom";
  detections: {
    className: string;
    confScore: number;
    elapsedTime: number;
  }[];
}

export interface PersonDetectorData {
  id: string;
  personRef: string;
  imgSrc: string;
  detectedAt: number;
}

export interface Detections {
  redLightPassing: GeneralDetectionData[];
  noHelmet: GeneralDetectionData[];
  overspeeding: OverspeedingData[];
  wrongWay: GeneralDetectionData[];
  pothole: PotholeData[];
  vehicleFinder: VehicleFinderData[];
  trafficControl: [
    LeftTrafficControlData,
    TopTrafficControlData,
    RightTrafficControlData,
    BottomTrafficControlData
  ][];
  personDetector: PersonDetectorData[];
}

export type CVModel = keyof Detections;

export interface AppData {
  lookoutVehicles: string[]; // vehicle plate numbers
  lookoutPersons: string[]; // person image file name
}
