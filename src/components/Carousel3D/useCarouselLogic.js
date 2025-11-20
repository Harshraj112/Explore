// src/components/Carousel3D/useCarouselLogic.js
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Handles all GSAP animations + scroll + drag logic for the carousel.
 * Keeps Carousel3D.jsx clean.
 */
export default function useCarouselLogic({
  totalCards,
  cardAngle,
  carouselRef,
  cardsRef,
  titleRef,
  subtitleRef,
  progressRef,
  glowRef1,
  glowRef2,
  containerRef,
  setActiveIndex,
}) {
  const rotationRef = useRef({ value: 0 });
  const dragRef = useRef({ isDragging: false, startX: 0, startRotation: 0 });

  // ------------------------------------------
  //  Initial entrance animations
  // ------------------------------------------
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current, {
        opacity: 0,
        scale: 0.5,
        z: -500,
        duration: 1.2,
        stagger: 0.1,
        ease: "back.out(1.7)",
      });

      gsap.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power3.out",
      });

      // Floating glow animations
      gsap.to(glowRef1.current, {
        x: 50,
        y: 30,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(glowRef2.current, {
        x: -40,
        y: -40,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------
  //  Scroll wheel rotation
  // ------------------------------------------
  useEffect(() => {
    const container = containerRef.current;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;

      const targetRotation = rotationRef.current.value + delta * cardAngle;

      gsap.to(rotationRef.current, {
        value: targetRotation,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          if (carouselRef.current) {
            carouselRef.current.style.transform = `rotateY(${-rotationRef.current.value}deg)`;
          }

          const normalized = ((rotationRef.current.value % 360) + 360) % 360;
          const newIndex = Math.round(normalized / cardAngle) % totalCards;

          setActiveIndex((prev) => (prev !== newIndex ? newIndex : prev));
        },
      });
    };

    if (container)
      container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      if (container) container.removeEventListener("wheel", handleWheel);
    };
  }, [cardAngle, totalCards, containerRef, carouselRef, setActiveIndex]);

  // ------------------------------------------
  //  Programmatic slide change (dots navigation)
  // ------------------------------------------
  const goToSlide = (index, onComplete) => {
    const targetRotation = index * cardAngle;

    gsap.to(rotationRef.current, {
      value: targetRotation,
      duration: 1,
      ease: "power3.inOut",
      onUpdate: () => {
        if (carouselRef.current) {
          carouselRef.current.style.transform = `rotateY(${-rotationRef.current.value}deg)`;
        }
      },
      onComplete: () => {
        if (typeof onComplete === "function") onComplete();
      },
    });
  };

  // ------------------------------------------
  //  Mouse drag rotation
  // ------------------------------------------
  const handleMouseDown = (e) => {
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startRotation: rotationRef.current.value,
    };
    gsap.killTweensOf(rotationRef.current);
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const newRotation = dragRef.current.startRotation - deltaX * 0.5;

    rotationRef.current.value = newRotation;

    if (carouselRef.current) {
      carouselRef.current.style.transform = `rotateY(${-newRotation}deg)`;
    }

    const normalized = ((newRotation % 360) + 360) % 360;
    const newIndex = Math.round(normalized / cardAngle) % totalCards;

    setActiveIndex((prev) => (prev !== newIndex ? newIndex : prev));
  };

  const handleMouseUp = (animateOnComplete) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;

    const normalized = ((rotationRef.current.value % 360) + 360) % 360;
    const nearestIndex = Math.round(normalized / cardAngle) % totalCards;

    const snapRotation = nearestIndex * cardAngle;

    gsap.to(rotationRef.current, {
      value: snapRotation,
      duration: 0.6,
      ease: "elastic.out(1, 0.8)",
      onUpdate: () => {
        if (carouselRef.current) {
          carouselRef.current.style.transform = `rotateY(${-rotationRef.current.value}deg)`;
        }
      },
      onComplete: () => {
        setActiveIndex(nearestIndex);
        if (typeof animateOnComplete === "function")
          animateOnComplete(nearestIndex);
      },
    });
  };

  return {
    rotationRef,
    dragRef,
    goToSlide,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
