'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/AppStateContext';
import { Badge } from '@/components/ui/Badge';

export const TripPlannerView: React.FC = () => {
  const {
    trips,
    selectedTrip,
    setSelectedTrip,
    routeOptions,
    selectedRouteId,
    setSelectedRouteId,
    applyReroute,
    flyTo
  } = useAppState();

  const [origin, setOrigin] = useState('Guwahati Gateway Hub');
  const [destination, setDestination] = useState('Shillong Plateau Depot');
  const [vehicleClass, setVehicleClass] = useState('Heavy Commercial / Freight');
  const [avoidWeather, setAvoidWeather] = useState(true);

  const activeTrip = selectedTrip || trips[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
      {/* Left Column: Active Itineraries & Trip Selector (Col span 5) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Active Itineraries
              </h3>
              <p className="font-label-sm text-xs text-on-surface-variant">
                Live Northeast Fleet Tracking
              </p>
            </div>
            <span className="font-label-caps text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
              {trips.length} IN TRANSIT
            </span>
          </div>

          <div className="space-y-3">
            {trips.map(trip => {
              const isSelected = activeTrip?.id === trip.id;
              return (
                <div
                  key={trip.id}
                  onClick={() => {
                    setSelectedTrip(trip);
                    setSelectedRouteId(trip.selectedRouteId);
                    flyTo(trip.currentCoordinates, 10);
                  }}
                  className={`rounded-xl border p-4 transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-primary bg-primary-container/5 shadow-sm'
                      : 'border-border-subtle bg-surface hover:bg-surface-container-low'
                  }`}
                >
                  {/* Status Indicator Line */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      trip.status === 'Clear'
                        ? 'bg-status-green'
                        : trip.status === 'Alert'
                        ? 'bg-status-amber'
                        : 'bg-primary'
                    }`}
                  />

                  <div className="flex justify-between items-start pl-1">
                    <div>
                      <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                        {trip.title}
                      </h4>
                      <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                        {trip.routeFrom} &rarr; {trip.routeTo}
                      </p>
                    </div>

                    <Badge
                      variant={
                        trip.status === 'Clear'
                          ? 'green'
                          : trip.status === 'Alert'
                          ? 'amber'
                          : 'blue'
                      }
                      size="sm"
                    >
                      {trip.status}
                    </Badge>
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-border-subtle/60 text-xs pl-1">
                    <div>
                      <span className="text-on-surface-variant block text-[10px] uppercase">
                        Vehicle
                      </span>
                      <span className="font-semibold text-on-surface truncate block">
                        {trip.vehicleReg}
                      </span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block text-[10px] uppercase">
                        ETA
                      </span>
                      <span className="font-semibold text-primary block">
                        {trip.eta}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 pl-1">
                    <div className="flex justify-between text-[11px] font-label-caps text-on-surface-variant mb-1">
                      <span>Transit Progress</span>
                      <span>{trip.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${trip.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Route Search Form */}
        <div className="bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-5">
          <h4 className="font-headline-sm text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">
              alt_route
            </span>
            Corridor Route Search
          </h4>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                Origin
              </label>
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                className="w-full p-2 bg-surface-container-low border border-border-subtle rounded-lg text-on-surface font-medium"
              />
            </div>
            <div>
              <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full p-2 bg-surface-container-low border border-border-subtle rounded-lg text-on-surface font-medium"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="font-label-caps text-[10px] uppercase text-on-surface-variant">
                Avoid Terrain Hazards
              </label>
              <input
                type="checkbox"
                checked={avoidWeather}
                onChange={e => setAvoidWeather(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Route Optimization & Comparison Engine (Col span 7) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">route</span>
                Route Optimization Engine
              </h3>
              <p className="font-label-sm text-xs text-on-surface-variant">
                Target: {activeTrip?.title} ({activeTrip?.routeFrom} &rarr; {activeTrip?.routeTo})
              </p>
            </div>
            <div className="text-right">
              <span className="font-label-caps text-[11px] text-status-green bg-status-green/10 px-2 py-1 rounded font-bold">
                AI TERRAIN OPTIMIZED
              </span>
            </div>
          </div>

          {/* Route Options Cards */}
          <div className="space-y-3.5">
            {routeOptions.map(route => {
              const isSelected = selectedRouteId === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-primary bg-primary-container/5 shadow-sm'
                      : 'border-border-subtle hover:border-outline-variant bg-surface'
                  }`}
                >
                  {route.tag === 'Recommended' && (
                    <div className="absolute -top-2.5 right-4 bg-primary text-on-primary font-label-caps text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-xs">
                      Recommended
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg text-white mt-0.5 shadow-xs"
                        style={{ backgroundColor: route.color }}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {route.tag === 'Recommended'
                            ? 'speed'
                            : route.tag === 'Scenic'
                            ? 'landscape'
                            : 'local_shipping'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                          {route.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {route.corridor} &bull; {route.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-headline-sm text-base font-bold text-primary">
                        {route.eta}
                      </div>
                      <div className="text-xs text-on-surface-variant font-medium">
                        {route.distanceKm} km
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant mt-3 bg-surface-container-low/60 p-2 rounded-lg">
                    {route.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-subtle/50 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-semibold text-status-green">
                        <span className="material-symbols-outlined text-sm">
                          health_and_safety
                        </span>
                        Safety: {route.safetyScore}%
                      </span>
                      <span className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">
                          warning
                        </span>
                        {route.hazardCount} Hazards
                      </span>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        applyReroute(activeTrip.id, route.id);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-xs hover:brightness-110'
                          : 'bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-white'
                      }`}
                    >
                      {activeTrip.selectedRouteId === route.id
                        ? 'Current Route'
                        : 'Apply Reroute'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="mt-5 pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-on-surface-variant">
              Selected path synced to map substrate in real-time.
            </div>
            <button
              onClick={() => applyReroute(activeTrip.id, selectedRouteId)}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-headline-sm text-xs font-bold shadow-sm hover:brightness-110 transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              Dispatch Route to Convoy Driver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
