import React from "react";

export default function Card({ img, title, style, innerRef }) {
  return (
    <div
      ref={innerRef}
      className="absolute w-64 h-80"
      style={style}
    >
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Dark → transparent top gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Title inside the card */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white/90 text-xl font-light">{title}</p>
          <p className="text-white/50 text-xs mt-1 tracking-wider uppercase">
            Explore →
          </p>
        </div>
      </div>
    </div>
  );
}
