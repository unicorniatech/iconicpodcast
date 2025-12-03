import React, { useRef, useState, useEffect } from 'react';

export const CursorSpotlight: React.FC = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (window.matchMedia("(pointer: coarse)").matches) return;

        setIsVisible(true);
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = window.innerWidth / 2;
        let cursorY = window.innerHeight / 2;
        const speed = 0.1;

        const move = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const animate = () => {
            const distX = mouseX - cursorX;
            const distY = mouseY - cursorY;
            cursorX = cursorX + (distX * speed);
            cursorY = cursorY + (distY * speed);

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            }
            requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', move);
        const animFrame = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', move);
            cancelAnimationFrame(animFrame);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div 
            ref={cursorRef}
            className="fixed top-0 left-0 pointer-events-none z-[40] mix-blend-screen"
            style={{ willChange: 'transform' }}
        >
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-iconic-pink/20 blur-[80px]" />
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full bg-blue-400/10 blur-[40px] animate-pulse" />
        </div>
    );
};

export default CursorSpotlight;
