import React, { useState, useId, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShipmentStore } from "@/stores/shipmentStore";
import { useVehicleStore } from "@/stores/vehicleStore";
import {
  shipmentApi,
  routeAlternativesApi,
  authApi,
  formatAxiosError,
  type GeoJsonPoint,
  type ParsedAlternativeRoute
} from "@/services/api/apiClient";
import {
  registeredDrivers,
  regionalLocationsRegistry,
  findLocationByText,
  searchLocations,
  cargoCommodityPresets,
  type RegionalLocation
} from "@/services/mock/driversData";
import {
  compressImageFile,
  generateSampleConsignmentImage,
  type CompressedImageResult
} from "./imageCompression";
import type { Shipment, DriverProfile, RouteOption } from "@/types/domain";

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (shipmentId: string) => void;
}

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const navigate = useNavigate();
  const formId = useId();
  const addShipment = useShipmentStore((s) => s.addShipment);
  const selectShipment = useShipmentStore((s) => s.selectShipment);
  const setShipments = useShipmentStore((s) => s.setShipments);
  const vehicles = useVehicleStore((s) => s.vehicles);

  // Generate unique initial consignment ID
  const generateNewId = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `SHP-2026-${randomNum}`;
  };

  const [shipmentId, setShipmentId] = useState(generateNewId);

  // Origin Location state: display name + [longitude, latitude] coordinates
  const [originText, setOriginText] = useState("Guwahati");
  const [originCoords, setOriginCoords] = useState<[number, number]>([91.7362, 26.1445]);
  const [originSuggestionsOpen, setOriginSuggestionsOpen] = useState(false);
  const originWrapperRef = useRef<HTMLDivElement>(null);

  // Destination Location state: display name + [longitude, latitude] coordinates
  const [destinationText, setDestinationText] = useState("Shillong");
  const [destinationCoords, setDestinationCoords] = useState<[number, number]>([91.8933, 25.5788]);
  const [destinationSuggestionsOpen, setDestinationSuggestionsOpen] = useState(false);
  const destinationWrapperRef = useRef<HTMLDivElement>(null);

  // Driver & Vehicle selections
  const [selectedDriverId, setSelectedDriverId] = useState(registeredDrivers[0].id);
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    registeredDrivers[0].backendVehicleId || registeredDrivers[0].vehicleId
  );
  const [commodity, setCommodity] = useState(cargoCommodityPresets[0]);
  const [priority, setPriority] = useState<1 | 2 | 3>(1);
  const [weightKg, setWeightKg] = useState<number>(1200);

  // Date-time defaults (Pickup: now, Delivery: +8 hours)
  const [pickupTime, setPickupTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [expectedDelivery, setExpectedDelivery] = useState(() =>
    new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 16)
  );

  const [receiverName, setReceiverName] = useState("Dr. M. Saikia");
  const [receiverFacility, setReceiverFacility] = useState("Shillong Civil Hospital Medical Depot");
  const [receiverPhone, setReceiverPhone] = useState("+91 94360 88210");
  const [specialInstructions, setSpecialInstructions] = useState(
    "Maintain cold chain temperature 2°C - 8°C. Expedite transit clearance across GS Road / NH-6 corridor."
  );

  // Image Upload / Capture state (Required, max 45 KB)
  const [selectedImage, setSelectedImage] = useState<CompressedImageResult | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(() => authApi.hasToken());
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [callNotice, setCallNotice] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Sync auth token status on open
  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(authApi.hasToken());
    }
  }, [isOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (originWrapperRef.current && !originWrapperRef.current.contains(e.target as Node)) {
        setOriginSuggestionsOpen(false);
      }
      if (destinationWrapperRef.current && !destinationWrapperRef.current.contains(e.target as Node)) {
        setDestinationSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  if (!isOpen) return null;

  const currentDriver: DriverProfile =
    registeredDrivers.find((d) => d.id === selectedDriverId) || registeredDrivers[0];

  const handleDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId);
    const drv = registeredDrivers.find((d) => d.id === driverId);
    if (drv) {
      setSelectedVehicleId(drv.backendVehicleId || drv.vehicleId);
    }
  };

  const handleCallDriver = () => {
    setCallNotice(`Connecting satellite dispatch line to ${currentDriver.name} (${currentDriver.phone})...`);
    setTimeout(() => {
      setCallNotice(null);
    }, 4000);
  };

  // Image processing with automatic compression to <= 45 KB
  const processImageFile = async (file: File) => {
    setImageError(null);
    setIsCompressingImage(true);
    try {
      const result = await compressImageFile(file, 45 * 1024, file.name);
      setSelectedImage(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to compress image below 45 KB limit.";
      setImageError(msg);
      setSelectedImage(null);
    } finally {
      setIsCompressingImage(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleGenerateSampleImage = async () => {
    setImageError(null);
    setIsCompressingImage(true);
    try {
      const sample = await generateSampleConsignmentImage(shipmentId);
      setSelectedImage(sample);
    } catch {
      setImageError("Could not generate sample consignment image.");
    } finally {
      setIsCompressingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Quick Sign In helper for instant pre-creation authentication
  const handleQuickSignIn = async () => {
    setIsSigningIn(true);
    setSubmissionError(null);
    try {
      await authApi.signin({ email: "test@test.com", password: "password123" });
      setIsAuthenticated(true);
    } catch (err) {
      setSubmissionError(formatAxiosError(err, "Sign in failed. Please verify credentials."));
    } finally {
      setIsSigningIn(false);
    }
  };

  // Location search input handlers
  const handleOriginInputChange = (val: string) => {
    setOriginText(val);
    setOriginSuggestionsOpen(true);
    const matched = findLocationByText(val);
    if (matched) {
      setOriginCoords(matched.coordinates);
    }
  };

  const handleSelectOriginLocation = (loc: RegionalLocation) => {
    setOriginText(loc.name);
    setOriginCoords(loc.coordinates);
    setOriginSuggestionsOpen(false);
  };

  const handleDestinationInputChange = (val: string) => {
    setDestinationText(val);
    setDestinationSuggestionsOpen(true);
    const matched = findLocationByText(val);
    if (matched) {
      setDestinationCoords(matched.coordinates);
    }
  };

  const handleSelectDestinationLocation = (loc: RegionalLocation) => {
    setDestinationText(loc.name);
    setDestinationCoords(loc.coordinates);
    setDestinationSuggestionsOpen(false);
  };

  const originSuggestions = searchLocations(originText).slice(0, 6);
  const destinationSuggestions = searchLocations(destinationText).slice(0, 6);

  // Form submission: Validate -> Format GeoJSON -> ORS Route -> Backend POST -> State Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    setImageError(null);

    // 0. Ensure user is authenticated before creation
    if (!authApi.hasToken()) {
      try {
        await authApi.signin({ email: "test@test.com", password: "password123" });
        setIsAuthenticated(true);
      } catch {
        setSubmissionError("Authentication required: You must log in before creating a shipment.");
        return;
      }
    }

    // 1. Validate Image (Required, max 45 KB)
    if (!selectedImage) {
      setImageError("Cargo proof image is required before creation (maximum 45 KB).");
      setSubmissionError("Please upload or generate a consignment image before submitting.");
      return;
    }
    if (selectedImage.sizeBytes > 45 * 1024) {
      setImageError(`Image size (${selectedImage.sizeKb} KB) exceeds the strict 45 KB maximum limit.`);
      setSubmissionError("Image size must not exceed 45 KB.");
      return;
    }

    // 2. Validate that both origin and destination have valid [longitude, latitude] coordinates
    if (!originCoords || originCoords.length !== 2 || isNaN(originCoords[0]) || isNaN(originCoords[1])) {
      setSubmissionError("Invalid Start Location. Please enter or select a valid North East location.");
      return;
    }
    if (!destinationCoords || destinationCoords.length !== 2 || isNaN(destinationCoords[0]) || isNaN(destinationCoords[1])) {
      setSubmissionError("Invalid Destination. Please enter or select a valid North East location.");
      return;
    }

    setIsSubmitting(true);

    try {
      const originGeoJson: GeoJsonPoint = {
        type: "Point",
        coordinates: [Number(originCoords[0]), Number(originCoords[1])]
      };
      const destinationGeoJson: GeoJsonPoint = {
        type: "Point",
        coordinates: [Number(destinationCoords[0]), Number(destinationCoords[1])]
      };

      // 3. Fetch route calculated by backend OpenRouteService integration
      let orsRoute: ParsedAlternativeRoute | null = null;
      try {
        const routes = await routeAlternativesApi.fetchParsedAlternatives({
          origin: originGeoJson,
          destination: destinationGeoJson
        });
        if (routes && routes.length > 0) {
          orsRoute = routes[0];
        }
      } catch (err) {
        console.warn("Backend OpenRouteService calculation encountered an issue:", err);
      }

      // 4. Use real backend driverId and vehicleId (valid 24-character ObjectIds)
      const targetDriverId = currentDriver.backendId || "6a9a3c1010f836940a45ab2a";
      const targetVehicleId = currentDriver.backendVehicleId || selectedVehicleId || "6a9a3b6510f836940a45ab23";
      const targetRouteId = orsRoute?.id || `ROUTE-${shipmentId}`;

      // 5. Dispatch shipment creation to backend endpoint with all required fields
      const createdShipment = await shipmentApi.create({
        origin: originGeoJson,
        destination: destinationGeoJson,
        priority,
        commodity: commodity.trim(),
        loadType: commodity.trim(),
        weightKg: Number(weightKg) || 1200,
        vehicleId: targetVehicleId,
        driverId: targetDriverId,
        routeId: targetRouteId,
        image: selectedImage.file || selectedImage.blob,
        driverName: currentDriver.name,
        driverPhone: currentDriver.phone,
        driverPhotoUrl: currentDriver.photoUrl,
        vehicleNumber: currentDriver.vehicleNumber,
        vehicleType: currentDriver.vehicleType,
        pickupTimeIso: new Date(pickupTime).toISOString(),
        expectedDeliveryIso: new Date(expectedDelivery).toISOString(),
        receiverContact: `${receiverName} (${receiverFacility}) • ${receiverPhone}`,
        specialInstructions: specialInstructions.trim(),
        route: orsRoute
          ? {
              distanceKm: orsRoute.distanceKm,
              durationMinutes: orsRoute.durationMinutes
            }
          : undefined
      });

      // Preserve user display names and GeoJSON coordinates
      createdShipment.origin = originText.trim();
      createdShipment.destination = destinationText.trim();
      createdShipment.originCoordinates = [originCoords[0], originCoords[1]];
      createdShipment.destinationCoordinates = [destinationCoords[0], destinationCoords[1]];
      createdShipment.id = shipmentId.trim() || createdShipment.id;

      // 6. Build RouteOption for Leaflet map if ORS returned route coordinates
      let newRouteOption: RouteOption | undefined = undefined;
      if (orsRoute && orsRoute.coordinates.length > 0) {
        newRouteOption = {
          id: `ROUTE-${createdShipment.id}`,
          shipmentId: createdShipment.id,
          name: `${originText} ➔ ${destinationText} Corridor (${orsRoute.distanceKm} km)`,
          distanceKm: orsRoute.distanceKm,
          estimatedMinutes: orsRoute.durationMinutes,
          riskScore: priority === 1 ? 0.08 : 0.16,
          disruptionProbability: 0.09,
          geometry: orsRoute.coordinates, // [lat, lng] for Leaflet
          recommended: true,
          via: orsRoute.via || `${originText} ➔ ${destinationText}`
        };
      }

      // 7. Refresh GET /shipments/list from backend
      try {
        const refreshed = await shipmentApi.getAll();
        if (refreshed && refreshed.length > 0) {
          setShipments(refreshed);
        }
      } catch (err) {
        console.warn("Could not refresh shipments list after creation:", err);
      }

      // 8. Add to shipment store and select it
      addShipment(createdShipment, newRouteOption);
      selectShipment(createdShipment.id);

      if (onCreated) {
        onCreated(createdShipment.id);
      }

      onClose();

      // Automatically navigate to Dashboard to view the newly created route on the map
      navigate("/dashboard");
    } catch (err: unknown) {
      console.error("Failed to create shipment:", err);
      const errMsg = formatAxiosError(err, "Server error while creating shipment. Please try again.");
      setSubmissionError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,51,86,0.25)] border border-[#e5e8ee] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e8ee] bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003356] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">local_shipping</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#003356] tracking-tight">
                  Create Consignment & Dispatch
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#cfe4ff] text-[#001d34] text-[10px] font-bold uppercase">
                  NER Logistics
                </span>
              </div>
              <p className="text-xs text-[#72777f]">
                Assign driver, vehicle, critical freight parameters & transit schedules
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form id={formId} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">
          {/* Authentication Required Warning Banner */}
          {!isAuthenticated && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-amber-700 shrink-0">lock</span>
                <div>
                  <strong className="block text-amber-950 font-bold">Authentication Required:</strong>
                  <span>You must log in to create a shipment on the live backend server.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickSignIn}
                disabled={isSigningIn}
                className="px-3.5 py-1.5 rounded-lg bg-[#003356] hover:bg-[#174a73] text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSigningIn ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">login</span>
                    <span>Sign In (test@test.com)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Submission Error Banner */}
          {submissionError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
              <span className="font-semibold">{submissionError}</span>
            </div>
          )}

          {/* Direct Call notification banner */}
          {callNotice && (
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-sky-600 animate-pulse">
                  ring_volume
                </span>
                <span>{callNotice}</span>
              </div>
              <a
                href={`tel:${currentDriver.phone.replace(/[^0-9+]/g, "")}`}
                className="px-2.5 py-1 rounded bg-[#003356] text-white text-[11px] font-bold shrink-0 hover:bg-[#174a73] transition-colors"
              >
                Dial Directly
              </a>
            </div>
          )}

          {/* Section 1: Consignment ID, Commodity, Weight & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            {/* Consignment ID */}
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#181c20]">Consignment ID</label>
                <button
                  type="button"
                  onClick={() => setShipmentId(generateNewId())}
                  className="text-[10px] text-[#174a73] hover:underline flex items-center gap-0.5 cursor-pointer"
                  title="Generate new ID"
                >
                  <span className="material-symbols-outlined text-[13px]">refresh</span>
                  <span>New ID</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
                placeholder="e.g. SHP-2026-089"
                className="w-full h-10 px-3 rounded-xl bg-[#f1f4fa] text-xs font-mono font-semibold text-[#003356] border border-[#e5e8ee] focus:border-[#174a73] focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            {/* Cargo / Shipment Type */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#181c20]">Cargo / Commodity Type</label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f1f4fa] text-xs font-medium text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:bg-white focus:outline-none transition-colors"
              >
                {cargoCommodityPresets.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Consignment Weight (kg) */}
            <div className="sm:col-span-1 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#181c20]">Weight (kg)</label>
              <input
                type="number"
                min={10}
                max={40000}
                required
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(1, Number(e.target.value)))}
                placeholder="1200"
                className="w-full h-10 px-3 rounded-xl bg-[#f1f4fa] text-xs font-semibold text-[#003356] border border-[#e5e8ee] focus:border-[#174a73] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Priority Ribbon */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#181c20]">Dispatch Priority</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#f1f4fa] rounded-xl border border-[#e5e8ee]">
              {[
                { level: 1, label: "P1 — Emergency", sub: "Critical Vaccines / Medical", color: "bg-[#ffdad6] text-[#ba1a1a]" },
                { level: 2, label: "P2 — Essential", sub: "Food & Grid Hardware", color: "bg-[#ffedd5] text-[#c2410c]" },
                { level: 3, label: "P3 — Standard", sub: "Commercial Freight", color: "bg-[#cfe4ff] text-[#001d34]" }
              ].map((p) => {
                const isSelected = priority === p.level;
                return (
                  <button
                    key={p.level}
                    type="button"
                    onClick={() => setPriority(p.level as 1 | 2 | 3)}
                    className={`py-2 px-2.5 text-left rounded-lg transition-all cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? "bg-white shadow-sm ring-2 ring-[#003356]/20 font-bold"
                        : "text-[#42474e] hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#181c20]">{p.label}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#003356]" />}
                    </div>
                    <span className="text-[10px] text-[#72777f] truncate">{p.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Origin & Destination Corridor with Text Input and Autocomplete */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-xl bg-[#f8fafc] border border-[#e5e8ee]">
            {/* Start Location (Text Input -> GeoJSON Coordinates) */}
            <div ref={originWrapperRef} className="relative flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#003356] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Start Location</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">Origin Hub</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={originText}
                  onChange={(e) => handleOriginInputChange(e.target.value)}
                  onFocus={() => setOriginSuggestionsOpen(true)}
                  placeholder="Type city name (e.g. Guwahati)"
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-white text-xs font-semibold text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:outline-none"
                />
                <span className="absolute right-2.5 top-2.5 material-symbols-outlined text-[18px] text-slate-400 pointer-events-none">
                  location_on
                </span>
              </div>

              {/* GeoJSON Confirmation Badge */}
              <div className="flex items-center justify-between text-[11px] px-1">
                <span className="font-mono text-emerald-700 flex items-center gap-1 text-[10px]">
                  <span className="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>
                  <span>[{originCoords[0].toFixed(4)}, {originCoords[1].toFixed(4)}]</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">[lng, lat]</span>
              </div>

              {/* Origin Autocomplete Suggestions */}
              {originSuggestionsOpen && originSuggestions.length > 0 && (
                <div className="absolute top-[68px] left-0 right-0 z-30 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {originSuggestions.map((loc) => (
                    <button
                      key={`origin-${loc.name}`}
                      type="button"
                      onClick={() => handleSelectOriginLocation(loc)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col">
                        <strong className="text-slate-800 font-semibold">{loc.name}</strong>
                        <span className="text-[10px] text-slate-500 truncate">{loc.fullName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {loc.coordinates[0].toFixed(2)}, {loc.coordinates[1].toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Location (Text Input -> GeoJSON Coordinates) */}
            <div ref={destinationWrapperRef} className="relative flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#003356] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>Destination</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">Terminal Hub</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={destinationText}
                  onChange={(e) => handleDestinationInputChange(e.target.value)}
                  onFocus={() => setDestinationSuggestionsOpen(true)}
                  placeholder="Type city name (e.g. Shillong)"
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-white text-xs font-semibold text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:outline-none"
                />
                <span className="absolute right-2.5 top-2.5 material-symbols-outlined text-[18px] text-slate-400 pointer-events-none">
                  flag
                </span>
              </div>

              {/* GeoJSON Confirmation Badge */}
              <div className="flex items-center justify-between text-[11px] px-1">
                <span className="font-mono text-emerald-700 flex items-center gap-1 text-[10px]">
                  <span className="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>
                  <span>[{destinationCoords[0].toFixed(4)}, {destinationCoords[1].toFixed(4)}]</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">[lng, lat]</span>
              </div>

              {/* Destination Autocomplete Suggestions */}
              {destinationSuggestionsOpen && destinationSuggestions.length > 0 && (
                <div className="absolute top-[68px] left-0 right-0 z-30 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {destinationSuggestions.map((loc) => (
                    <button
                      key={`dest-${loc.name}`}
                      type="button"
                      onClick={() => handleSelectDestinationLocation(loc)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col">
                        <strong className="text-slate-800 font-semibold">{loc.name}</strong>
                        <span className="text-[10px] text-slate-500 truncate">{loc.fullName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {loc.coordinates[0].toFixed(2)}, {loc.coordinates[1].toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Driver Selection & Rich Driver Details Card */}
          <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-[#eff6ff]/70 border border-[#cfe4ff]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#003356] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#27638c]">badge</span>
                <span>Select Assigned Driver</span>
              </label>
              <span className="text-[11px] text-[#27638c] font-semibold">
                {registeredDrivers.length} Certified Regional Drivers
              </span>
            </div>

            {/* Driver Selector Dropdown */}
            <select
              value={selectedDriverId}
              onChange={(e) => handleDriverChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white text-xs font-semibold text-[#003356] border border-[#cfe4ff] focus:border-[#174a73] focus:outline-none"
            >
              {registeredDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} • {d.vehicleNumber} ({d.vehicleType.split("(")[0].trim()})
                </option>
              ))}
            </select>

            {/* Prominent Driver Profile Card with Photo, Phone & Call Driver action */}
            <div className="mt-1 p-3 rounded-xl bg-white border border-[#cfe4ff] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
              <div className="flex items-center gap-3">
                {/* Driver Profile Photo: small circular profile image with graceful fallback */}
                <div className="relative shrink-0">
                  {!imageErrors[currentDriver.id] ? (
                    <img
                      src={currentDriver.photoUrl}
                      alt={currentDriver.name}
                      onError={() => setImageErrors((prev) => ({ ...prev, [currentDriver.id]: true }))}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#003356] shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#003356] text-white font-bold text-sm flex items-center justify-center border-2 border-white shadow-xs">
                      {currentDriver.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
                    title="Driver Active"
                  />
                </div>

                {/* Driver Name, Vehicle Number & Vehicle Type */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#003356]">{currentDriver.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      ★ {currentDriver.rating || 4.9}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#42474e] mt-0.5">
                    <span className="font-mono font-semibold text-[#181c20]">
                      {currentDriver.vehicleNumber}
                    </span>
                    <span>•</span>
                    <span className="text-[11px] text-[#72777f]">{currentDriver.vehicleType}</span>
                  </div>

                {/* Direct Call notification banner */}
                <div className="flex items-center gap-1.5 text-xs text-[#174a73] font-semibold mt-1">
                  <span className="material-symbols-outlined text-[15px] text-[#27638c]">phone_iphone</span>
                  <span>{currentDriver.phone}</span>
                </div>
              </div>
            </div>

            {/* Call Driver Action Button */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleCallDriver}
                className="flex-1 sm:flex-initial h-9 px-3.5 rounded-lg bg-[#005148] hover:bg-[#003d36] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                title={`Call ${currentDriver.name}`}
              >
                <span className="material-symbols-outlined text-[17px]">call</span>
                <span>Call Driver</span>
              </button>

              <a
                href={`tel:${currentDriver.phone.replace(/[^0-9+]/g, "")}`}
                className="h-9 w-9 rounded-lg border border-[#cfe4ff] hover:bg-[#eff6ff] text-[#003356] flex items-center justify-center transition-colors cursor-pointer"
                title="Direct Phone Call Link"
              >
                <span className="material-symbols-outlined text-[17px]">phone_forwarded</span>
              </a>
            </div>
          </div>

          {/* Backend ObjectId Integration Chip */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 px-2 py-1 bg-white/80 rounded-lg border border-[#cfe4ff]/60 text-[10px] text-[#55606d] font-mono">
            <span>
              Driver Backend ID: <strong className="text-[#003356]">{currentDriver.backendId || currentDriver.id}</strong>
            </span>
            <span>
              Vehicle Backend ID: <strong className="text-[#003356]">{currentDriver.backendVehicleId || selectedVehicleId}</strong>
            </span>
          </div>
        </div>

        {/* Section 4: Vehicle Selection Sync */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#181c20]">Vehicle Unit Selection</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#f1f4fa] text-xs font-semibold text-[#003356] border border-[#e5e8ee] focus:border-[#174a73] focus:bg-white focus:outline-none"
            >
              {registeredDrivers.map((d) => (
                <option key={d.id} value={d.backendVehicleId || d.vehicleId}>
                  {d.vehicleNumber} — {d.vehicleType}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#181c20]">Transit Fleet Classification</label>
            <div className="h-10 px-3 rounded-xl bg-[#f1f4fa] flex items-center justify-between text-xs text-[#42474e] border border-[#e5e8ee]">
              <span className="font-semibold text-[#003356]">{currentDriver.vehicleType}</span>
              <span className="text-[10px] font-mono text-[#72777f]">{currentDriver.vehicleNumber}</span>
            </div>
          </div>
        </div>

        {/* Section: Consignment Package / Cargo Proof Image (Required, max 45 KB) */}
        <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-[#f8fafc] border border-[#e5e8ee]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-[#003356] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-[#27638c]">photo_camera</span>
              <span>Consignment Cargo Proof / Image <span className="text-rose-600 font-bold">*</span></span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#cfe4ff] text-[#001d34]">
                Required • Max 45 KB
              </span>
              <button
                type="button"
                onClick={handleGenerateSampleImage}
                disabled={isCompressingImage}
                className="text-[11px] text-[#005148] hover:text-[#003d36] font-bold flex items-center gap-1 cursor-pointer underline disabled:opacity-50"
                title="Generate verified consignment badge image <= 45 KB"
              >
                <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                <span>Use Sample Cargo Photo</span>
              </button>
            </div>
          </div>

          {/* Image Dropzone & Preview */}
          {!selectedImage ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleImageDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                isDragging ? "border-[#003356] bg-[#eff6ff]" : "border-[#c2c7cf] hover:border-[#174a73] bg-white"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#003356] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
              </div>
              <div className="text-xs text-[#181c20]">
                <span className="font-bold text-[#003356]">Click to upload</span> or drag and drop consignment image
              </div>
              <p className="text-[10px] text-[#72777f]">
                JPG, PNG or WEBP (automatically compressed on client to &le; 45 KB)
              </p>
              {isCompressingImage && (
                <div className="flex items-center gap-2 text-xs text-[#003356] font-semibold mt-1">
                  <span className="w-3.5 h-3.5 border-2 border-[#003356] border-t-transparent rounded-full animate-spin" />
                  <span>Compressing image to &le; 45 KB...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#cfe4ff] shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={selectedImage.dataUrl}
                  alt="Cargo Proof Preview"
                  className="w-14 h-14 rounded-lg object-cover border-2 border-[#003356] shadow-xs shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#003356] truncate max-w-[220px]">
                    {selectedImage.file.name || "consignment_proof.jpg"}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      <span>{selectedImage.sizeKb} KB (&le; 45 KB)</span>
                    </span>
                    <span className="text-[10px] text-[#72777f]">
                      {selectedImage.width}×{selectedImage.height}px
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[#003356] hover:underline font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-semibold px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {imageError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 animate-in fade-in">
              <span className="material-symbols-outlined text-[16px] text-rose-600">error</span>
              <span>{imageError}</span>
            </div>
          )}
        </div>

        {/* Section 5: Pickup and Expected Delivery Schedules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#181c20] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#27638c]">calendar_today</span>
                <span>Pickup Date & Time</span>
              </label>
              <input
                type="datetime-local"
                required
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f1f4fa] text-xs text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#181c20] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#005148]">event_available</span>
                <span>Expected Delivery Date & Time</span>
              </label>
              <input
                type="datetime-local"
                required
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f1f4fa] text-xs text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section 6: Receiver / Contact Details */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#f8fafc] border border-[#e5e8ee]">
            <label className="text-xs font-bold text-[#003356] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-[#27638c]">contact_phone</span>
              <span>Receiver / Point of Contact Details</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Receiver Officer Name"
                className="w-full h-9 px-3 rounded-lg bg-white text-xs text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:outline-none"
              />
              <input
                type="text"
                required
                value={receiverFacility}
                onChange={(e) => setReceiverFacility(e.target.value)}
                placeholder="Receiving Facility / Unit"
                className="w-full h-9 px-3 rounded-lg bg-white text-xs text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:outline-none"
              />
              <input
                type="text"
                required
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                placeholder="Contact Phone #"
                className="w-full h-9 px-3 rounded-lg bg-white text-xs text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 7: Special Instructions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#181c20] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#d97706]">assignment</span>
              <span>Special Instructions / Transit Protocols</span>
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Temperature monitoring requirements, hazardous materials protocol, road clearance permit note..."
              className="w-full p-3 rounded-xl bg-[#f1f4fa] text-xs text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:bg-white focus:outline-none resize-none"
            />
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#e5e8ee] bg-[#f8fafc]">
          <div className="flex items-center gap-2 text-[11px] text-[#72777f]">
            <span className="material-symbols-outlined text-[16px] text-[#005148]">verified</span>
            <span>Auto-linked with OpenRouteService Engine</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl border border-[#c2c7cf] hover:bg-[#ebeef4] text-[#42474e] font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={formId}
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl bg-[#003356] hover:bg-[#174a73] text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Calculating & Dispatching...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_task</span>
                  <span>Create Shipment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
