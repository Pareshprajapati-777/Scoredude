import React, { useEffect, useRef, useState, useCallback } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4';

const SENSITIVITY_DESKTOP = 0.8;
const SENSITIVITY_TOUCH = 1.6;

export default function BackgroundVideo({ isInteractive = true }) {
  const videoRef = useRef(null);
  const prevXRef = useRef(null);
  const prevTouchXRef = useRef(null);
  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const lastTouchTimeRef = useRef(0);

  // Responsive mobile width tracker for dynamic character scaling
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallMobile = windowWidth < 480;
  const isMobile = windowWidth < 768;

  const seekToTargetTime = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isSeekingRef.current && Math.abs(video.currentTime - targetTimeRef.current) > 0.015) {
      isSeekingRef.current = true;
      if (typeof video.fastSeek === 'function') {
        try {
          video.fastSeek(targetTimeRef.current);
        } catch {
          video.currentTime = targetTimeRef.current;
        }
      } else {
        video.currentTime = targetTimeRef.current;
      }
    }
  }, []);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    isSeekingRef.current = false;

    // Queue next seek if targetTime moved while seeking was in progress
    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.015) {
      isSeekingRef.current = true;
      if (typeof video.fastSeek === 'function') {
        try {
          video.fastSeek(targetTimeRef.current);
        } catch {
          video.currentTime = targetTimeRef.current;
        }
      } else {
        video.currentTime = targetTimeRef.current;
      }
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      targetTimeRef.current = video.currentTime || 0;
    };

    // Desktop mouse scrub handler
    const handleMouseMove = (e) => {
      if (!isInteractive) return;

      // Ignore mousemove if user recently touched the screen (avoids mobile ghost mousemove)
      if (Date.now() - lastTouchTimeRef.current < 600) return;

      const currentX = e.clientX;
      if (prevXRef.current === null) {
        prevXRef.current = currentX;
        return;
      }

      const delta = currentX - prevXRef.current;
      prevXRef.current = currentX;

      const duration = video.duration || 1;
      const timeOffset = (delta / window.innerWidth) * SENSITIVITY_DESKTOP * duration;

      targetTimeRef.current = Math.max(0, Math.min(duration, targetTimeRef.current + timeOffset));
      seekToTargetTime();
    };

    // Mobile touch scrub handlers
    const handleTouchStart = (e) => {
      if (!isInteractive || !e.touches || e.touches.length === 0) return;
      lastTouchTimeRef.current = Date.now();

      // Skip scrubbing if touch starts on interactive buttons or form fields
      const target = e.target;
      if (
        target &&
        (target.closest('button') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('textarea') ||
          target.closest('a'))
      ) {
        prevTouchXRef.current = null;
        return;
      }

      prevTouchXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      if (!isInteractive || !e.touches || e.touches.length === 0) return;
      lastTouchTimeRef.current = Date.now();

      if (prevTouchXRef.current === null) {
        prevTouchXRef.current = e.touches[0].clientX;
        return;
      }

      const currentX = e.touches[0].clientX;
      const deltaX = currentX - prevTouchXRef.current;
      prevTouchXRef.current = currentX;

      const duration = video.duration || 1;
      // Responsive thumb drag sensitivity
      const timeOffset = (deltaX / window.innerWidth) * SENSITIVITY_TOUCH * duration;

      targetTimeRef.current = Math.max(0, Math.min(duration, targetTimeRef.current + timeOffset));
      seekToTargetTime();
    };

    const handleTouchEnd = () => {
      prevTouchXRef.current = null;
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isInteractive, seekToTargetTime]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      {/* Video container: on mobile, elevated in top 54-58vh so character is sized perfectly and hero text has room; on desktop, full cover */}
      <div className="absolute top-0 left-0 right-0 h-[56vh] md:h-full md:inset-0 overflow-hidden">
        <video
          ref={videoRef}
          src={VIDEO_URL}
          muted
          playsInline
          preload="auto"
          onSeeked={handleSeeked}
          className="w-full h-full object-cover pointer-events-none transition-[object-position] duration-200"
          style={{
            objectPosition: isSmallMobile
              ? '68% 15%'
              : isMobile
              ? '70% 20%'
              : '70% center',
          }}
        />

        {/* Seamless bottom fade on mobile: dissolves the video's bottom into pure black behind hero text */}
        <div className="absolute inset-x-0 bottom-0 h-40 md:hidden bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none" />

        {/* Soft edge radial vignette for mobile to ensure zero hard borders on any screen ratio */}
        <div className="absolute inset-0 md:hidden bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Full screen subtle ambient bottom gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-transparent md:hidden" />
    </div>
  );
}
