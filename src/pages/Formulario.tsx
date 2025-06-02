import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Upload, X, Heart, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  nomes: string;
  conheceram: string;
  primeiroEncontro: string;
  primeiraFoto: string;
  primeiraViagem: string;
  presenteEspecial: string;
  musicaComeco: string;
  hobbyAtividade: string;
  lugarEspecial: string;
  momentosInesqueciveis: string;
  viagemInesquecivel: string;
  pets: string;
  comidaFavorita: string;
  restauranteEspecial: string;
  comidaJuntos: string;
  detalheFofo: string;
  outrosDetalhes: string;
  telefone: string;
}

interface PhotoData {
  file: File;
  legenda: string;
  ano: string;
  preview: string;
}

const Formulario = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nomes: '', conheceram: '', primeiroEncontro: '', primeiraFoto: '',
    primeiraViagem: '', presenteEspecial: '', musicaComeco: '', hobbyAtividade: '',
    lugarEspecial: '', momentosInesqueciveis: '', viagemInesquecivel: '', pets: '',
    comidaFavorita: '', restauranteEspecial: '', comidaJuntos: '', detalheFofo: '',
    outrosDetalhes: '', telefone: ''
  });
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 20;
  const progress = (currentStep / totalSteps) * 100;

  const questions = [
    { field: 'nomes', question: 'Qual o nome de vocês?', type: 'text', required: true },
    { field: 'conheceram', question: 'Quando e como vocês se conheceram?', subtitle: '(lembrete: informar a data)', type: 'textarea', required: true },
    { field: 'primeiroEncontro', question: 'Onde e como foi o primeiro encontro?', type: 'textarea', required: true },
    { field: 'primeiraFoto', question: 'Onde foi a primeira foto juntos?', type: 'textarea', required: true },
    { field: 'primeiraViagem', question: 'Qual foi e quando foi a primeira viagem ou passeio especial?', subtitle: '(lembrete: informar data)', type: 'textarea', required: true },
    { field: 'presenteEspecial', question: 'Tem algum presente ou gesto especial que marcou o início do relacionamento?', type: 'textarea', required: true },
    { field: 'musicaComeco', question: 'Qual música representa esse começo para vocês?', type: 'text', required: true },
    { field: 'hobbyAtividade', question: 'Tem algum hobby ou atividade que gostam de fazer juntos?', type: 'textarea', required: true },
    { field: 'lugarEspecial', question: 'Tem algum lugar especial para vocês?', type: 'textarea', required: true },
    { field: 'momentosInesqueciveis', question: 'Quais os momentos mais inesquecíveis até agora?', subtitle: '(orientar resposta em ordem cronológica, sempre com data ou ano)', type: 'textarea', required: true },
    { field: 'viagemInesquecivel', question: 'Qual a viagem MAIS inesquecível? Quando foi?', type: 'textarea', required: true },
    { field: 'pets', question: 'Vocês têm pets?', subtitle: '(nome e espécie, se sim)', type: 'text', required: true },
    { field: 'comidaFavorita', question: 'Qual a comida ou prato favorito de cada um?', type: 'textarea', required: true },
    { field: 'restauranteEspecial', question: 'Existe um restaurante, café ou bar especial?', type: 'text', required: true },
    { field: 'comidaJuntos', question: 'Vocês têm alguma comida especial que sempre comem juntos?', subtitle: '(ex: pizza aos sábados, um doce, etc)', type: 'text', required: true },
    { field: 'detalheFofo', question: 'Tem algum detalhe fofo ou engraçado que não pode faltar na ilustração?', subtitle: '(bordão, mania, gesto, etc)', type: 'textarea', required: true },
    { field: 'outrosDetalhes', question: 'Deseja adicionar mais algum detalhe, história ou informação importante?', subtitle: '(campo aberto, opcional)', type: 'textarea', required: false },
    { 
      field: 'telefone', 
      question: 'Pode compartilhar seu WhatsApp para identificarmos seu pedido?', 
      observation: 'Seu número será usado somente para facilitar nossa comunicação sobre detalhes do seu mapa ilustrado.',
      type: 'text', 
      required: true 
    }
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (photos.length >= 10) {
      toast({
        title: "Limite atingido",
        description: "Você pode enviar no máximo 10 fotos.",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie apenas imagens.",
        variant: "destructive"
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    const newPhoto: PhotoData = {
      file,
      legenda: '',
      ano: '',
      preview
    };

    setPhotos(prev => [...prev, newPhoto]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updatePhotoData = (index: number, field: 'legenda' | 'ano', value: string) => {
    setPhotos(prev => prev.map((photo, i) => 
      i === index ? { ...photo, [field]: value } : photo
    ));
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview);
      return newPhotos;
    });
  };

  const canProceed = () => {
    if (currentStep <= 18) {
      const currentQuestion = questions[currentStep - 1];
      if (!currentQuestion.required) return true;
      const fieldValue = formData[currentQuestion.field as keyof FormData];
      return fieldValue.trim() !== '';
    } else if (currentStep === 19) {
      // Agora é obrigatório pelo menos 1 foto, e todas devem ter descrição e ano
      if (photos.length === 0) return false;
      return photos.every(photo => photo.legenda.trim() !== '' && photo.ano.trim() !== '');
    }
    return true;
  };

  const nextStep = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else if (!canProceed()) {
      if (currentStep === 19 && photos.length > 0) {
        toast({
          title: "Dados das fotos obrigatórios",
          description: "Por favor, preencha a descrição e ano de todas as fotos antes de continuar.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Campo obrigatório",
          description: "Por favor, preencha este campo antes de continuar.",
          variant: "destructive"
        });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const uploadPhotosToStorage = async (submissionId: string) => {
    const uploadPromises = photos.map(async (photo, index) => {
      const fileExt = photo.file.name.split('.').pop();
      const fileName = `${submissionId}_${index + 1}.${fileExt}`;
      const filePath = `${submissionId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('submission-photos')
        .upload(filePath, photo.file);

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        throw uploadError;
      }

      const { error: dbError } = await supabase
        .from('submission_photos')
        .insert({
          submission_id: submissionId,
          file_path: filePath,
          file_name: fileName,
          legenda: photo.legenda,
          ano: photo.ano,
          file_size: photo.file.size,
          mime_type: photo.file.type
        });

      if (dbError) {
        console.error('Error saving photo metadata:', dbError);
        throw dbError;
      }

      return filePath;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      toast({
        title: "Formulário incompleto",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const submissionData = {
        nomes: formData.nomes,
        conheceram: formData.conheceram,
        primeiro_encontro: formData.primeiroEncontro,
        primeira_foto: formData.primeiraFoto,
        primeira_viagem: formData.primeiraViagem,
        presente_especial: formData.presenteEspecial,
        musica_comeco: formData.musicaComeco,
        hobby_atividade: formData.hobbyAtividade,
        lugar_especial: formData.lugarEspecial,
        momentos_inesqueciveis: formData.momentosInesqueciveis,
        viagem_inesquecivel: formData.viagemInesquecivel,
        pets: formData.pets,
        comida_favorita: formData.comidaFavorita,
        restaurante_especial: formData.restauranteEspecial,
        comida_juntos: formData.comidaJuntos,
        detalhe_fofo: formData.detalheFofo,
        outros_detalhes: formData.outrosDetalhes,
        telefone: formData.telefone
      };

      const { data: submission, error: submissionError } = await supabase
        .from('form_submissions')
        .insert(submissionData)
        .select()
        .single();

      if (submissionError) {
        console.error('Error saving submission:', submissionError);
        throw submissionError;
      }

      if (photos.length > 0) {
        await uploadPhotosToStorage(submission.id);
      }

      try {
        await fetch('https://n8n-webhook.thiffanysoares.com/webhook/formulario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            mensagem: "formulario preenchido com sucesso",
            submissionId: submission.id 
          })
        });
      } catch (webhookError) {
        console.error('Webhook error (non-critical):', webhookError);
      }

      toast({
        title: "Formulário enviado!",
        description: "Sua história foi salva com sucesso!"
      });

      navigate('/sucesso');
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast({
        title: "Erro ao enviar",
        description: "Houve um problema ao enviar seus dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const renderQuestion = () => {
    if (currentStep <= 18) {
      const question = questions[currentStep - 1];
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-amber-800 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h2>
            {question.subtitle && (
              <p className="text-amber-600 text-sm">{question.subtitle}</p>
            )}
            {question.observation && (
              <div className="mt-4">
                <p className="text-sm text-amber-600">
                  <span className="font-medium">Observação:</span>
                </p>
                <p className="text-sm text-amber-600">{question.observation}</p>
              </div>
            )}
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Textarea
              value={formData[question.field as keyof FormData]}
              onChange={(e) => handleInputChange(question.field as keyof FormData, e.target.value)}
              placeholder={question.type === 'textarea' ? "Conte-nos sobre este momento especial..." : "Sua resposta..."}
              rows={6}
              required={question.required}
            />
          </div>
        </div>
      );
    } else if (currentStep === 19) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-amber-800 mb-4">
              Compartilhe suas fotos especiais
            </h2>
            <p className="text-amber-600">Envie até 10 fotos que representem momentos importantes da história de vocês</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="border-2 border-dashed border-amber-300 rounded-xl p-8 text-center mb-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-amber-400 text-amber-700 hover:bg-amber-50"
                disabled={photos.length >= 10}
              >
                <Upload className="w-5 h-5 mr-2" />
                {photos.length >= 10 ? 'Limite atingido' : 'Adicionar Foto'}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                {photos.length}/10 fotos enviadas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {photos.map((photo, index) => (
                <div key={index} className="bg-white rounded-xl border border-amber-200 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={photo.preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      onClick={() => removePhoto(index)}
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      placeholder="Escreva uma breve descrição da foto e de qual momento ela representa, para que fique fácil a Cris entender e ilustrar"
                      value={photo.legenda}
                      onChange={(e) => updatePhotoData(index, 'legenda', e.target.value)}
                      className={ !photo.legenda.trim() ? 'border-red-300 focus:border-red-400' : '' }
                      required
                    />
                    <Input
                      placeholder="Ano da foto *"
                      value={photo.ano}
                      onChange={(e) => updatePhotoData(index, 'ano', e.target.value)}
                      className={ !photo.ano.trim() ? 'border-red-300 focus:border-red-400' : '' }
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-amber-800 mb-4">
              Revisão da sua história
            </h2>
            <p className="text-amber-600">Confirme se todas as informações estão corretas antes de enviar</p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-xl border border-amber-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-amber-800 mb-3">Informações do casal</h3>
                <p><strong>Nomes:</strong> {formData.nomes}</p>
                <p><strong>Telefone:</strong> {formData.telefone}</p>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-3">Fotos enviadas</h3>
                <p>{photos.length} fotos com legendas e datas</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Todas as suas respostas e fotos foram salvas. 
                Ao clicar em "Enviar História", suas informações serão processadas para criar seu mapa ilustrado.
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFCFB]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-[#E6B422] text-[#E6B422] bg-white hover:bg-[#FAD9CA]/40"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Voltar ao início
            </Button>
            <span className="text-sm text-[#E6B422]">
              Passo {currentStep} de {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-3 bg-[#FAD9CA]" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-[#FAD9CA]">
            {renderQuestion()}

            <div className="flex justify-between items-center mt-12">
              <Button
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 1}
                className="border-[#E6B422] text-[#E6B422] bg-white font-semibold hover:bg-[#FAD9CA] hover:text-[#E6B422] focus:ring-2 focus:ring-[#E6B422]/40 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Anterior
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-[#E6B422] text-white hover:brightness-90"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="bg-[#E6B422] text-white hover:brightness-90"
                >
                  {isUploading ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Enviar História
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Formulario;
