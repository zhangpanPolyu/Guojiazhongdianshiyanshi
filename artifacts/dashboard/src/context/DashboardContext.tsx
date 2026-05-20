import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { useGetRecentAlerts, getGetRecentAlertsQueryKey } from '@workspace/api-client-react';
import type { Alert } from '../types';
import { ViewType, UserRole, Language } from '../types';

export type RightPanelTab = 'situational' | 'alerts';

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
  rightPanelTab: RightPanelTab;
  setRightPanelTab: (tab: RightPanelTab) => void;
  hasNewAlerts: boolean;
  clearNewAlerts: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ViewType>('building');
  const [userRole, setUserRole] = useState<UserRole>('operator');
  const [language, setLanguage] = useState<Language>('zh');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('situational');
  const [hasNewAlerts, setHasNewAlerts] = useState(false);
  const seenAlertIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const { data: alertsData = [], isLoading: alertsLoading } = useGetRecentAlerts({
    query: {
      queryKey: getGetRecentAlertsQueryKey(),
      refetchInterval: 7000,
    },
  });

  const alerts = alertsData as Alert[];

  useEffect(() => {
    if (!alerts.length) return;

    if (!initializedRef.current) {
      alerts.forEach(a => seenAlertIdsRef.current.add(a.id));
      initializedRef.current = true;
      return;
    }

    const newAlerts = alerts.filter(a => !seenAlertIdsRef.current.has(a.id));
    if (newAlerts.length > 0) {
      setHasNewAlerts(true);
      newAlerts.forEach(a => seenAlertIdsRef.current.add(a.id));
    }
  }, [alerts]);

  const clearNewAlerts = () => setHasNewAlerts(false);

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
        alerts,
        alertsLoading,
        rightPanelTab,
        setRightPanelTab,
        hasNewAlerts,
        clearNewAlerts,
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
