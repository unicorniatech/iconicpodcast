import React from 'react';

export const AnimatedBackground: React.FC = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
     <div className="absolute inset-0 bg-gradient-to-br from-pink-50/60 via-white to-blue-50/60 bg-[length:300%_300%] animate-gradient-slow opacity-80"></div>
  </div>
);

export default AnimatedBackground;
