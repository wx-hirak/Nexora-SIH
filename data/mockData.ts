import { SafetyAlert, RouteOption, ActiveTrip, LogisticsHub, KpiMetric } from './types';

export const INITIAL_ALERTS: SafetyAlert[] = [
  {
    id: 'alert-nh6-washout',
    title: 'NH-6 Complete Washout',
    category: 'landslide',
    severity: 'high',
    route: 'NH-6 (Sonapur - Ratacherra Section)',
    state: 'Meghalaya',
    coordinates: [25.1052, 92.3512],
    summary: 'Major landslide at Sonapur tunnel. Route completely blocked. Engineering teams deployed.',
    detailedDescription: 'A severe landslide triggered by continuous 48-hour rainfall occurred near Sonapur Tunnel on NH-6. Approximately 450 meters of highway is blanketed with mud and rock debris. BRO (Border Roads Organisation) machinery is actively clearing the corridor.',
    updatedTime: '10m ago',
    status: 'Active',
    affectedDistanceKm: 14.5,
    alternateRoute: 'Via Umkiang - Silchar Bypass (SH-12)',
    reportedBy: 'Highway Patrol Team #04',
    verified: true,
    engineeringTeamDispatched: true
  },
  {
    id: 'alert-heavy-rainfall',
    title: 'Heavy Rainfall Warning',
    category: 'weather',
    severity: 'medium',
    route: 'NH-27 & NH-715 (Brahmaputra Valley)',
    state: 'Assam',
    coordinates: [26.5857, 93.1711],
    summary: 'Continuous downpour expected in upper Assam region. Visibility reduced to 500m.',
    detailedDescription: 'Intense precipitation with flash flood alerts in localized lowlands between Nagaon and Bokakhat. Heavy freight convoys are advised to reduce speed to 30 km/h and maintain a 50-meter following buffer.',
    updatedTime: '1h ago',
    status: 'Active',
    affectedDistanceKm: 62.0,
    alternateRoute: 'Northern Bank Highway (NH-15)',
    reportedBy: 'Regional Meteorological Centre Guwahati',
    verified: true,
    engineeringTeamDispatched: false
  },
  {
    id: 'alert-waterlogging',
    title: 'Minor Waterlogging',
    category: 'roadblock',
    severity: 'low',
    route: 'Guwahati Jalukbari Bypass (NH-17)',
    state: 'Assam',
    coordinates: [26.1445, 91.6617],
    summary: 'Slow-moving traffic near Guwahati bypass due to localized water accumulation.',
    detailedDescription: 'Drainage overflow near Borjhar intersection has caused 15cm standing water in the left two lanes. Traffic is moving slowly in single file.',
    updatedTime: '3h ago',
    status: 'In Progress',
    affectedDistanceKm: 2.1,
    alternateRoute: 'Via Gorchuk - Lokhra Road',
    reportedBy: 'City Traffic Monitoring Desk',
    verified: true,
    engineeringTeamDispatched: true
  },
  {
    id: 'alert-shillong-fog',
    title: 'Dense Fog & Mountain Mist',
    category: 'fog',
    severity: 'medium',
    route: 'GS Road (Umiam - Mawlai Pass)',
    state: 'Meghalaya',
    coordinates: [25.6582, 91.9056],
    summary: 'Thick valley fog dropping visibility below 100m on Umiam ridge.',
    detailedDescription: 'Seasonal moisture condensation causing heavy cloud cover over GS road elevations between Barapani and Mawlai. Hazard lighting and convoy lead vehicles engaged.',
    updatedTime: '45m ago',
    status: 'Active',
    affectedDistanceKm: 18.0,
    alternateRoute: 'Standard GS Road with low speed escort',
    reportedBy: 'Meghalaya Transport Authority',
    verified: true,
    engineeringTeamDispatched: false
  },
  {
    id: 'alert-repair-silchar',
    title: 'Culvert Reconstruction',
    category: 'roadblock',
    severity: 'low',
    route: 'NH-37 Badarpur Ghat',
    state: 'Assam',
    coordinates: [24.8722, 92.5714],
    summary: 'Single lane operation with alternating signal control.',
    detailedDescription: 'Scheduled culvert strengthening work. Expected delays under 15 minutes for cargo transports.',
    updatedTime: '4h ago',
    status: 'In Progress',
    affectedDistanceKm: 0.8,
    reportedBy: 'PWD Assam',
    verified: true,
    engineeringTeamDispatched: true
  }
];

