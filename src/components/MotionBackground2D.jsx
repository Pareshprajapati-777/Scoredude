import React, { useEffect, useRef } from 'react';

export default function MotionBackground2D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let scrollY = window.scrollY;

    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 2D Floating Fluid Orbs
    const orbs = [
      { x: width * 0.2, y: height * 0.25, r: 240, color: 'rgba(6, 182, 212, 0.14)', vx: 0.35, vy: 0.25, phase: 0 },
      { x: width * 0.8, y: height * 0.35, r: 280, color: 'rgba(99, 102, 241, 0.16)', vx: -0.25, vy: 0.35, phase: 2 },
      { x: width * 0.5, y: height * 0.75, r: 320, color: 'rgba(217, 70, 239, 0.12)', vx: 0.2, vy: -0.3, phase: 4 },
      { x: width * 0.15, y: height * 0.85, r: 220, color: 'rgba(16, 185, 129, 0.12)', vx: -0.3, vy: -0.2, phase: 1 },
      { x: width * 0.85, y: height * 0.8, r: 260, color: 'rgba(245, 158, 11, 0.1)', vx: 0.25, vy: 0.25, phase: 3 }
    ];

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Deep dark background
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, width, height);

      // Render 2D Smooth Motion Orbs with Scroll Parallax
      orbs.forEach((orb, i) => {
        orb.x += orb.vx + Math.sin(time + orb.phase) * 0.4;
        orb.y += orb.vy + Math.cos(time + orb.phase) * 0.4;

        if (orb.x < -orb.r) orb.x = width + orb.r;
        if (orb.x > width + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = height + orb.r;
        if (orb.y > height + orb.r) orb.y = -orb.r;

        const parallaxY = orb.y - (scrollY * (0.08 * (i + 1))) % height;
        const currentY = parallaxY < -orb.r ? parallaxY + height + orb.r * 2 : parallaxY;

        const grad = ctx.createRadialGradient(orb.x, currentY, orb.r * 0.1, orb.x, currentY, orb.r);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(0.7, orb.color.replace(/[\d\.]+\)$/, '0.04)'));
        grad.addColorStop(1, 'rgba(8, 12, 20, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, currentY, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle 2D Noise Grid Overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      const offsetY = (scrollY * 0.2) % gridSize;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = -offsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ filter: 'blur(35px)', transform: 'scale(1.02)' }}
    />
  );
}
