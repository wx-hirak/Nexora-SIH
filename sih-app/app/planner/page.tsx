'use client';

import React, { useEffect } from 'react';
import { useAppState } from '@/context/AppStateContext';
import Home from '../page';

export default function PlannerPage() {
  const { setActiveTab } = useAppState();

  useEffect(() => {
    setActiveTab('trips');
  }, [setActiveTab]);

  return <Home />;
}
