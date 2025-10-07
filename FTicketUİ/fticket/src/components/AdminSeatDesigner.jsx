import React, { useState } from "react";

/**
 * props:
 *  onSeatsGenerated(seats) -> seats = [{x,y}]
 */
export default function AdminSeatDesigner({ onSeatsGenerated }) {
  const [shape, setShape] = useState("circle");
  const [count, setCount] = useState(12);

  function generate() {
    const c = parseInt(count) || 0;
    if (!c) return;
    const seats = [];
    const radius = 120;
    for (let i=0;i<c;i++){
      let x=0,y=0;
      if (shape === "circle") {
        const a = (i / c) * 2 * Math.PI;
        x = Math.cos(a) * radius;
        y = Math.sin(a) * radius;
      } else if (shape === "square") {
        const side = Math.ceil(Math.sqrt(c));
        x = (i % side) * 40 - side*20;
        y = Math.floor(i/side) * 40 - side*20;
      } else if (shape === "triangle") {
        const row = Math.floor((-1 + Math.sqrt(1 + 8 * i)) / 2);
        const col = i - (row * (row + 1)) / 2;
        x = (col - row/2)*40;
        y = row*40 - Math.ceil(Math.sqrt(2*c))*20;
      } else { // rectangle
        const cols = Math.ceil(Math.sqrt(c) * 1.5);
        x = (i % cols) * 40 - cols*20;
        y = Math.floor(i/cols)*40 - (c/cols)*20;
      }
      seats.push({ id: i+1, x, y });
    }
    onSeatsGenerated(seats);
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="mb-2">Forma:</div>
      <div className="flex gap-2 mb-4">
        {["circle","square","rectangle","triangle"].map(s => (
          <button key={s} onClick={() => setShape(s)} className={`px-3 py-1 rounded ${shape===s ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{s}</button>
        ))}
      </div>
      <div className="mb-4">
        <input type="number" value={count} onChange={(e) => setCount(e.target.value)} className="border p-2 rounded w-32" />
      </div>
      <button onClick={generate} className="bg-green-600 text-white px-4 py-2 rounded">Generate</button>
    </div>
  );
}
