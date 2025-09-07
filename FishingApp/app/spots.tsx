import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";

const fishingSpots = [
  {
    id: 1,
    name: "Lake View",
    location: "Mountain Region",
    rating: 4.5,
    fish: ["Bass", "Trout", "Pike"],
    distance: "2.5 km",
  },
  {
    id: 2,
    name: "River Bend",
    location: "Valley Area",
    rating: 4.2,
    fish: ["Salmon", "Trout"],
    distance: "5.1 km",
  },
  {
    id: 3,
    name: "Coastal Pier",
    location: "Beach Front",
    rating: 4.8,
    fish: ["Sea Bass", "Mackerel", "Tuna"],
    distance: "12.3 km",
  },
  {
    id: 4,
    name: "Forest Pond",
    location: "Woodland",
    rating: 3.9,
    fish: ["Carp", "Perch"],
    distance: "8.7 km",
  },
];

export default function SpotsPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📍 Fishing Spots</Text>
        <Text style={styles.subtitle}>Discover great fishing locations</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchBar}>
          <Text style={styles.searchText}>🔍 Search spots...</Text>
        </View>

        {fishingSpots.map((spot) => (
          <View key={spot.id} style={styles.spotCard}>
            <View style={styles.spotHeader}>
              <Text style={styles.spotName}>{spot.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {spot.rating}</Text>
              </View>
            </View>

            <Text style={styles.spotLocation}>📍 {spot.location}</Text>
            <Text style={styles.spotDistance}>📏 {spot.distance} away</Text>

            <View style={styles.fishContainer}>
              <Text style={styles.fishLabel}>Common fish:</Text>
              <View style={styles.fishTags}>
                {spot.fish.map((fish, index) => (
                  <View key={index} style={styles.fishTag}>
                    <Text style={styles.fishTagText}>🐟 {fish}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.spotButton}>
              <Text style={styles.spotButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#FF9800",
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  content: {
    padding: 20,
  },
  searchBar: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchText: {
    color: "#999",
    fontSize: 16,
  },
  spotCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  spotName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  ratingContainer: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  spotLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  spotDistance: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  fishContainer: {
    marginBottom: 15,
  },
  fishLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  fishTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  fishTag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  fishTagText: {
    fontSize: 12,
    color: "#1976D2",
  },
  spotButton: {
    backgroundColor: "#FF9800",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  spotButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#666",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
