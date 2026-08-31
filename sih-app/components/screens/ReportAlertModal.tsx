'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/AppStateContext';
import { IncidentCategory, AlertSeverity } from '@/data/types';
import confetti from 'canvas-confetti';

export const ReportAlertModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, addIncidentReport } = useAppState();

  const [incidentType, setIncidentType] = useState<IncidentCategory>('landslide');
  const [severity, setSeverity] = useState<AlertSeverity>('high');
  const [locationName, setLocationName] = useState('NH-6 Hill Trace Corridor');
  const [routeCorridor, setRouteCorridor] = useState('NH-6 (Meghalaya Sector)');
  const [notes, setNotes] = useState('');
  const [shareGps, setShareGps] = useState(true);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isReportModalOpen) return null;

  const incidentTypes: { id: IncidentCategory; label: string; icon: string; color: string }[] = [
    { id: 'fog', label: 'Heavy Fog', icon: 'foggy', color: 'text-primary' },
    { id: 'landslide', label: 'Landslide', icon: 'landslide', color: 'text-status-amber' },
    { id: 'roadblock', label: 'Road Block', icon: 'construction', color: 'text-status-red' },
    { id: 'medical', label: 'Medical Emergency', icon: 'medical_services', color: 'text-status-red' },
    { id: 'vehicle', label: 'Vehicle Issue', icon: 'car_crash', color: 'text-status-amber' },
    { id: 'other', label: 'Other Hazard', icon: 'help', color: 'text-secondary' }
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
        setHasPhoto(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Create random offset coordinate in Meghalaya/Assam
      const lat = 25.5788 + (Math.random() - 0.5) * 0.4;
      const lng = 91.8933 + (Math.random() - 0.5) * 0.4;

      addIncidentReport({
        incidentType,
        severity,
        locationName: locationName || `${incidentType.toUpperCase()} Incident`,
        routeCorridor: routeCorridor || 'GS Road / NH-6',
        coordinates: [lat, lng],
        notes: notes || 'Immediate hazard alert verified by field dispatch unit.',
        hasPhoto,
        photoUrl: photoPreview || undefined,
        shareGps,
        reporterName: 'Regional Field Responder'
      });

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });

      setIsSubmitting(false);
      setIsReportModalOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => setIsReportModalOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-surface-container-lowest border border-border-subtle shadow-2xl rounded-2xl p-6 z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-error-container/40 text-status-red flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">report</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Report Travel Incident & Hazard
              </h3>
              <p className="font-label-sm text-xs text-on-surface-variant">
                NER Intelligence Dispatch System
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
          {/* Incident Type Grid */}
          <div>
            <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider block mb-2 font-bold">
              Incident Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {incidentTypes.map(item => {
                const isSelected = incidentType === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setIncidentType(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'border-primary bg-primary-container/10 shadow-xs ring-1 ring-primary'
                        : 'border-border-subtle bg-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-2xl mb-1.5 ${item.color}`}>
                      {item.icon}
                    </span>
                    <span className="font-headline-sm text-xs font-semibold text-on-surface leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity Selector */}
          <div>
            <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider block mb-2 font-bold">
              Severity Level
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as AlertSeverity[]).map(sev => {
                const isSelected = severity === sev;
                return (
                  <button
                    type="button"
                    key={sev}
                    onClick={() => setSeverity(sev)}
                    className={`flex-1 py-2.5 px-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary-container/10 font-bold shadow-xs'
                        : 'border-border-subtle bg-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        sev === 'high'
                          ? 'bg-status-red'
                          : sev === 'medium'
                          ? 'bg-status-amber'
                          : 'bg-status-green'
                      }`}
                    />
                    <span className="capitalize text-xs font-headline-sm text-on-surface">
                      {sev}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Corridor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-label-caps text-[11px] text-on-surface-variant uppercase block mb-1">
                Hazard Title / Spot
              </label>
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="e.g. NH-6 Sonapur Landslide"
                className="w-full p-2.5 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-medium text-on-surface"
                required
              />
            </div>
            <div>
              <label className="font-label-caps text-[11px] text-on-surface-variant uppercase block mb-1">
                Corridor / Highway
              </label>
              <input
                type="text"
                value={routeCorridor}
                onChange={e => setRouteCorridor(e.target.value)}
                placeholder="e.g. NH-27 Guwahati-Shillong"
                className="w-full p-2.5 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-medium text-on-surface"
                required
              />
            </div>
          </div>

          {/* Photo Evidence Uploader */}
          <div>
            <label className="font-label-caps text-[11px] text-on-surface-variant uppercase block mb-1">
              Photo Evidence (Optional)
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-outline-variant bg-surface hover:bg-surface-container-low transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">add_a_photo</span>
              </div>
              <div className="flex-1">
                <span className="font-headline-sm text-xs font-semibold text-on-surface block">
                  {hasPhoto ? 'Photo Attached (Click to replace)' : 'Attach Incident Photo'}
                </span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">
                  Helps dispatch teams verify terrain hazards
                </span>
              </div>
            </label>
          </div>

          {/* Share GPS Location Card */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-base">location_on</span>
              </div>
              <div>
                <span className="font-headline-sm text-xs font-bold text-on-surface block">
                  Attach Live GPS Coordinates
                </span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">
                  25.5788° N, 91.8933° E (Shillong Sector)
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={shareGps}
              onChange={e => setShareGps(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="font-label-caps text-[11px] text-on-surface-variant uppercase block mb-1">
              Field Notes & Road Condition
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add details regarding blockage width, alternate trails, or emergency assistance needed..."
              className="w-full bg-surface-container-low border border-border-subtle rounded-xl p-3 font-body-md text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Modal Footer / Submit */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-border-subtle text-xs font-bold text-on-surface hover:bg-surface-container-low"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-headline-sm text-xs font-bold shadow-sm hover:brightness-110 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base">send</span>
              {isSubmitting ? 'Broadcasting...' : 'Submit Incident Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
