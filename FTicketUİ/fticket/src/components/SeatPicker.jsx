import React from "react";

/**
 * seats: array of {seat_id, row, col, x, y, status, price}
 * containerSize: {width,height} in px
 * onClick(seat)
 */
export default function SeatPicker({ seats = [], onClick = () => {}, containerSize = { width: 700, height: 400 } }) {
  const cw = containerSize.width, ch = containerSize.height;
  // seats expected to have x,y in some coordinate space; we'll assume they are centered around 0
  // compute transform: translate to middle
  return (
    <div style={{ width: cw, height: ch, position: "relative", border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9fafb" }}>
      {seats.map(seat => {
        const left = (seat.x || 0) + cw/2;
        const top = (seat.y || 0) + ch/2;
        const bg = seat.status === "reserved" ? "#ef4444" : "#16a34a";
        return (
          <div
            key={seat.seat_id}
            onClick={() => onClick(seat)}
            className="seat"
            title={seat.price ? `${seat.price} AZN` : "Qiymət yoxdur"}
            style={{
              position: "absolute",
              left,
              top,
              transform: "translate(-50%, -50%)",
              width: 32,
              height: 32,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 12,
              background: bg,
              boxShadow: seat.selected ? "0 0 8px rgba(37,99,235,0.6)" : undefined,
              cursor: seat.status === "reserved" ? "not-allowed" : "pointer"
            }}
          >
            {seat.row}-{seat.col}
          </div>
        );
      })}
    </div>
  );
}
