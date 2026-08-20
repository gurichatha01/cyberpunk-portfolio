'use client';

import { useEffect } from 'react';

const SIZE = 64;
const FRAME_INTERVAL = 90;

/**
 * Browsers do not consistently run animation embedded inside an SVG favicon.
 * Drawing the signal into a canvas gives us a reliable animated data URL while
 * app/icon.svg remains the static fallback for crawlers and reduced motion.
 */
export default function AnimatedFavicon() {
  useEffect(() => {
    const icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!icon) return;

    const originalHref = icon.href;
    const originalType = icon.type;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastPaint = -FRAME_INTERVAL;

    const signalY = (x: number, phase: number) => {
      const progress = (x - 7) / 50;
      const envelope = 3 + Math.sin(Math.PI * progress) * 15;
      return 32 + Math.sin(progress * Math.PI * 7.5 - phase) * envelope;
    };

    const draw = (phase: number) => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Clipped-corner GURI//OS chassis.
      ctx.fillStyle = '#05060a';
      ctx.beginPath();
      ctx.moveTo(8, 2);
      ctx.lineTo(48, 2);
      ctx.lineTo(62, 16);
      ctx.lineTo(62, 56);
      ctx.lineTo(56, 62);
      ctx.lineTo(16, 62);
      ctx.lineTo(2, 48);
      ctx.lineTo(2, 8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#173041';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(7, 32);
      ctx.lineTo(57, 32);
      ctx.stroke();

      const gradient = ctx.createLinearGradient(7, 0, 57, 0);
      gradient.addColorStop(0, '#00d8e8');
      gradient.addColorStop(0.54, '#edf1f5');
      gradient.addColorStop(1, '#ff2f7d');

      ctx.save();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'bevel';
      ctx.shadowColor = '#00d8e8';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      for (let x = 7; x <= 57; x += 2) {
        const y = signalY(x, phase);
        if (x === 7) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // A bright scan node travels through the waveform.
      const scanProgress = (phase / (Math.PI * 2)) % 1;
      const scanX = 7 + scanProgress * 50;
      const scanY = signalY(scanX, phase);
      ctx.fillStyle = '#fff200';
      ctx.shadowColor = '#fff200';
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(scanX, scanY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      icon.type = 'image/png';
      icon.href = canvas.toDataURL('image/png');
    };

    const animate = (time: number) => {
      if (time - lastPaint >= FRAME_INTERVAL) {
        lastPaint = time;
        draw((time / 720) * Math.PI * 2);
      }
      frame = requestAnimationFrame(animate);
    };

    if (reducedMotion.matches) draw(0);
    else frame = requestAnimationFrame(animate);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      icon.href = originalHref;
      icon.type = originalType;
    };
  }, []);

  return null;
}