export const INITIAL_TRIPS: ActiveTrip[] = [
  {
    id: 'trip-shillong-explorer',
    title: 'Shillong Explorer',
    routeFrom: 'Guwahati Hub',
    routeTo: 'Shillong Depot',
    progressPercent: 65,
    status: 'Clear',
    statusColor: 'green',
    eta: '45 mins remaining',
    driverName: 'Ramen Borah',
    vehicleType: 'Heavy Electric Transport (Volvo FL)',
    vehicleReg: 'AS-01-GC-4921',
    currentCoordinates: [25.7500, 91.8800],
    destinationCoordinates: [25.5788, 91.8933],
    selectedRouteId: 'route-safe-fast'
  },
  {
    id: 'trip-kaziranga-safari',
    title: 'Kaziranga Freight Corridor',
    routeFrom: 'Tezpur Station',
    routeTo: 'Jorhat Central Hub',
    progressPercent: 28,
    status: 'Alert',
    statusColor: 'amber',
    eta: '2h 10m remaining',
    driverName: 'Deepak Saikia',
    vehicleType: 'Multi-axle Cargo Carrier',
    vehicleReg: 'AS-12-E-8832',
    currentCoordinates: [26.6200, 92.9500],
    destinationCoordinates: [26.7509, 94.2037],
    selectedRouteId: 'route-scenic-pass'
  },
  {
    id: 'trip-silchar-express',
    title: 'Silchar Mountain Lifeline',
    routeFrom: 'Guwahati Freight Center',
    routeTo: 'Silchar Logistics Park',
    progressPercent: 12,
    status: 'Rerouted',
    statusColor: 'amber',
    eta: '5h 40m (Rerouted via SH-12)',
    driverName: 'Sujit Das',
    vehicleType: 'Thermal Container Trailer',
    vehicleReg: 'TR-01-AF-2098',
    currentCoordinates: [25.3200, 92.1200],
    destinationCoordinates: [24.8235, 92.7959],
    selectedRouteId: 'route-freight-bypass'
  }
];

export const ROUTE_OPTIONS: RouteOption[] = [
  {
    id: 'route-safe-fast',
    name: 'Safe & Fast Transit',
    subtitle: 'Primary Four-Lane Corridor',
    eta: '2h 15m',
    durationMinutes: 135,
    distanceKm: 98.4,
    safetyScore: 98,
    hazardCount: 0,
    tag: 'Recommended',
    description: 'Bypasses low-visibility hill passes via Grade-A reinforced highway. Fully monitored with intelligent road sensors.',
    color: '#2563a8',
    corridor: 'NH-27 / GS Road Expressway',
    waypoints: [
      [26.1445, 91.7362], // Guwahati
      [26.0200, 91.8200], // Khanapara / Jorabat
      [25.8500, 91.8900], // Nongpoh
      [25.6800, 91.9100], // Umiam Lake Viaduct
      [25.5788, 91.8933]  // Shillong Central
    ]
  },
  {
    id: 'route-scenic-pass',
    name: 'Mountain Valley Corridor',
    subtitle: 'Old Hill Highway',
    eta: '2h 45m',
    durationMinutes: 165,
    distanceKm: 114.2,
    safetyScore: 84,
    hazardCount: 1,
    tag: 'Scenic',
    description: 'Moderate elevation curves with 1 active fog advisory near Barapani overlook. Reduced heavy commercial traffic.',
    color: '#C48B3D',
    corridor: 'Old GS Mountain Trace',
    waypoints: [
      [26.1445, 91.7362],
      [25.9600, 91.7800],
      [25.7900, 91.8400],
      [25.6582, 91.9056],
      [25.5788, 91.8933]
    ]
  },
  {
    id: 'route-freight-bypass',
    name: 'Heavy Freight Bypass',
    subtitle: 'Southern Ridge Bypass',
    eta: '3h 10m',
    durationMinutes: 190,
    distanceKm: 142.0,
    safetyScore: 92,
    hazardCount: 0,
    tag: 'Heavy Freight',
    description: 'Reinforced for oversized industrial loads and multi-axle machinery. Completely avoids Sonapur slide sector.',
    color: '#4D845D',
    corridor: 'NH-106 / SH-12 Freight Perimeter',
    waypoints: [
      [26.1445, 91.7362],
      [25.9200, 92.1500],
      [25.6500, 92.2000],
      [25.4800, 92.0500],
      [25.5788, 91.8933]
    ]
  }
];

