import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import {
  acknowledgeAlert,
  getListAlertsQueryKey,
  getListAlertsQueryOptions,
} from "@workspace/api-client-react";
import type { Alert } from "@workspace/api-client-react";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#FF003C",
  warning: "#FFB800",
  info: "#00F0FF",
};

const SEVERITY_ICONS: Record<string, "alert-triangle" | "alert-circle" | "info"> = {
  critical: "alert-circle",
  warning: "alert-triangle",
  info: "info",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AlertCard({
  alert,
  onAcknowledge,
  acknowledging,
}: {
  alert: Alert;
  onAcknowledge: () => void;
  acknowledging: boolean;
}) {
  const colors = useColors();
  const severityColor = SEVERITY_COLORS[alert.severity] ?? colors.sciCyan;
  const icon = SEVERITY_ICONS[alert.severity] ?? "info";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: alert.acknowledged ? colors.border : severityColor + "44",
          borderLeftColor: alert.acknowledged ? colors.border : severityColor,
          opacity: alert.acknowledged ? 0.55 : 1,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <Feather name={icon} size={16} color={alert.acknowledged ? colors.mutedForeground : severityColor} />
          <View style={styles.cardLabels}>
            <Text style={[styles.equipmentName, { color: colors.foreground }]} numberOfLines={1}>
              {alert.equipmentName}
            </Text>
            <View style={[styles.severityBadge, { borderColor: alert.acknowledged ? colors.border : severityColor }]}>
              <Text style={[styles.severityText, { color: alert.acknowledged ? colors.mutedForeground : severityColor }]}>
                {alert.severity.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
          {timeAgo(alert.timestamp)}
        </Text>
      </View>
      <Text style={[styles.messageText, { color: alert.acknowledged ? colors.mutedForeground : colors.foreground }]}>
        {alert.messageEn}
      </Text>
      {!alert.acknowledged && (
        <Pressable
          testID={`ack-alert-${alert.id}`}
          style={({ pressed }) => [
            styles.ackBtn,
            {
              borderColor: severityColor,
              backgroundColor: pressed ? severityColor + "22" : "transparent",
              opacity: acknowledging ? 0.5 : 1,
            },
          ]}
          onPress={onAcknowledge}
          disabled={acknowledging}
        >
          {acknowledging ? (
            <ActivityIndicator size="small" color={severityColor} />
          ) : (
            <>
              <Feather name="check" size={14} color={severityColor} />
              <Text style={[styles.ackText, { color: severityColor }]}>Acknowledge</Text>
            </>
          )}
        </Pressable>
      )}
      {alert.acknowledged && (
        <View style={styles.acknowledgedRow}>
          <Feather name="check-circle" size={12} color={colors.mutedForeground} />
          <Text style={[styles.acknowledgedText, { color: colors.mutedForeground }]}>Acknowledged</Text>
        </View>
      )}
    </View>
  );
}

export default function AlertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const queryClient = useQueryClient();

  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [acknowledging, setAcknowledging] = useState<Set<string>>(new Set());

  const {
    data: alerts,
    isLoading,
    isError,
    refetch,
  } = useQuery(getListAlertsQueryOptions({ acknowledged: showAcknowledged }));

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAcknowledge = async (alertId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAcknowledging((prev) => new Set([...prev, alertId]));
    try {
      await acknowledgeAlert(alertId);
      await queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
    } finally {
      setAcknowledging((prev) => {
        const next = new Set(prev);
        next.delete(alertId);
        return next;
      });
    }
  };

  const activeCount = alerts?.filter((a) => !a.acknowledged).length ?? 0;
  const topPadding = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.background }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: colors.sciCyan }]}>ALERTS</Text>
          {activeCount > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.sciRed }]}>
              <Text style={styles.countText}>{activeCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggle,
              {
                backgroundColor: !showAcknowledged ? colors.sciCyan + "22" : colors.card,
                borderColor: !showAcknowledged ? colors.sciCyan : colors.border,
              },
            ]}
            onPress={() => setShowAcknowledged(false)}
          >
            <Text style={[styles.toggleText, { color: !showAcknowledged ? colors.sciCyan : colors.mutedForeground }]}>
              Active
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggle,
              {
                backgroundColor: showAcknowledged ? colors.sciCyan + "22" : colors.card,
                borderColor: showAcknowledged ? colors.sciCyan : colors.border,
              },
            ]}
            onPress={() => setShowAcknowledged(true)}
          >
            <Text style={[styles.toggleText, { color: showAcknowledged ? colors.sciCyan : colors.mutedForeground }]}>
              Acknowledged
            </Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.sciCyan} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Feather name="wifi-off" size={40} color={colors.sciRed} />
          <Text style={[styles.errorText, { color: colors.sciRed }]}>Failed to load</Text>
          <Pressable style={[styles.retryBtn, { borderColor: colors.sciCyan }]} onPress={() => refetch()}>
            <Text style={[styles.retryText, { color: colors.sciCyan }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertCard
              alert={item}
              onAcknowledge={() => handleAcknowledge(item.id)}
              acknowledging={acknowledging.has(item.id)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: isWeb ? 84 + 34 : 100 },
          ]}
          scrollEnabled={!!alerts && alerts.length > 0}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.sciCyan} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="bell-off" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {showAcknowledged ? "No acknowledged alerts" : "No active alerts"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  toggle: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  toggleText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  listContent: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 14,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTopLeft: { flexDirection: "row", alignItems: "flex-start", gap: 8, flex: 1 },
  cardLabels: { flex: 1, gap: 4 },
  equipmentName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  severityBadge: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  severityText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  timeText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  messageText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  ackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
  },
  ackText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  acknowledgedRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  acknowledgedText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  retryBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
