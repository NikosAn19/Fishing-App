import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../src/theme/colors";
import { useAdventures } from "../../src/features/adventures/hooks/useAdventures";
import { AdventureStatus } from "../../src/features/adventures/types/adventure";
import AdventureCard from "../../src/features/adventures/components/AdventureCard";
import AdventureScheduleModal from "../../src/features/adventure-schedule/AdventureScheduleModal";
import { Fish, Plus } from "lucide-react-native";

export default function AdventuresPage() {
  const {
    planned,
    completed,
    loading,
    refreshing,
    error,
    refresh,
    deleteAdventure,
  } = useAdventures({ autoLoad: true });
  const [showScheduler, setShowScheduler] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAdventure(id);
    } catch (error) {
      // Error handled by hook
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && planned.length === 0 && completed.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Φόρτωση εξορμήσεων...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Οι Εξορμήσεις μου</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowScheduler(true)}
          >
            <Plus size={20} color={colors.white} strokeWidth={2.5} />
            <Text style={styles.createButtonText}>Νέα Εξόρμηση</Text>
          </TouchableOpacity>
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Upcoming Adventures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Προγραμματισμένες</Text>
          {planned.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Fish size={48} color={colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.emptyText}>
                Δεν υπάρχουν προγραμματισμένες εξορμήσεις
              </Text>
            </View>
          ) : (
            planned.map((adventure) => (
              <AdventureCard
                key={adventure.id}
                adventure={adventure}
                onDelete={
                  deletingId === adventure.id
                    ? undefined
                    : () => handleDelete(adventure.id)
                }
              />
            ))
          )}
        </View>

        {/* Completed Adventures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ολοκληρωμένες</Text>
          {completed.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Fish size={48} color={colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.emptyText}>
                Δεν υπάρχουν ολοκληρωμένες εξορμήσεις
              </Text>
            </View>
          ) : (
            completed.map((adventure) => (
              <AdventureCard
                key={adventure.id}
                adventure={adventure}
                onDelete={
                  deletingId === adventure.id
                    ? undefined
                    : () => handleDelete(adventure.id)
                }
              />
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Adventure Scheduler Modal */}
      <AdventureScheduleModal
        visible={showScheduler}
        onClose={() => {
          setShowScheduler(false);
          refresh(); // Refresh list after closing
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryBg,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.warning || "#FF6B6B",
    borderRadius: 8,
  },
  errorText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 16,
  },
});
