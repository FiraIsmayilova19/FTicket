import axios from "axios";

type Seat = {
  x: number;
  y: number;
  price: number;
};

export type CreateEventPayload = {
  title: string;
  shape: "circle" | "square" | "rectangle" | "triangle";
  seats: Seat[];
};

export const createEvent = async (payload: CreateEventPayload) => {
  const response = await axios.post("http://127.0.0.1:8000/api/admin/events", payload);
  return response.data;
};
