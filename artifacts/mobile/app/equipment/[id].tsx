import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Sparkline } from "@/components/Sparkline";
import { useColors } from "@/hooks/useColors";
import {
  getGetEquipmentMetricsHistoryQueryOptions,
  getGetEquipmentMetricsQueryOptions,
  getGetEquipmentQueryOptions,
  getListAlertsQueryOptions,
} from "@workspace/api-client-react";
import type { Alert, Metric, MetricHistory } from "@workspace/api-client-react";

const STATUS_COLORS: Record<string, string> = {
  running: "#00FF66",
  warning: "#FFB800",
  fault: "#FF003C",
  offline: "#4A6080",
  maintenance: "#00F0FF",
};

const STATUS_LABELS: Record<string, string> = {
  running: "RUNNING",
  warning: "WARNING",
  fault: "FAULT",
  offline: "OFFLINE",
  maintenance: "MAINTENANCE",
};

function TrendIcon({ trend }: { trend?: string | null }) {
  const colors = useColors();
  if (!trend || trend === "stable") {
    return <Feather name="minus" size={14} color={colors.mutedForeground} />;
  }
  return (
    <Feather
      name={trend === "up" ? "trending-up" : "trending-down"}
      size={14}
      color={trend === "up" ? "#FF003C" : "#00FF66"}
    />
  );
}

