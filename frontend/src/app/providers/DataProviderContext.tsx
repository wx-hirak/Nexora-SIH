/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo } from "react";
import type { DataProvider } from "@/services/dataProvider";
import { mockDataProvider } from "@/services/mock/mockDataProvider";
import { liveApiProvider } from "@/services/live/liveApiProvider";

interface DataProviderContextValue {
  provider: DataProvider;
  sourceType: "mock" | "live";
}

const DataProviderContext = createContext<DataProviderContextValue | null>(null);

export const DataProviderContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const sourceType = (import.meta.env.VITE_DATA_SOURCE || "mock") as "mock" | "live";

  const provider = useMemo<DataProvider>(() => {
    return sourceType === "live" ? liveApiProvider : mockDataProvider;
  }, [sourceType]);

  return (
    <DataProviderContext.Provider value={{ provider, sourceType }}>
      {children}
    </DataProviderContext.Provider>
  );
};

export const useDataProvider = (): DataProviderContextValue => {
  const context = useContext(DataProviderContext);
  if (!context) {
    throw new Error("useDataProvider must be used within a DataProviderContextProvider");
  }
  return context;
};
