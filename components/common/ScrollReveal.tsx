import React, { useRef, useState, useEffect } from 'react';

interface ScrollRevealProps { 
    children: React.ReactNode; 
    delay?: number; 
    className?: string;
    direction?: 'up' | 'left';
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, delay = 0, className = "", direction = 'up' }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (ref.current) observer.observe(ref.current);
        return () => { if (ref.current) observer.unobserve(ref.current); };
    }, []);

    return (
        <div 
            ref={ref} 
            className={`reveal-on-scroll reveal-${direction} ${isVisible ? 'is-visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