function MetricCard({
  metric,
  historyEntry,
}: {
  metric: Metric;
  historyEntry?: MetricHistory;
}) {
  const colors = useColors();
  const isWarning = metric.trend === "up";
  const isGood = metric.trend === "down";
  const sparkColor = isWarning ? "#FFB800" : colors.sciCyan;

  const sparkData = historyEntry?.history?.map((h) => h.value) ?? [];

  return (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor: colors.card,
          borderColor: isWarning
            ? "#FFB800" + "44"
            : isGood
              ? "#00FF6622"
              : colors.border,
        },
      ]}
    >
      <View style={styles.metricHeader}>
        <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
          {metric.label}
        </Text>
        <TrendIcon trend={metric.trend} />
      </View>
      <Text style={[styles.metricValue, { color: sparkColor }]}>
        {metric.value.toFixed(1)}
        <Text style={[styles.metricUnit, { color: colors.mutedForeground }]}>
          {" "}
          {metric.unit}
        </Text>
      </Text>
      {sparkData.length >= 2 && (
        <View style={styles.sparklineContainer}>
          <Sparkline
            data={sparkData}
            width={120}
            height={32}
            color={sparkColor}
            strokeWidth={1.5}
            showGradient
          />
        </View>
      )}
    </View>
  );
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#FF003C",
  warning: "#FFB800",
  info: "#00F0FF",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AlertHistoryItem({ alert }: { alert: Alert }) {
  const colors = useColors();
  const sevColor = SEVERITY_COLORS[alert.severity] ?? colors.sciCyan;
  return (
    <View
      style={[
        styles.alertItem,
        {
          backgroundColor: colors.card,
          borderColor: alert.acknowledged ? colors.border : sevColor + "44",
          borderLeftColor: alert.acknowledged ? colors.border : sevColor,
          opacity: alert.acknowledged ? 0.55 : 1,
        },
      ]}
    >
      <View style={styles.alertRow}>
        <View
          style={[
            styles.alertBadge,
            {
              borderColor: alert.acknowledged ? colors.border : sevColor,
            },
          ]}
        >
          <Text
            style={[
              styles.alertBadgeText,
              {
                color: alert.acknowledged ? colors.mutedForeground : sevColor,
              },
            ]}
          >
            {alert.severity.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.alertTime, { color: colors.mutedForeground }]}>
          {timeAgo(alert.timestamp)}
        </Text>
        {alert.acknowledged && (
          <Feather name="check-circle" size={12} color={colors.mutedForeground} />
        )}
      </View>
      <Text
        style={[
          styles.alertMsg,
          {
            color: alert.acknowledged ? colors.mutedForeground : colors.foreground,
          },
        ]}
      >
        {alert.messageEn}
      </Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.infoRow}>
      <Feather name={icon as never} size={14} color={colors.mutedForeground} />
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[styles.infoValue, { color: valueColor ?? colors.foreground }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export default function EquipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const {
    data: equipment,
    isLoading,
    isError,
    refetch,
  } = useQuery(getGetEquipmentQueryOptions(id ?? ""));

  const { data: metrics, isLoading: metricsLoading } = useQuery(
    getGetEquipmentMetricsQueryOptions(id ?? "")
  );

  const { data: metricHistory } = useQuery({
    ...getGetEquipmentMetricsHistoryQueryOptions(id ?? ""),
    refetchInterval: 10000,
  });

  const { data: equipmentAlerts, isLoading: alertsLoading } = useQuery(
    getListAlertsQueryOptions({ equipmentId: id ?? "" })
  );

  if (isLoading) {
    return (
      <View
        style={[styles.container, styles.centered, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator color={colors.sciCyan} size="large" />
      </View>
    );
  }

  if (isError || !equipment) {
    return (
      <View
        style={[styles.container, styles.centered, { backgroundColor: colors.background }]}
      >
        <Feather name="alert-circle" size={40} color={colors.sciRed} />
        <Text style={[styles.errorText, { color: colors.sciRed }]}>
          Equipment not found
        </Text>
        <Pressable
          style={[styles.retryBtn, { borderColor: colors.sciCyan }]}
          onPress={() => refetch()}
        >
          <Text style={[styles.retryText, { color: colors.sciCyan }]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[equipment.status] ?? "#4A6080";
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  const historyByKey = React.useMemo(() => {
    if (!metricHistory) return {};
    return Object.fromEntries(metricHistory.map((h) => [h.key, h]));
  }, [metricHistory]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.heroSection,
          { borderBottomColor: statusColor + "44", borderBottomWidth: 1 },
        ]}
      >
        <View style={styles.heroTop}>
          <View
            style={[styles.statusIndicator, { backgroundColor: statusColor }]}
          />
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {STATUS_LABELS[equipment.status] ?? equipment.status.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.equipmentName, { color: colors.foreground }]}>
          {equipment.nameEn}
        </Text>
        {equipment.name !== equipment.nameEn && (
          <Text
            style={[styles.equipmentNameAlt, { color: colors.mutedForeground }]}
          >
            {equipment.name}
          </Text>
        )}
      </View>

      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.sciCyan }]}>
          DETAILS
        </Text>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <InfoRow
            icon="map-pin"
            label="Location"
            value={equipment.locationEn ?? equipment.location}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow icon="tag" label="Category" value={equipment.category} />
          {equipment.model && (
            <>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <InfoRow icon="cpu" label="Model" value={equipment.model} />
            </>
          )}
          {equipment.serialNumber && (
            <>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <InfoRow
                icon="hash"
                label="Serial"
                value={equipment.serialNumber}
              />
            </>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow
            icon="tool"
            label="Last Maintenance"
            value={new Date(equipment.lastMaintenance).toLocaleDateString()}
          />
          {equipment.predictedFailureDate && (
            <>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <InfoRow
                icon="alert-triangle"
                label="Predicted Failure"
                value={new Date(
                  equipment.predictedFailureDate
                ).toLocaleDateString()}
                valueColor={colors.sciAmber}
              />
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.sciCyan }]}>
          LIVE METRICS
        </Text>
        {metricsLoading ? (
          <View style={styles.metricsLoading}>
            <ActivityIndicator color={colors.sciCyan} />
            <Text
              style={[styles.loadingText, { color: colors.mutedForeground }]}
            >
              Loading metrics...
            </Text>
          </View>
        ) : !metrics || metrics.length === 0 ? (
          <View style={styles.metricsEmpty}>
            <Feather name="bar-chart-2" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No metrics available
            </Text>
          </View>
        ) : (
          <View style={styles.metricsGrid}>
            {metrics.map((m) => (
              <MetricCard
                key={m.key}
                metric={m}
                historyEntry={historyByKey[m.key]}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.sciCyan }]}>
          ALERT HISTORY
        </Text>
        {alertsLoading ? (
          <View style={styles.metricsLoading}>
            <ActivityIndicator color={colors.sciCyan} />
            <Text
              style={[styles.loadingText, { color: colors.mutedForeground }]}
            >
              Loading alerts...
            </Text>
          </View>
        ) : !equipmentAlerts || equipmentAlerts.length === 0 ? (
          <View
            style={[
              styles.metricsEmpty,
              {
                backgroundColor: colors.card,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="bell-off" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No alerts for this equipment
            </Text>
          </View>
        ) : (
          <View style={styles.alertList}>
            {[...equipmentAlerts]
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .map((a) => (
                <AlertHistoryItem key={a.id} alert={a} />
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center", gap: 12 },
  scrollContent: { paddingTop: 8 },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 20,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusIndicator: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  equipmentName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
  },
  equipmentNameAlt: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  section: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 10,
  },
  infoCard: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    width: 110,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
  },
  divider: { height: 1, marginHorizontal: 14 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    width: "47.5%",
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  metricLabel: { fontSize: 11, fontFamily: "Inter_500Medium", flex: 1 },
  metricValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  metricUnit: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sparklineContainer: {
    marginTop: 8,
    alignItems: "flex-start",
    overflow: "hidden",
  },
  metricsLoading: { alignItems: "center", gap: 8, paddingVertical: 24 },
  metricsEmpty: { alignItems: "center", gap: 8, paddingVertical: 24 },
  loadingText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  errorText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  retryBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  alertList: { gap: 8 },
  alertItem: {
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 12,
    gap: 6,
  },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  alertBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  alertBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  alertTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  alertMsg: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
});
