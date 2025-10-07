import { api } from "./client";
import axios from "axios";

const API_URL = "http://192.168.1.10:8000/api";

export async function fetchEvents() {
  const res = await axios.get(`${API_URL}/events`);
  return res.data;
}

export async function fetchEventSeats(eventId: number) {
  const res = await axios.get(`${API_URL}/events/${eventId}/seats`);
  return res.data;
}

export async function reserveSeats(eventId: number, seatIds: number[]) {
  const res = await axios.post(`${API_URL}/events/${eventId}/reserve`, {
    seats: seatIds,
  });
  return res.data;
};




export const fetchEventById = async (id: number) => {
  const res = await api.get(`/events/${id}`);
  return res.data;
};

export const createEvent = async (data: any) => {
  const res = await api.post("/admin/events", data);
  return res.data;
};

export const createSeats = async (eventId: number, data: any) => {
  const res = await api.post(`/admin/events/${eventId}/seats`, data);
  return res.data;
};
