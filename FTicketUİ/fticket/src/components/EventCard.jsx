import React from "react";
import { Link } from "react-router-dom";

export default function EventCard({ e }) {
  return (
    <Link to={`/events/${e.id}`} className="block p-4 bg-white rounded shadow hover:shadow-lg transition">
      <div className="flex items-center">
        <img src={e.poster_url || 'https://via.placeholder.com/120x80'} alt="" className="w-28 h-20 object-cover rounded mr-4" />
        <div>
          <h3 className="font-bold text-lg">{e.title}</h3>
          <div className="text-sm text-gray-500">{new Date(e.date_time || e.date).toLocaleString()}</div>
          <div className="text-sm text-gray-400">{e.venue?.name || e.venue}</div>
        </div>
      </div>
    </Link>
  );
}
