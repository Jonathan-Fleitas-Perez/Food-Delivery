import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-xl bg-white/60 overflow-hidden">
      <div className="flex flex-col items-center">
        {/* Minimalist Logo & Brand */}
        <div className="relative mb-12 animate-pulse">
          <img src="/logo.png" alt="Sudy's Food Logo" className="w-24 h-24 object-contain shadow-2xl rounded-full p-2 bg-white" />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-[0.2em] text-secondary">
            SUDY'S <span className="text-black">FOOD</span>
          </h1>
          
          {/* Elegant Minimalist Line Loader */}
          <div className="relative w-48 h-[2px] bg-gray-100 mx-auto overflow-hidden rounded-full">
            <div className="absolute left-0 top-0 h-full bg-secondary w-1/2 animate-[loadingLine_1.5s_ease-in-out_infinite]"></div>
          </div>
          
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
            Cargando Experiencia
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loadingLine {
          0% { transform: translateX(-100%); width: 30%; }
          50% { transform: translateX(100%); width: 60%; }
          100% { transform: translateX(300%); width: 30%; }
        }
      `}} />
    </div>
  );
};

export default LoadingScreen;
