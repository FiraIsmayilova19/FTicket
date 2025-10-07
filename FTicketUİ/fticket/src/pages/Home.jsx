import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../api/events";
import EventCard from "../components/EventCard";

export default function Home() {
  const { data, isLoading, error } = useQuery(['events'], fetchEvents);

  if (isLoading) return <div className="p-8">Yüklənir...</div>;
  if (error) return <div className="p-8 text-red-600">Xəta baş verdi</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Tədbirlər</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map(ev => <EventCard key={ev.id} e={ev} />)}
      </div>
    </div>
  );
}
