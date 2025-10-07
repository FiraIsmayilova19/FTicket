import React from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../api/events";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Events">;

export default function EventsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Eventləri yükləmək mümkün olmadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("EventDetail", { id: item.id })}
          >
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
            <Text style={styles.venue}>{item.venue?.name || "Naməlum məkan"}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Admin üçün event əlavə düyməsi */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AdminCreateEvent")}
      >
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  date: { color: "#555", fontSize: 14 },
  venue: { color: "#888", fontSize: 13 },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
  },
  addButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
