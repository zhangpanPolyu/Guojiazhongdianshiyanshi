import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import {
  getListCategoriesQueryOptions,
  getListEquipmentQueryOptions,
} from "@workspace/api-client-react";
import type { Equipment } from "@workspace/api-client-react";

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
  maintenance: "MAINT",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "#4A6080";
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>
        {STATUS_LABELS[status] ?? status.toUpperCase()}
      </Text>
    </View>
  );
}

function EquipmentCard({ item, onPress }: { item: Equipment; onPress: () => void }) {
  const colors = useColors();
  const statusColor = STATUS_COLORS[item.status] ?? "#4A6080";
  return (
    <Pressable
      testID={`equipment-card-${item.id}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: statusColor,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
          {item.nameEn}
        </Text>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.cardMeta}>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {item.locationEn ?? item.location}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="tag" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {item.category}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function EquipmentListScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: categories } = useQuery(getListCategoriesQueryOptions());
  const {
    data: equipment,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    getListEquipmentQueryOptions({
      category: selectedCategory ?? undefined,
      search: search.length >= 2 ? search : undefined,
    })
  );

  const filtered = equipment?.filter((e) =>
    selectedStatus ? e.status === selectedStatus : true
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const statuses = ["running", "warning", "fault", "offline", "maintenance"];

  const topPadding = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.sciCyan }]}>EQUIPMENT</Text>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            testID="search-input"
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search equipment..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
          <Pressable
            style={[
              styles.chip,
              {
                backgroundColor: !selectedCategory ? colors.sciCyan : colors.card,
                borderColor: !selectedCategory ? colors.sciCyan : colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.chipText, { color: !selectedCategory ? colors.background : colors.mutedForeground }]}>All</Text>
          </Pressable>
          {categories?.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedCategory === cat.id ? colors.sciCyan : colors.card,
                  borderColor: selectedCategory === cat.id ? colors.sciCyan : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
            >
              <Text style={[styles.chipText, { color: selectedCategory === cat.id ? colors.background : colors.mutedForeground }]}>
                {cat.nameEn}
              </Text>
              {cat.alertCount > 0 && (
                <View style={[styles.chipBadge, { backgroundColor: colors.sciRed }]}>
                  <Text style={styles.chipBadgeText}>{cat.alertCount}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
          <Pressable
            style={[
              styles.chip,
              {
                backgroundColor: !selectedStatus ? colors.secondary : colors.card,
                borderColor: !selectedStatus ? colors.mutedForeground : colors.border,
              },
            ]}
            onPress={() => setSelectedStatus(null)}
          >
            <Text style={[styles.chipText, { color: colors.mutedForeground }]}>All Status</Text>
          </Pressable>
          {statuses.map((s) => (
            <Pressable
              key={s}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedStatus === s ? STATUS_COLORS[s] + "22" : colors.card,
                  borderColor: selectedStatus === s ? STATUS_COLORS[s] : colors.border,
                },
              ]}
              onPress={() => setSelectedStatus(s === selectedStatus ? null : s)}
            >
              <Text style={[styles.chipText, { color: selectedStatus === s ? STATUS_COLORS[s] : colors.mutedForeground }]}>
                {STATUS_LABELS[s]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.sciCyan} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading equipment...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Feather name="wifi-off" size={40} color={colors.sciRed} />
          <Text style={[styles.errorText, { color: colors.sciRed }]}>Failed to load</Text>
          <Pressable
            style={[styles.retryBtn, { borderColor: colors.sciCyan }]}
            onPress={() => refetch()}
          >
            <Text style={[styles.retryText, { color: colors.sciCyan }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EquipmentCard
              item={item}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/equipment/${item.id}` as never);
              }}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: isWeb ? 84 + 34 : 100 },
          ]}
          scrollEnabled={!!filtered && filtered.length > 0}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.sciCyan}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="inbox" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No equipment found</Text>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  filterRow: { marginBottom: 6 },
  filterContent: { paddingRight: 16, gap: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  chipBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chipBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  listContent: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  cardMeta: { gap: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  errorText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  retryBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
