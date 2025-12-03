import React, { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';

interface LazyYouTubePlayerProps {
    videoId: string;
    title: string;
}

export const LazyYouTubePlayer: React.FC<LazyYouTubePlayerProps> = ({ videoId, title }) => {
    const [isIntersecting, setIntersecting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIntersecting(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="bg-black aspect-video rounded-xl shadow-2xl overflow-hidden mb-8 relative border-4 border-white group cursor-pointer"
            onClick={() => setIntersecting(true)}
        >
            {isIntersecting ? (
                <iframe 
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    className="w-full h-full"
                    allowFullScreen
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
            ) : (
                <>
                    <img 
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                        alt={title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 text-white shadow-xl group-hover:scale-110 transition-transform duration-300 z-10 relative">
                            <Play size={48} fill="currentColor" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LazyYouTubePlayer;
