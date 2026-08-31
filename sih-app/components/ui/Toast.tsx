'use client';

import React, { useEffect } from 'react';
import { useAppState } from '@/context/AppStateContext';

export const Toast: React.FC = () => {
  const { toastMessage, setToastMessage } = useAppState();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  if (!toastMessage) return null;

  const bgStyles = {
    success: 'border-status-green/30 bg-surface-container-lowest text-on-surface',
    info: 'border-primary/30 bg-surface-container-lowest text-on-surface',
    warning: 'border-status-amber/40 bg-surface-container-lowest text-on-surface'
  }[toastMessage.type || 'info'];

  const iconStyles = {
    success: 'text-status-green',
    info: 'text-primary',
    warning: 'text-status-amber'
  }[toastMessage.type || 'info'];

  const iconName = {
    success: 'check_circle',
    info: 'info',
    warning: 'warning'
  }[toastMessage.type || 'info'];

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border ${bgStyles}`}
      >
        <span className={`material-symbols-outlined mt-0.5 ${iconStyles}`}>
          {iconName}
        </span>
        <div className="flex-1">
          <h4 className="font-headline-sm text-sm font-bold text-on-surface">
            {toastMessage.title}
          </h4>
          {toastMessage.desc && (
            <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
              {toastMessage.desc}
            </p>
          )}
        </div>
        <button
          onClick={() => setToastMessage(null)}
          className="text-on-surface-variant hover:text-on-surface text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
