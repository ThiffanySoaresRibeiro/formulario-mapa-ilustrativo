
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Heart, Sparkles } from 'lucide-react';

const Sucesso = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
              História Enviada!
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-lg border border-green-100 mb-8">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-semibold text-green-700 mb-6">
              Obrigada por compartilhar sua história! 💕
            </h2>
            
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Recebi todas as suas informações e fotos com muito carinho. 
              Agora vou começar a trabalhar na criação do seu mapa ilustrado personalizado.
            </p>
            
            <p className="text-base text-green-600 mb-6">
              Cada detalhe que você compartilhou será cuidadosamente incorporado na ilustração, 
              criando uma obra única que conta a bela história do relacionamento de vocês.
            </p>
            
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <Heart className="w-6 h-6 text-green-600 mx-auto mb-3" />
              <p className="text-green-700 font-medium">
                Em breve entrarei em contato para apresentar o resultado final!
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            Voltar ao início
          </Button>

          {/* Elementos decorativos */}
          <div className="mt-12 flex justify-center space-x-4 opacity-60">
            <div className="w-3 h-3 bg-green-300 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-emerald-300 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-teal-300 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sucesso;
