import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEventSeats, reserveSeats } from "../api/events";
import SeatPicker from "../components/SeatPicker";

export default function EventDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(['event-seats', id], () => fetchEventSeats(id));

  const mutation = useMutation((seatIds) => reserveSeats(id, seatIds), {
    onSuccess: () => queryClient.invalidateQueries(['event-seats', id]),
  });

  if (isLoading) return <div className="p-8">Yüklənir...</div>;

  const seats = Array.isArray(data) ? data : (data.seats || data);

  const handleSeatClick = (seat) => {
    if (seat.status === "reserved") {
      alert("Bu oturacaq doludur");
      return;
    }
    if (confirm(`Qiymət: ${seat.price} AZN. Rezerv et?`)) {
      mutation.mutate([seat.seat_id]);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Oturacaqlar</h1>
      <SeatPicker seats={seats} onClick={handleSeatClick} />
    </div>
  );
}
