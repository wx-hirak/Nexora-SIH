'use client';

import React, { useEffect } from 'react';
import { useAppState } from '@/context/AppStateContext';
import Home from '../page';

export default function AnalyticsPage() {
  const { setActiveTab } = useAppState();

  useEffect(() => {
    setActiveTab('analytics');
  }, [setActiveTab]);

  return <Home />;
}
