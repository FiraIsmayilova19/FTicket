import React, { useState } from "react";
import AdminSeatDesigner from "../components/AdminSeatDesigner";
import { adminCreateEvent } from "../api/events";
import { useNavigate } from "react-router-dom";

export default function AdminCreateEvent() {
  const [title, setTitle] = useState("");
  const [seats, setSeats] = useState([]);
  const navigate = useNavigate();

  const handleGenerate = (generated) => {
    // generated = [{id,x,y}]
    setSeats(generated.map(s => ({ ...s, price: 0 })));
  };

  const handleCreate = async () => {
    // validate
    if (!title || seats.length === 0) { alert("Başlıq və oturacaqlar daxil edin"); return; }
    // ensure prices
    if (seats.some(s => !s.price || s.price <= 0)) { alert("Bütün oturacaqlara qiymət qoyun"); return; }

    const payload = {
      title,
      shape: "custom",
      seats: seats.map(s => ({ x: s.x, y: s.y, price: s.price }))
    };

    try {
      await adminCreateEvent(payload);
      alert("Event yaradıldı");
      navigate("/events");
    } catch (err) {
      alert("Xəta: " + (err?.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Yeni Event</h1>
      <div className="mb-4">
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Event başlığı" className="border p-2 rounded w-80" />
      </div>

      <AdminSeatDesigner onSeatsGenerated={handleGenerate} />

      {/* seat canvas */}
      <div className="mt-6">
        <div style={{ width: 700, height: 400, position: 'relative', border: '1px solid #e5e7eb' }}>
          {seats.map(s => (
            <div key={s.id} style={{
              position:'absolute', left: s.x + 350, top: s.y + 200, transform:'translate(-50%,-50%)',
              background: s.price ? '#60a5fa' : '#9ca3af', color:'#fff', padding:6, borderRadius:6, cursor:'pointer'
            }} onClick={()=>{
              const p = prompt("Qiymət (AZN):", s.price || "0");
              const price = parseFloat(p);
              if (!isNaN(price)) setSeats(prev => prev.map(item => item.id===s.id ? {...item, price} : item));
            }}>{s.price ? `${s.price}₼` : s.id}</div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button onClick={handleCreate} className="bg-green-600 text-white px-4 py-2 rounded">Eventi Yarat</button>
      </div>
    </div>
  );
}
