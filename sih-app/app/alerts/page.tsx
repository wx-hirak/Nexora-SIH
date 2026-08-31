'use client';

import React, { useEffect } from 'react';
import { useAppState } from '@/context/AppStateContext';
import Home from '../page';

export default function AlertsPage() {
  const { setActiveTab } = useAppState();

  useEffect(() => {
    setActiveTab('alerts');
  }, [setActiveTab]);

  return <Home />;
}
