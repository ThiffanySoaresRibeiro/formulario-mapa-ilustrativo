import React from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  // Cor forte inspirada na seção 'Como Funciona' do site oficial
  const destaque = '#e6b422';

  return (
    <div className="min-h-screen bg-[#FEFCFB] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* SVGs minimalistas no fundo */}
      <svg className="absolute left-0 bottom-0 opacity-10 z-0" width="220" height="220" fill="none" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r="90" stroke="#FAD9CA" strokeWidth="4" />
        <path d="M40 180 Q110 120 180 180" stroke="#FAD9CA" strokeWidth="2" strokeDasharray="6 6" fill="none" />
        <circle cx="40" cy="180" r="6" fill="#FAD9CA" />
        <circle cx="180" cy="180" r="6" fill="#FAD9CA" />
      </svg>
      <svg className="absolute right-0 top-0 opacity-10 z-0" width="120" height="120" fill="none" viewBox="0 0 120 120">
        <rect x="20" y="20" width="80" height="80" rx="40" stroke="#FAD9CA" strokeWidth="2" />
        {/* Avião minimalista */}
        <g>
          <polygon points="60,30 65,60 60,55 55,60" fill="#FAD9CA" />
          <rect x="58" y="60" width="4" height="20" rx="2" fill="#FAD9CA" />
        </g>
      </svg>
      <svg className="absolute left-8 top-8 opacity-10 z-0" width="60" height="60" fill="none" viewBox="0 0 60 60">
        <path d="M30 50 Q10 30 30 10 Q50 30 30 50 Z" fill="#FAD9CA" />
        <circle cx="30" cy="30" r="6" fill="#FEFCFB" />
      </svg>
      <div className="w-full max-w-xl mx-auto text-center space-y-12 z-10">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-gray-900">Mapa Ilustrado</h1>
          <h2 className="text-2xl font-medium" style={{ color: destaque }}>Conte sua história</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#FAD9CA]">
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Você está a um passo de eternizar a história do seu relacionamento em arte!
          </p>
          <p className="text-base text-gray-500 leading-relaxed mb-4">
            Responda com carinho — cada detalhe que você compartilhar ajudará a criar uma ilustração única e cheia de significado.
          </p>
          <p className="text-base text-gray-500 leading-relaxed">
            Quando estiver pronto, clique no botão abaixo para começar.
          </p>
        </div>
        <button
          onClick={() => navigate('/formulario')}
          className="w-full py-4 rounded-xl text-white text-lg font-semibold shadow-md hover:brightness-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#e6b422]/40"
          style={{ backgroundColor: destaque, color: '#fff' }}
        >
          Começar
        </button>
      </div>
    </div>
  );
};

export default Index;
