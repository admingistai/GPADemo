import React, { useEffect, useRef, useState } from 'react';

interface HeadlineProps {
  className?: string;
}

export default function Headline({ className = '' }: HeadlineProps) {
  const animatedTextRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Animation configuration - easy to tweak
  const CHAR_DELAY = 35; // ms per character (lower = faster typing)
  const START_DELAY = 300; // ms delay before animation starts
  const CURSOR_BLINK_DURATION = 2000; // ms to show cursor after typing completes
  const FULL_TEXT = 'instead of losing them to Google';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25 && !animationStarted) {
          setIsVisible(true);
          setAnimationStarted(true);
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animationStarted]);

  useEffect(() => {
    if (!isVisible || !animatedTextRef.current || !cursorRef.current) return;

    const element = animatedTextRef.current;
    const cursor = cursorRef.current;
    
    // Show cursor immediately
    cursor.style.opacity = '1';
    
    // Try GSAP first (with tree-shaking ESM import)
    const runGSAPAnimation = async () => {
      try {
        const gsap = (await import('gsap')).default || (await import('gsap')).gsap;
        const { TextPlugin } = await import('gsap/TextPlugin');
        
        gsap.registerPlugin(TextPlugin);
        
        // Set initial state
        gsap.set(element, { text: '' });
        
        // Animate text typing
        gsap.to(element, {
          duration: (FULL_TEXT.length * CHAR_DELAY) / 1000,
          text: FULL_TEXT,
          ease: 'power1.inOut',
          delay: START_DELAY / 1000,
          onComplete: () => {
            // Hide cursor after typing completes
            setTimeout(() => {
              cursor.style.opacity = '0';
            }, CURSOR_BLINK_DURATION);
          }
        });
        
        return true;
      } catch (error) {
        // console.warn('GSAP failed to load, falling back to CSS animation:', error);
        return false;
      }
    };

    // CSS fallback animation
    const runCSSAnimation = () => {
      let charIndex = 0;
      
      const typeChar = () => {
        if (charIndex <= FULL_TEXT.length) {
          element.textContent = FULL_TEXT.slice(0, charIndex);
          charIndex++;
          if (charIndex <= FULL_TEXT.length) {
            setTimeout(typeChar, CHAR_DELAY);
          } else {
            // Hide cursor after typing completes
            setTimeout(() => {
              cursor.style.opacity = '0';
            }, CURSOR_BLINK_DURATION);
          }
        }
      };
      
      setTimeout(typeChar, START_DELAY);
    };

    // Try GSAP, fallback to CSS
    runGSAPAnimation().then(success => {
      if (!success) runCSSAnimation();
    });

  }, [isVisible]);

  return (
    <h1 
      ref={containerRef}
      className={className}
      style={{
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 'bold',
        lineHeight: '1.2',
      }}
    >
      <div>Keep readers on your site</div>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '0.5rem',
        }}
      >
        <span 
          ref={animatedTextRef}
          aria-live="polite"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {/* Text content will be filled by animation */}
        </span>
        <span 
          ref={cursorRef}
          style={{
            display: 'inline-block',
            width: '3px',
            height: '1em',
            backgroundColor: '#8b5cf6',
            marginLeft: '2px',
            opacity: '0',
            animation: 'blink 1s infinite',
            verticalAlign: 'text-top',
          }}
          aria-hidden="true"
        />
      </div>
      
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </h1>
  );
} 