export const LOGISTICS_HUBS: LogisticsHub[] = [
  {
    id: 'hub-guwahati',
    name: 'Guwahati Gateway Hub',
    state: 'Assam',
    coordinates: [26.1445, 91.7362],
    activeConvoys: 48,
    safetyStatus: 'Optimal',
    weather: { temp: '28°C', condition: 'Partly Cloudy', visibilityKm: 9.5 }
  },
  {
    id: 'hub-shillong',
    name: 'Shillong Plateau Depot',
    state: 'Meghalaya',
    coordinates: [25.5788, 91.8933],
    activeConvoys: 32,
    safetyStatus: 'Optimal',
    weather: { temp: '19°C', condition: 'Light Mist', visibilityKm: 6.2 }
  },
  {
    id: 'hub-tezpur',
    name: 'Tezpur River Terminal',
    state: 'Assam',
    coordinates: [26.6338, 92.7926],
    activeConvoys: 21,
    safetyStatus: 'Caution',
    weather: { temp: '27°C', condition: 'Rain Showers', visibilityKm: 4.8 }
  },
  {
    id: 'hub-silchar',
    name: 'Silchar Valley Junction',
    state: 'Assam',
    coordinates: [24.8235, 92.7959],
    activeConvoys: 18,
    safetyStatus: 'Caution',
    weather: { temp: '26°C', condition: 'Heavy Rain', visibilityKm: 3.5 }
  },
  {
    id: 'hub-gangtok',
    name: 'Gangtok Alpine Post',
    state: 'Sikkim',
    coordinates: [27.3389, 88.6065],
    activeConvoys: 14,
    safetyStatus: 'Optimal',
    weather: { temp: '14°C', condition: 'Clear', visibilityKm: 10.0 }
  },
  {
    id: 'hub-dimapur',
    name: 'Dimapur Rail-Road Hub',
    state: 'Nagaland',
    coordinates: [25.9094, 93.7266],
    activeConvoys: 26,
    safetyStatus: 'Optimal',
    weather: { temp: '26°C', condition: 'Sunny', visibilityKm: 8.0 }
  }
];

export const EXPLORE_KPIS: KpiMetric[] = [
  {
    id: 'kpi-travelers',
    label: 'Active Travelers',
    value: '1,248',
    trend: '+12% vs last week',
    trendDirection: 'up',
    trendType: 'positive',
    iconName: 'group'
  },
  {
    id: 'kpi-safe-routes',
    label: 'Safe Routes',
    value: '98%',
    subtitle: 'All primary corridors clear',
    iconName: 'verified_user'
  },
  {
    id: 'kpi-active-alerts',
    label: 'Active Alerts',
    value: '3',
    subtitle: 'Weather advisories',
    iconName: 'warning',
    statusBorderColor: '#C48B3D'
  },
  {
    id: 'kpi-popular-hubs',
    label: 'Popular Hubs',
    value: 'Shillong',
    subtitle: 'Highest traffic volume',
    iconName: 'location_city'
  }
];

