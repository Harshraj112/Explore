// src/components/Carousel3D/Carousel3D.jsx
import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import Card from "./Card";
import useCarouselLogic from "./useCarouselLogic";
import { IMAGES, TITLES } from "./constants";
import "./styles.css"; // perspective helper

export default function Carousel3D() {
  const totalCards = IMAGES.length;
  const cardAngle = 360 / totalCards;
  const radius = 350;

  const [activeIndex, setActiveIndex] = useState(0);

  // Refs
  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const progressRef = useRef(null);
  const cardsRef = useRef([]);
  const glowRef1 = useRef(null);
  const glowRef2 = useRef(null);

  // Hook with scroll + drag GSAP logic
  const { goToSlide, handleMouseDown, handleMouseMove, handleMouseUp } =
    useCarouselLogic({
      totalCards,
      cardAngle,
      carouselRef,
      containerRef,
      cardsRef,
      titleRef,
      subtitleRef,
      progressRef,
      glowRef1,
      glowRef2,
      setActiveIndex,
    });

  // Fix first card visibility on refresh - use useLayoutEffect for synchronous DOM updates
  useLayoutEffect(() => {
    // Use GSAP.set for immediate, non-animated property setting
    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const baseTransform = `rotateY(${i * cardAngle}deg) translateZ(${radius}px)`;

      gsap.set(card, {
        transform: `${baseTransform} scale(${i === 0 ? 1.08 : 0.92})`,
        opacity: i === 0 ? 1 : 0.5,
      });
    });
  }, [cardAngle, radius]);

  // Animate when slide changes
  useEffect(() => {
    // Skip animation on initial render
    if (activeIndex === 0) {
      // Still update progress bar on initial
      gsap.set(progressRef.current, {
        width: `${((activeIndex + 1) / totalCards) * 100}%`,
      });
      return;
    }

    // TITLE animation
    gsap.to(titleRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        gsap.fromTo(
          titleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
        );
      },
    });

    // SUBTITLE animation
    gsap.to(subtitleRef.current, {
      x: -20,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        gsap.fromTo(
          subtitleRef.current,
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
        );
      },
    });

    // PROGRESS BAR
    gsap.to(progressRef.current, {
      width: `${((activeIndex + 1) / totalCards) * 100}%`,
      duration: 0.5,
      ease: "power2.out",
    });

    // CARD scale / dim effect
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const baseTransform = `rotateY(${i * cardAngle}deg) translateZ(${radius}px)`;
      gsap.to(card, {
        transform: `${baseTransform} scale(${i === activeIndex ? 1.08 : 0.92})`,
        opacity: i === activeIndex ? 1 : 0.5,
        duration: 0.45,
        ease: "power2.out",
      });
    });
  }, [activeIndex, totalCards, cardAngle, radius]);

  // Dot navigation helper
  const handleGoTo = (index) => goToSlide(index, () => setActiveIndex(index));

  // Helper function to get transform for a card
  const getCardTransform = (index) => {
    return `rotateY(${index * cardAngle}deg) translateZ(${radius}px)`;
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => handleMouseUp()}
      onMouseLeave={() => handleMouseUp()}
    >
      {/* Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          ref={glowRef1}
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-25"
          style={{
            background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
            left: "15%",
            top: "15%",
          }}
        />
        <div
          ref={glowRef2}
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, #ec4899 0%, transparent 70%)",
            right: "10%",
            bottom: "20%",
          }}
        />
      </div>

      {/* Page heading */}
      <div className="absolute top-8 left-8 z-20">
        <h1 className="text-white/90 text-4xl font-extralight tracking-widest">
          EXPLORE
        </h1>
        <p className="text-white/40 text-sm tracking-wider mt-2">
          Scroll or drag to navigate
        </p>
      </div>

      {/* Active slide info */}
      <div className="absolute bottom-12 left-8 z-20">
        <div className="overflow-hidden">
          <p
            ref={titleRef}
            className="text-white/90 text-6xl font-thin tracking-tight"
          >
            {TITLES[activeIndex]}
          </p>
        </div>

        <p ref={subtitleRef} className="text-white/50 text-lg font-light mt-2">
          Nature Collection — Vol. {activeIndex + 1}
        </p>

        <div className="flex items-center gap-4 mt-4">
          <span className="text-white/60 text-lg font-light">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>

          <div className="w-32 h-0.5 bg-white/10 relative rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className="absolute h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
              style={{
                width: `${((activeIndex + 1) / totalCards) * 100}%`,
              }}
            />
          </div>

          <span className="text-white/40 text-lg font-light">
            {String(totalCards).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* 3D carousel */}
      <div className="absolute inset-0 flex items-center justify-center carousel-perspective">
        <div
          ref={carouselRef}
          className="relative w-64 h-80"
          style={{ transformStyle: "preserve-3d", transform: "rotateY(0deg)" }}
        >
          {IMAGES.map((img, i) => (
            <Card
              key={i}
              img={img}
              title={TITLES[i]}
              innerRef={(el) => (cardsRef.current[i] = el)}
              style={{
                transformStyle: "preserve-3d",
              }}
            />
          ))}
        </div>
      </div>

      {/* Dots nav */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleGoTo(i)}
            className="group relative w-3 h-3 flex items-center justify-center"
          >
            <span
              className={`absolute w-2 h-2 rounded-full transition-all ${
                i === activeIndex
                  ? "bg-white scale-125"
                  : "bg-white/30 group-hover:bg-white/60"
              }`}
            />
            {i === activeIndex && (
              <span className="absolute w-6 h-6 rounded-full border border-white/30 animate-ping" />
            )}
          </button>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-8 flex items-center gap-2 text-white/30 text-sm">
        <div className="w-5 h-8 border border-white/30 rounded-full flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
        </div>
        <span className="tracking-wider">SCROLL</span>
      </div>
    </div>
  );
}