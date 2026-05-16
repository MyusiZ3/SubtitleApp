import React from 'react';

const BackgroundShapes: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
      {/* Circle Top Left */}
      <div className="absolute top-[10%] left-[5%] w-24 h-24 bg-primary rounded-full neo-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-[bounce_5s_infinite]"></div>
      
      {/* Small Circle Top Left */}
      <div className="absolute top-[5%] left-[15%] w-8 h-8 bg-accent rounded-full neo-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-[pulse_3s_infinite]"></div>
      
      {/* Square Bottom Left */}
      <div className="absolute bottom-[15%] left-[8%] w-20 h-20 bg-secondary neo-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-12"></div>

      {/* Star Top Right (Using SVG) */}
      <svg className="absolute top-[15%] right-[10%] w-20 h-20 text-primary drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] rotate-45" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      
      {/* Pill shape Middle Right */}
      <div className="absolute top-[50%] right-[5%] w-16 h-32 bg-accent rounded-full neo-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-12"></div>

      {/* Circle Bottom Right */}
      <div className="absolute bottom-[10%] right-[15%] w-28 h-28 bg-primary rounded-full neo-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>
      
      {/* Small Square Bottom Right */}
      <div className="absolute bottom-[25%] right-[8%] w-10 h-10 bg-white neo-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-45"></div>
      
      {/* Floating lines / sparkles */}
      <svg className="absolute top-[40%] left-[12%] w-12 h-12 text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    </div>
  );
};

export default BackgroundShapes;