export const ANALYTICS_DATA = {
  kpis: [
    {
      id: 'akpi-travelers',
      label: 'Total Travelers',
      value: '1,248',
      trend: '12%',
      trendDirection: 'up' as const,
      iconName: 'group'
    },
    {
      id: 'akpi-safety',
      label: 'Avg Safety Score',
      value: '94%',
      subtitle: 'OPTIMAL',
      iconName: 'health_and_safety',
      statusBorderColor: '#4D845D'
    },
    {
      id: 'akpi-hubs',
      label: 'Operational Hubs',
      value: '6',
      subtitle: 'Active',
      iconName: 'domain'
    }
  ],
  weeklyTrends: [
    { label: 'Mon', travelers: 820, safetyScore: 96, incidents: 1 },
    { label: 'Tue', travelers: 940, safetyScore: 95, incidents: 2 },
    { label: 'Wed', travelers: 1100, safetyScore: 94, incidents: 3 },
    { label: 'Thu', travelers: 1050, safetyScore: 93, incidents: 2 },
    { label: 'Fri', travelers: 1280, safetyScore: 92, incidents: 4 },
    { label: 'Sat', travelers: 1420, safetyScore: 95, incidents: 1 },
    { label: 'Sun', travelers: 1248, safetyScore: 94, incidents: 3 }
  ],
  monthlyTrends: [
    { label: 'Week 1', travelers: 6400, safetyScore: 97, incidents: 8 },
    { label: 'Week 2', travelers: 7200, safetyScore: 95, incidents: 12 },
    { label: 'Week 3', travelers: 8100, safetyScore: 93, incidents: 15 },
    { label: 'Week 4', travelers: 8850, safetyScore: 94, incidents: 10 }
  ],
  incidentCategories: [
    { name: 'Heavy Rainfall', count: 42, percentage: 38, color: '#2563a8' },
    { name: 'Landslides / Rocks', count: 28, percentage: 26, color: '#B14A4A' },
    { name: 'Mountain Fog', count: 22, percentage: 20, color: '#C48B3D' },
    { name: 'Road Maintenance', count: 12, percentage: 11, color: '#5a5f65' },
    { name: 'Vehicle Breakdown', count: 6, percentage: 5, color: '#4D845D' }
  ],
  corridorSafety: [
    { corridor: 'Guwahati — Shillong (NH-27 / GS Road)', score: 98, status: 'Optimal', throughput: '450 veh/hr', avgSpeed: '58 km/h' },
    { corridor: 'Tezpur — Kaziranga — Jorhat (NH-715)', score: 92, status: 'Optimal', throughput: '320 veh/hr', avgSpeed: '52 km/h' },
    { corridor: 'Shillong — Silchar (NH-6 Sonapur Pass)', score: 68, status: 'Monitored', throughput: '140 veh/hr', avgSpeed: '28 km/h' },
    { corridor: 'Siliguri — Gangtok Ridge (NH-10)', score: 88, status: 'Optimal', throughput: '210 veh/hr', avgSpeed: '42 km/h' },
    { corridor: 'Guwahati — Goalpara — Agartala (NH-8)', score: 91, status: 'Optimal', throughput: '280 veh/hr', avgSpeed: '49 km/h' }
  ],
  stateWeatherStatus: [
    { state: 'Assam', temp: '28°C', risk: 'Low', alertCount: 2, condition: 'Intermittent Showers' },
    { state: 'Meghalaya', temp: '19°C', risk: 'Medium', alertCount: 2, condition: 'Hill Fog & Mist' },
    { state: 'Sikkim', temp: '14°C', risk: 'Low', alertCount: 0, condition: 'Clear Sky' },
    { state: 'Nagaland', temp: '24°C', risk: 'Low', alertCount: 0, condition: 'Scattered Clouds' },
    { state: 'Tripura', temp: '29°C', risk: 'Low', alertCount: 0, condition: 'Fair Weather' },
    { state: 'Arunachal Pradesh', temp: '18°C', risk: 'Medium', alertCount: 1, condition: 'Ridge Downpour' },
    { state: 'Mizoram', temp: '22°C', risk: 'Low', alertCount: 0, condition: 'Cloudy' }
  ]
};
