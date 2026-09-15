import React, { useEffect, useRef } from 'react';

export default function LiquidLogoCanvas({ size = 48 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const width = size * 2;
    const height = size * 2;
    canvas.width = width;
    canvas.height = height;

    const render = () => {
      time += 0.04;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = size * 0.72;

      // Create liquid morphing gradient blob
      ctx.save();
      ctx.translate(centerX, centerY);

      // Outer glowing ring
      const glowGrad = ctx.createRadialGradient(0, 0, radius * 0.4, 0, 0, radius * 1.3);
      glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
      glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)');
      glowGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Liquid blob path
      ctx.beginPath();
      const points = 8;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wave1 = Math.sin(angle * 3 + time * 1.5) * (radius * 0.12);
        const wave2 = Math.cos(angle * 2 - time * 2.0) * (radius * 0.08);
        const r = radius + wave1 + wave2;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevAngle = ((i - 1) / points) * Math.PI * 2;
          const prevW1 = Math.sin(prevAngle * 3 + time * 1.5) * (radius * 0.12);
          const prevW2 = Math.cos(prevAngle * 2 - time * 2.0) * (radius * 0.08);
          const prevR = radius + prevW1 + prevW2;
          const px = Math.cos(prevAngle) * prevR;
          const py = Math.sin(prevAngle) * prevR;

          const cpX = (px + x) / 2 + Math.cos(angle + time) * 4;
          const cpY = (py + y) / 2 + Math.sin(angle + time) * 4;
          ctx.quadraticCurveTo(cpX, cpY, x, y);
        }
      }
      ctx.closePath();

      // Liquid Gradient Fill
      const grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.5, '#6366f1');
      grad.addColorStop(1, '#ec4899');
      ctx.fillStyle = grad;
      ctx.fill();

      // Inner glass highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw Center Score Mark (Star & Dynamic Pulses)
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${size * 0.42}px 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.fillText('10', 0, 1);

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      className="inline-block drop-shadow-md cursor-pointer transform hover:scale-110 transition-transform duration-300"
    />
  );
}
