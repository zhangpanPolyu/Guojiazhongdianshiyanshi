import { useQuery } from "@tanstack/react-query";

export interface MetricHistory {
  key: string;
  label: string;
  unit: string;
  history: number[];
}

async function fetchEquipmentMetricsHistory(id: string): Promise<MetricHistory[]> {
  const res = await fetch(`/api/equipment/${id}/metrics/history`);
  if (!res.ok) throw new Error("Failed to fetch equipment metrics history");
  return res.json();
}

export function useEquipmentMetricsHistory(id: string | null, refetchInterval = 8000) {
  return useQuery<MetricHistory[]>({
    queryKey: ["equipment", id, "metrics", "history"],
    queryFn: () => fetchEquipmentMetricsHistory(id!),
    enabled: !!id,
    refetchInterval,
  });
}
