export type TabType = 'explore' | 'trips' | 'alerts' | 'analytics' | 'settings';

export type AlertSeverity = 'high' | 'medium' | 'low';

export type IncidentCategory = 
  | 'fog'
  | 'landslide'
  | 'roadblock'
  | 'medical'
  | 'vehicle'
  | 'weather'
  | 'other';

export interface SafetyAlert {
  id: string;
  title: string;
  category: IncidentCategory;
  severity: AlertSeverity;
  route: string;
  state: string;
  coordinates: [number, number]; // [lat, lng]
  summary: string;
  detailedDescription: string;
  updatedTime: string;
  status: 'Active' | 'Under Investigation' | 'Resolved' | 'In Progress';
  affectedDistanceKm?: number;
  alternateRoute?: string;
  reportedBy?: string;
  verified: boolean;
  engineeringTeamDispatched?: boolean;
}

export interface RouteOption {
  id: string;
  name: string;
  subtitle: string;
  eta: string;
  durationMinutes: number;
  distanceKm: number;
  safetyScore: number; // 0-100
  hazardCount: number;
  tag: 'Recommended' | 'Alternative' | 'Scenic' | 'Heavy Freight';
  description: string;
  color: string;
  waypoints: [number, number][]; // [[lat, lng], ...]
  corridor: string;
}

export interface ActiveTrip {
  id: string;
  title: string;
  routeFrom: string;
  routeTo: string;
  progressPercent: number;
  status: 'Clear' | 'Alert' | 'Pending Start' | 'Rerouted';
  statusColor: 'green' | 'amber' | 'red';
  eta: string;
  driverName: string;
  vehicleType: string;
  vehicleReg: string;
  currentCoordinates: [number, number];
  destinationCoordinates: [number, number];
  selectedRouteId: string;
}

export interface LogisticsHub {
  id: string;
  name: string;
  state: string;
  coordinates: [number, number];
  activeConvoys: number;
  safetyStatus: 'Optimal' | 'Caution' | 'Congested';
  weather: {
    temp: string;
    condition: string;
    visibilityKm: number;
  };
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  trendType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  iconName: string;
  statusBorderColor?: string;
}

export interface IncidentReportFormData {
  incidentType: IncidentCategory;
  severity: AlertSeverity;
  locationName: string;
  routeCorridor: string;
  coordinates: [number, number];
  notes: string;
  hasPhoto: boolean;
  photoUrl?: string;
  shareGps: boolean;
  reporterName?: string;
}
