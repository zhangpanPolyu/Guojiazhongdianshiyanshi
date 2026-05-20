import type {
  Equipment,
  Alert,
  Metric,
  EquipmentCategory,
  StatusBreakdown,
  EnvironmentMetrics,
  DashboardSummary,
  EquipmentStatus,
  AlertSeverity,
  MetricTrend
} from "@workspace/api-client-react";

export type ViewType = 'building' | 'schematic' | 'topology';
export type UserRole = 'operator' | 'engineer' | 'manager';
export type Language = 'zh' | 'en';

export interface PanelConfig {
  id: string;
  title: string;
  titleEn: string;
  visible: boolean;
}

export type {
  Equipment,
  Alert,
  Metric,
  EquipmentCategory,
  StatusBreakdown,
  EnvironmentMetrics,
  DashboardSummary,
  EquipmentStatus,
  AlertSeverity,
  MetricTrend
};
