import client from "./client";

export const fetchEvents = async () => {
  const res = await client.get("/events");
  return res.data; // expect array
};

export const fetchEvent = async (id) => {
  const res = await client.get(`/events/${id}`);
  return res.data;
};

export const fetchEventSeats = async (id) => {
  const res = await client.get(`/events/${id}/seats`);
  // if backend returns {event, seats} normalize, but we assume seats array
  return res.data;
};

export const reserveSeats = async (eventId, seats) => {
  const res = await client.post(`/events/${eventId}/reserve`, { seats });
  return res.data;
};

export const adminCreateEvent = async (payload) => {
  const res = await client.post(`/admin/events`, payload);
  return res.data;
};
