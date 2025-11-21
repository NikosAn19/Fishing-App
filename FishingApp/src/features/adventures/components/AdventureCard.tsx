import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../../../theme/colors";
import { Adventure, AdventureStatus } from "../types/adventure";
import { MapPin, Calendar, Fish, Edit, Trash2 } from "lucide-react-native";

interface AdventureCardProps {
  adventure: Adventure;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function AdventureCard({
  adventure,
  onPress,
  onEdit,
  onDelete,
}: AdventureCardProps) {
  const getStatusColor = (status: AdventureStatus) => {
    switch (status) {
      case AdventureStatus.PLANNED:
        return colors.accent;
      case AdventureStatus.COMPLETED:
        return "#4CAF50";
      case AdventureStatus.CANCELLED:
        return colors.textMuted;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: AdventureStatus) => {
    switch (status) {
      case AdventureStatus.PLANNED:
        return "Προγραμματισμένη";
      case AdventureStatus.COMPLETED:
        return "Ολοκληρωμένη";
      case AdventureStatus.CANCELLED:
        return "Ακυρωμένη";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("el-GR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const statusColor = getStatusColor(adventure.status);
  const statusLabel = getStatusLabel(adventure.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Date */}
        <View style={styles.row}>
          <Calendar size={16} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.dateText}>{formatDate(adventure.date)}</Text>
        </View>

        {/* Location */}
        <View style={styles.row}>
          <MapPin size={16} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.locationText} numberOfLines={1}>
            {adventure.locationName ||
              `${adventure.coordinates.latitude.toFixed(
                4
              )}, ${adventure.coordinates.longitude.toFixed(4)}`}
          </Text>
        </View>

        {/* Fishing Technique */}
        {adventure.fishingDetails?.technique && (
          <View style={styles.row}>
            <Fish size={16} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.techniqueText}>
              {adventure.fishingDetails.technique}
            </Text>
          </View>
        )}

        {/* Catches Count (if completed) */}
        {adventure.status === AdventureStatus.COMPLETED &&
          adventure.catches &&
          adventure.catches.length > 0 && (
            <View style={styles.catchesContainer}>
              <Text style={styles.catchesText}>
                {adventure.catches.length}{" "}
                {adventure.catches.length === 1 ? "ψάρι" : "ψάρια"}
              </Text>
            </View>
          )}
      </View>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit size={18} color={colors.accent} strokeWidth={2} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2
                size={18}
                color={colors.warning || "#FF6B6B"}
                strokeWidth={2}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.secondaryBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  techniqueText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  catchesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  catchesText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.accent,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.tertiaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
});

