import { useQuery } from "@tanstack/react-query";

interface EnvReading {
  temperature: number;
  humidity: number;
  vibration: number;
  power: number;
  timestamp: string;
}

async function fetchEnvHistory(): Promise<EnvReading[]> {
  const res = await fetch("/api/metrics/environment/history");
  if (!res.ok) throw new Error("Failed to fetch environment history");
  return res.json();
}

export function useEnvironmentHistory(refetchInterval = 5000) {
  return useQuery<EnvReading[]>({
    queryKey: ["metrics", "environment", "history"],
    queryFn: fetchEnvHistory,
    refetchInterval,
  });
}
