'use client'
import React, { useEffect, useRef } from 'react';

export const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    let meteors: { x: number; y: number; length: number; speed: number; opacity: number }[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 2000);
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5,
          speed: Math.random() * 0.05,
          opacity: Math.random()
        });
      }
    };

    const createMeteor = () => {
      if (Math.random() > 0.99) {
        meteors.push({
          x: Math.random() * canvas.width,
          y: -20,
          length: Math.random() * 80 + 20,
          speed: Math.random() * 10 + 5,
          opacity: 1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
      });

      // Draw meteors
      meteors.forEach((meteor, index) => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.length * 0.5, meteor.y + meteor.length);
        ctx.stroke();

        meteor.x -= meteor.speed * 0.5;
        meteor.y += meteor.speed;
        meteor.opacity -= 0.01;

        if (meteor.opacity <= 0 || meteor.y > canvas.height) {
          meteors.splice(index, 1);
        }
      });

      createMeteor();
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none bg-space-black"
    />
  );
};
