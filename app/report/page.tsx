'use client';

import React, { useEffect } from 'react';
import { useAppState } from '@/context/AppStateContext';
import Home from '../page';

export default function ReportPage() {
  const { setIsReportModalOpen } = useAppState();

  useEffect(() => {
    setIsReportModalOpen(true);
  }, [setIsReportModalOpen]);

  return <Home />;
}
