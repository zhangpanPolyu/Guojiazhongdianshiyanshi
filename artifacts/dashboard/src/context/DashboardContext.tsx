import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useGetRecentAlerts, getGetRecentAlertsQueryKey } from '@workspace/api-client-react';
import type { Alert } from '../types';
import { ViewType, UserRole, Language } from '../types';

interface DashboardContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedEquipmentId: string | null;
  setSelectedEquipmentId: (id: string | null) => void;
  alerts: Alert[];
  alertsLoading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ViewType>('building');
  const [userRole, setUserRole] = useState<UserRole>('operator');
  const [language, setLanguage] = useState<Language>('zh');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  const { data: alertsData = [], isLoading: alertsLoading } = useGetRecentAlerts({
    query: {
      queryKey: getGetRecentAlertsQueryKey(),
      refetchInterval: 30000,
    },
  });

  return (
    <DashboardContext.Provider
      value={{
        activeView,
        setActiveView,
        userRole,
        setUserRole,
        language,
        setLanguage,
        selectedEquipmentId,
        setSelectedEquipmentId,
        alerts: alertsData as Alert[],
        alertsLoading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
