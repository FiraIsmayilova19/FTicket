import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
    StyleSheet,
    Modal,
    Platform,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { createEvent } from "../api/admin";

type Seat = {
    id: number;
    x: number;
    y: number;
    price?: number;
};

export default function AdminCreateEventScreen() {
    const [shape, setShape] = useState<"circle" | "square" | "triangle" | "rectangle" | null>(null);
    const [seatCount, setSeatCount] = useState("");
    const [seats, setSeats] = useState<Seat[]>([]);
    const [title, setTitle] = useState("");

    // Modal states for price input
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
    const [priceInput, setPriceInput] = useState("");

    const mutation = useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
            Alert.alert("Uğurlu", "Event yaradıldı!");
            setShape(null);
            setSeats([]);
            setSeatCount("");
            setTitle("");
        },
        onError: (err: any) => {
            Alert.alert("Xəta", err?.response?.data?.detail || "Event yaradıla bilmədi");
        },
    });

    const generateSeats = () => {
        const count = parseInt(seatCount);
        if (!shape || !count || count <= 0) {
            Alert.alert("Xəta", "Forma və oturacaq sayı daxil edilməlidir");
            return;
        }

        const generated: Seat[] = [];
        const radius = 120;

        for (let i = 0; i < count; i++) {
            let x = 0,
                y = 0;

            switch (shape) {
                case "circle":
                    const angle = (i / count) * 2 * Math.PI;
                    x = Math.cos(angle) * radius;
                    y = Math.sin(angle) * radius;
                    break;
                case "square":
                    const side = Math.ceil(Math.sqrt(count));
                    x = (i % side) * 40 - side * 20;
                    y = Math.floor(i / side) * 40 - side * 20;
                    break;
                case "rectangle":
                    const cols = Math.ceil(Math.sqrt(count) * 1.5);
                    x = (i % cols) * 40 - cols * 20;
                    y = Math.floor(i / cols) * 40 - (count / cols) * 20;
                    break;
                case "triangle":
                    const rows = Math.ceil(Math.sqrt(2 * count));
                    const row = Math.floor((-1 + Math.sqrt(1 + 8 * i)) / 2);
                    const col = i - (row * (row + 1)) / 2;
                    x = (col - row / 2) * 40;
                    y = row * 40 - rows * 20;
                    break;
            }

            generated.push({ id: i + 1, x, y });
        }

        setSeats(generated);
    };

    const handleSeatPrice = (seatId: number) => {
        if (Platform.OS === 'ios') {
            // Use Alert.prompt for iOS
            Alert.prompt(
                "Qiymət daxil et",
                "Oturacağın qiymətini daxil et (AZN):",
                [
                    {
                        text: "Ləğv et",
                        style: "cancel"
                    },
                    {
                        text: "Təsdiqlə",
                        onPress: (priceStr: string | undefined) => {
                            const price = parseFloat(priceStr || "0");
                            if (isNaN(price) || price <= 0) {
                                Alert.alert("Xəta", "Düzgün qiymət daxil edin");
                                return;
                            }
                            setSeats((prev) =>
                                prev.map((s) => (s.id === seatId ? { ...s, price } : s))
                            );
                        }


                    }
                ],
                'plain-text',
                '',
                'numeric'
            );
        } else {
            // Use custom modal for Android
            setSelectedSeatId(seatId);
            setPriceInput("");
            setShowPriceModal(true);
        }
    };

    const confirmPrice = () => {
        if (!selectedSeatId) return;

        const price = parseFloat(priceInput);
        if (isNaN(price) || price <= 0) {
            Alert.alert("Xəta", "Düzgün qiymət daxil edin");
            return;
        }

        setSeats((prev) =>
            prev.map((s) => (s.id === selectedSeatId ? { ...s, price } : s))
        );

        setShowPriceModal(false);
        setPriceInput("");
        setSelectedSeatId(null);
    };

    const handleCreate = () => {
        if (!title || !shape || seats.length === 0) {
            Alert.alert("Xəta", "Zəhmət olmasa bütün məlumatları daxil edin.");
            return;
        }
        const missing = seats.filter((s) => !s.price);
        if (missing.length > 0) {
            Alert.alert("Xəta", "Bütün oturacaqlara qiymət daxil edin!");
            return;
        }

        mutation.mutate({
            title,
            shape,
            seats: seats.map(s => ({
                x: s.x,
                y: s.y,
                price: s.price || 0,
            })),
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Yeni Event Yarat</Text>

            <TextInput
                placeholder="Event adı"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
            />

            <Text style={styles.label}>Forma seçin:</Text>
            <View style={styles.shapes}>
                {["circle", "square", "triangle", "rectangle"].map((s) => (
                    <TouchableOpacity
                        key={s}
                        onPress={() => setShape(s as any)}
                        style={[
                            styles.shapeBtn,
                            shape === s && { backgroundColor: "#2563eb" },
                        ]}
                    >
                        <Text style={styles.shapeText}>{s}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TextInput
                placeholder="Oturacaq sayı"
                value={seatCount}
                onChangeText={setSeatCount}
                keyboardType="numeric"
                style={styles.input}
            />

            <TouchableOpacity onPress={generateSeats} style={styles.generateBtn}>
                <Text style={styles.generateText}>Düzülüşü yarat</Text>
            </TouchableOpacity>

            <View style={styles.stage}>
                {seats.map((seat) => (
                    <TouchableOpacity
                        key={seat.id}
                        style={[
                            styles.seat,
                            seat.price ? styles.seatPriced : styles.seatEmpty,
                            { transform: [{ translateX: seat.x }, { translateY: seat.y }] },
                        ]}
                        onPress={() => handleSeatPrice(seat.id)}
                    >
                        <Text style={styles.seatText}>
                            {seat.price ? `${seat.price}₼` : seat.id}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {seats.length > 0 && (
                <TouchableOpacity onPress={handleCreate} style={styles.createBtn}>
                    <Text style={styles.createText}>Eventi Yarat</Text>
                </TouchableOpacity>
            )}

            {/* Price Input Modal for Android */}
            <Modal
                visible={showPriceModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPriceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Qiymət daxil et</Text>
                        <Text style={styles.modalSubtitle}>Oturacağın qiymətini daxil et (AZN):</Text>

                        <TextInput
                            style={styles.modalInput}
                            value={priceInput}
                            onChangeText={setPriceInput}
                            keyboardType="numeric"
                            placeholder="0.00"
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowPriceModal(false);
                                    setPriceInput("");
                                    setSelectedSeatId(null);
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Ləğv et</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={confirmPrice}
                            >
                                <Text style={styles.confirmButtonText}>Təsdiqlə</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        padding: 16,
    },
    header: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        width: "90%",
        marginVertical: 6,
    },
    label: { fontSize: 16, marginTop: 8 },
    shapes: { flexDirection: "row", marginVertical: 10 },
    shapeBtn: {
        backgroundColor: "#ccc",
        padding: 10,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    shapeText: { color: "white", fontWeight: "bold" },
    generateBtn: {
        backgroundColor: "#2563eb",
        padding: 10,
        borderRadius: 10,
        marginVertical: 10,
    },
    generateText: { color: "white", fontWeight: "bold" },
    stage: {
        marginTop: 20,
        width: 300,
        height: 300,
        borderWidth: 1,
        borderColor: "#999",
        alignItems: "center",
        justifyContent: "center",
    },
    seat: {
        position: "absolute",
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    seatPriced: { backgroundColor: "#22c55e" },
    seatEmpty: { backgroundColor: "#a1a1aa" },
    seatText: { color: "white", fontSize: 10 },
    createBtn: {
        marginTop: 20,
        backgroundColor: "#22c55e",
        padding: 10,
        borderRadius: 10,
    },
    createText: { color: "white", fontWeight: "bold" },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '80%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e5e5e5',
    },
    confirmButton: {
        backgroundColor: '#2563eb',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});