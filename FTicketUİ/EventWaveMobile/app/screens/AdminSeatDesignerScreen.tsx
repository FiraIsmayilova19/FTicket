import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, StyleSheet } from "react-native";
import axios from "axios";

type Seat = {
  id: number;
  x: number;
  y: number;
  price?: number;
};

const AdminSeatDesignerScreen = ({ navigation }: any) => {
  const [shape, setShape] = useState<"circle" | "square" | "rectangle" | "triangle" | null>(null);
  const [seatCount, setSeatCount] = useState<string>("");
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [eventTitle, setEventTitle] = useState("");

  const handleShapeSelect = (selected: any) => {
    setShape(selected);
    setSeats([]); 
  };

  const generateSeats = () => {
    const count = parseInt(seatCount);
    if (!shape || isNaN(count) || count <= 0) {
      Alert.alert("Xəta", "Forma və düzgün say daxil edin!");
      return;
    }

    const generated: Seat[] = [];
    for (let i = 0; i < count; i++) {
      generated.push({
        id: i + 1,
        x: Math.cos((2 * Math.PI * i) / count) * 100 + 150,
        y: Math.sin((2 * Math.PI * i) / count) * 100 + 200,
      });
    }
    setSeats(generated);
  };

  const handlePriceSet = (price: string) => {
    if (!selectedSeat) return;
    const updated = seats.map((s) =>
      s.id === selectedSeat.id ? { ...s, price: parseFloat(price) } : s
    );
    setSeats(updated);
    setSelectedSeat(null);
  };

  const handleSubmit = async () => {
    if (!eventTitle || !shape || seats.length === 0) {
      Alert.alert("Xəta", "Bütün məlumatları doldurun!");
      return;
    }

    const formattedSeats = seats.map((s) => ({
      x: s.x,
      y: s.y,
      price: s.price || 0,
    }));

    try {
      await axios.post("http://127.0.0.1:8000/api/admin/events", {
        title: eventTitle,
        shape,
        seats: formattedSeats,
      });
      Alert.alert("Uğurlu!", "Event yaradıldı 🎉");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Xəta", "Event yaradıla bilmədi!");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Yeni Event Yarat</Text>

      <TextInput
        placeholder="Event Başlığı"
        value={eventTitle}
        onChangeText={setEventTitle}
        style={styles.input}
      />

      <Text style={styles.subtitle}>Forma seç:</Text>
      <View style={styles.row}>
        {["circle", "square", "rectangle", "triangle"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.shapeButton,
              shape === f ? styles.shapeSelected : styles.shapeUnselected,
            ]}
            onPress={() => handleShapeSelect(f as any)}
          >
            <Text>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Oturacaq sayı"
        keyboardType="numeric"
        value={seatCount}
        onChangeText={setSeatCount}
        style={styles.input}
      />
      <TouchableOpacity style={styles.generateButton} onPress={generateSeats}>
        <Text style={styles.buttonText}>Oturacaqları yarat</Text>
      </TouchableOpacity>

      <View style={styles.seatContainer}>
        {seats.map((seat) => (
          <TouchableOpacity
            key={seat.id}
            style={[
              styles.seat,
              {
                left: seat.x,
                top: seat.y,
                borderRadius: shape === "circle" ? 12.5 : 5,
                backgroundColor: seat.price ? "#60a5fa" : "#9ca3af",
              },
            ]}
            onPress={() => setSelectedSeat(seat)}
          >
            <Text style={styles.seatText}>{seat.id}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSeat && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceTitle}>
            {selectedSeat.id} nömrəli oturacaq üçün qiymət:
          </Text>
          <TextInput
            placeholder="Qiymət (₼)"
            keyboardType="numeric"
            onSubmitEditing={(e) => handlePriceSet(e.nativeEvent.text)}
            style={styles.input}
          />
          <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedSeat(null)}>
            <Text style={styles.buttonText}>Ləğv et</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Eventi Yarat</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AdminSeatDesignerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  shapeButton: { padding: 12, borderRadius: 8, borderWidth: 1 },
  shapeSelected: { borderColor: "#2563eb", backgroundColor: "#bfdbfe" },
  shapeUnselected: { borderColor: "#d1d5db", backgroundColor: "white" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, marginBottom: 16 },
  generateButton: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, marginBottom: 16 },
  buttonText: { color: "white", fontWeight: "600", textAlign: "center" },
  seatContainer: { height: 400, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, backgroundColor: "#f9fafb", position: "relative" },
  seat: { position: "absolute", width: 25, height: 25, justifyContent: "center", alignItems: "center" },
  seatText: { color: "white", fontSize: 10 },
  priceContainer: { marginTop: 16, borderWidth: 1, borderColor: "#3b82f6", borderRadius: 8, padding: 12, backgroundColor: "#eff6ff" },
  priceTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  cancelButton: { backgroundColor: "#9ca3af", padding: 10, borderRadius: 8, marginTop: 8 },
  submitButton: { backgroundColor: "#16a34a", padding: 12, borderRadius: 8, marginTop: 16 },
});
