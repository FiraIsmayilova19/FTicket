import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEventSeats, reserveSeats } from "../api/events";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootNavigator";

type EventDetailRouteProp = RouteProp<RootStackParamList, "EventDetail">;

export default function EventDetailScreen() {
  const route = useRoute<EventDetailRouteProp>();
  const { id } = route.params;
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["event-seats", id],
    queryFn: () => fetchEventSeats(id),
  });

const mutation = useMutation({
  mutationFn: (seatId: number) => reserveSeats(id, [seatId]),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["event-seats", id] });
    Alert.alert("Uğurlu", "Oturacaq rezervasiya olundu!");
  },
  onError: (err: any) => {
    Alert.alert("Xəta", err?.response?.data?.detail || "Rezervasiya mümkün olmadı");
  },
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
        <Text>Xəta baş verdi.</Text>
      </View>
    );
  }

  const handleSeatPress = (seat: any) => {
    if (seat.status === "reserved") {
      Alert.alert("Bu oturacaq artıq doludur.");
      return;
    }
    setSelectedSeat(seat.seat_id);
    Alert.alert(
      "Oturacaq seçildi",
      `Qiymət: ${seat.price} AZN`,
      [
        { text: "İmtina", style: "cancel" },
        {
          text: "Rezerv et",
          onPress: () => mutation.mutate(seat.seat_id),
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Oturacaqlar</Text>

      <View style={styles.hallContainer}>
        {data.map((seat: any) => (
          <TouchableOpacity
            key={seat.seat_id}
            style={[
              styles.seat,
              seat.status === "reserved" ? styles.reserved : styles.available,
              selectedSeat === seat.seat_id && styles.selected,
            ]}
            onPress={() => handleSeatPress(seat)}
          >
            <Text style={styles.seatText}>{seat.row}-{seat.col}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  hallContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  seat: {
    width: 40,
    height: 40,
    borderRadius: 8,
    margin: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  available: {
    backgroundColor: "#22c55e", // yaşıl
  },
  reserved: {
    backgroundColor: "#ef4444", // qırmızı
  },
  selected: {
    borderWidth: 3,
    borderColor: "#2563eb",
  },
  seatText: { color: "white", fontSize: 12, fontWeight: "bold" },
});
