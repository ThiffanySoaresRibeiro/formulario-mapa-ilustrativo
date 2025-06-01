import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogOut, Search, Eye, Download, Users, Calendar, Phone, Image, FileText, ArrowLeft, Filter, Sparkles, ClipboardCopy, Loader2, Maximize2, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageViewer from '@/components/ImageViewer';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, Link2, Camera, Plane, Gift, Music, Users as UsersIcon, MapPin, Star, PawPrint, Utensils, Coffee, Pizza, Smile, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface FormSubmission {
  id: string;
  created_at: string;
  nomes: string;
  telefone: string;
  conheceram: string;
  primeiro_encontro: string;
  primeira_foto: string;
  primeira_viagem: string;
  presente_especial: string;
  musica_comeco: string;
  hobby_atividade: string;
  lugar_especial: string;
  momentos_inesqueciveis: string;
  viagem_inesquecivel: string;
  pets: string;
  comida_favorita: string;
  restaurante_especial: string;
  comida_juntos: string;
  detalhe_fofo: string;
  outros_detalhes: string;
  status: 'novo' | 'em-andamento' | 'finalizado';
  observacoes: string;
  submission_photos?: Array<{
    id: string;
    file_path: string;
    file_name: string;
    legenda: string;
    ano: string;
  }>;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{
    file_path: string;
    file_name: string;
    legenda: string;
    ano: string;
  } | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [iaDialogOpen, setIaDialogOpen] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResult, setIaResult] = useState<any>(null);
  const [iaError, setIaError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [organizacao, setOrganizacao] = useState<string>('');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (isAuthenticated !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      
      const { data: formData, error: formError } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (formError) {
        console.error('Error loading submissions:', formError);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar os formulários.",
          variant: "destructive"
        });
        return;
      }

      const submissionsWithPhotos = await Promise.all(
        (formData || []).map(async (submission) => {
          const { data: photos, error: photosError } = await supabase
            .from('submission_photos')
            .select('*')
            .eq('submission_id', submission.id)
            .order('created_at');

          if (photosError) {
            console.error('Error loading photos for submission:', submission.id, photosError);
          }

          return {
            ...submission,
            status: submission.status as 'novo' | 'em-andamento' | 'finalizado',
            submission_photos: photos || []
          };
        })
      );

      setSubmissions(submissionsWithPhotos);
      setFilteredSubmissions(submissionsWithPhotos);
    } catch (error) {
      console.error('Error in loadSubmissions:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = submissions;

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.nomes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.telefone?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(sub => new Date(sub.created_at) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(sub => new Date(sub.created_at) <= new Date(dateTo + 'T23:59:59'));
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, dateFrom, dateTo]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminEmail');
    navigate('/admin');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
  };

  const updateStatus = async (id: string, newStatus: FormSubmission['status']) => {
    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status.",
          variant: "destructive"
        });
        return;
      }

      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, status: newStatus } : sub
        )
      );
      
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => 
          prev ? { ...prev, status: newStatus } : null
        );
      }

      toast({
        title: "Status atualizado",
        description: `Status alterado para: ${newStatus}`
      });
    } catch (error) {
      console.error('Error in updateStatus:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status.",
        variant: "destructive"
      });
    }
  };

  const updateObservacoes = async (id: string, observacoes: string) => {
    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ observacoes })
        .eq('id', id);

      if (error) {
        console.error('Error updating observacoes:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar as observações.",
          variant: "destructive"
        });
        return;
      }

      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, observacoes } : sub
        )
      );
      
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => 
          prev ? { ...prev, observacoes } : null
        );
      }

      toast({
        title: "Observações salvas",
        description: "As observações foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error('Error in updateObservacoes:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar observações.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: FormSubmission['status']) => {
    switch (status) {
      case 'novo': return 'bg-blue-100 text-blue-800';
      case 'em-andamento': return 'bg-yellow-100 text-yellow-800';
      case 'finalizado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('submission-photos')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleImageClick = (image: any) => {
    setSelectedImage(image);
    setImageViewerOpen(true);
  };

  const downloadAllPhotos = async (submissionId: string, photos: any[]) => {
    try {
      for (const photo of photos) {
        const { data, error } = await supabase.storage
          .from('submission-photos')
          .download(photo.file_path);

        if (error) {
          console.error('Error downloading photo:', error);
          continue;
        }

        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = photo.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Download concluído",
        description: `${photos.length} imagens foram baixadas.`
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Erro",
        description: "Erro durante o download das imagens.",
        variant: "destructive"
      });
    }
  };

  const handleIaOrganize = async () => {
    if (!selectedSubmission) return;
    setIaLoading(true);
    setIaError(null);
    setCopied(false);
    setIaResult(null);
    setOrganizacao('');
    try {
      const respostas: Record<string, string> = {};
      Object.entries(selectedSubmission).forEach(([key, value]) => {
        if ([
          'id', 'created_at', 'status', 'observacoes', 'submission_photos', 'updated_at', 'telefone'
        ].includes(key) || !value) return;
        respostas[key] = String(value);
      });
      if (selectedSubmission.nomes) {
        respostas['nomes'] = selectedSubmission.nomes;
      }
      const response = await fetch('https://n8n-webhook.thiffanysoares.com/webhook/organize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSubmission.id,
          respostas,
        }),
      });
      if (!response.ok) throw new Error('Erro ao organizar com IA');
      const data = await response.json();
      console.log('Resposta do webhook:', data);
      let org = '';
      if (data.respostaLimpa) {
        org = data.respostaLimpa;
      }
      console.log('Valor que será setado:', org);
      setOrganizacao(org);
      setIaResult(data);
    } catch (err: any) {
      setIaError('Erro ao organizar com IA. Tente novamente.');
    } finally {
      setIaLoading(false);
    }
  };

  const handleCopyIa = () => {
    if (!iaResult) return;
    let texto = '';
    const iaData = iaResult?.organizacao || iaResult || {};
    if (iaData.respostaLimpa) {
      texto = iaData.respostaLimpa;
    } else {
      if (iaData.linha_do_tempo || iaData.timeline) {
        texto += 'Linha do tempo cronológica:\n';
        if (Array.isArray(iaData.linha_do_tempo || iaData.timeline)) {
          (iaData.linha_do_tempo || iaData.timeline).forEach((item: any) => {
            texto += `- ${item.titulo}: ${item.resposta}\n`;
          });
        } else {
          texto += `- ${iaData.linha_do_tempo || iaData.timeline.titulo}: ${iaData.linha_do_tempo || iaData.timeline.resposta}\n`;
        }
      }
      if (iaData.sugestoes_ilustracao || iaData.suggestions) {
        texto += '\nSugestões para Ilustração:\n';
        if (Array.isArray(iaData.sugestoes_ilustracao || iaData.suggestions)) {
          (iaData.sugestoes_ilustracao || iaData.suggestions).forEach((s: string) => {
            texto += `- ${s}\n`;
          });
        } else {
          texto += `- ${iaData.sugestoes_ilustracao || iaData.suggestions}\n`;
        }
      }
    }
    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (selectedSubmission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">
                  {selectedSubmission.nomes}
                </h1>
                <Badge className={getStatusColor(selectedSubmission.status)}>
                  {selectedSubmission.status}
                </Badge>
              </div>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Informações do Casal
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">
                        {formatDate(selectedSubmission.created_at)}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nomes</label>
                      <p className="text-lg font-semibold">{selectedSubmission.nomes}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="text-lg">{selectedSubmission.telefone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Respostas do Formulário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedSubmission).map(([key, value]) => {
                      if ([
                        'id', 'created_at', 'nomes', 'telefone', 'status', 'observacoes', 'submission_photos', 'updated_at'
                      ].includes(key) || !value) return null;
                      const questionMap: { [key: string]: { label: string, icon: React.ReactNode } } = {
                        conheceram: { label: 'Como se conheceram', icon: <Heart className="text-red-500 w-6 h-6" /> },
                        primeiro_encontro: { label: 'Primeiro encontro', icon: <Link2 className="text-yellow-500 w-6 h-6" /> },
                        primeira_foto: { label: 'Primeira foto', icon: <Camera className="text-blue-500 w-6 h-6" /> },
                        primeira_viagem: { label: 'Primeira viagem', icon: <Plane className="text-indigo-500 w-6 h-6" /> },
                        presente_especial: { label: 'Presente especial', icon: <Gift className="text-pink-500 w-6 h-6" /> },
                        musica_comeco: { label: 'Música do começo', icon: <Music className="text-green-500 w-6 h-6" /> },
                        hobby_atividade: { label: 'Hobby/Atividade', icon: <UsersIcon className="text-orange-500 w-6 h-6" /> },
                        lugar_especial: { label: 'Lugar especial', icon: <MapPin className="text-amber-700 w-6 h-6" /> },
                        momentos_inesqueciveis: { label: 'Momentos inesquecíveis', icon: <Star className="text-yellow-600 w-6 h-6" /> },
                        viagem_inesquecivel: { label: 'Viagem inesquecível', icon: <Plane className="text-indigo-700 w-6 h-6" /> },
                        pets: { label: 'Pets', icon: <PawPrint className="text-amber-500 w-6 h-6" /> },
                        comida_favorita: { label: 'Comida favorita', icon: <Utensils className="text-orange-600 w-6 h-6" /> },
                        restaurante_especial: { label: 'Restaurante especial', icon: <Coffee className="text-brown-500 w-6 h-6" /> },
                        comida_juntos: { label: 'Comida que comem juntos', icon: <Pizza className="text-yellow-700 w-6 h-6" /> },
                        detalhe_fofo: { label: 'Detalhe fofo', icon: <Smile className="text-pink-400 w-6 h-6" /> },
                        outros_detalhes: { label: 'Outros detalhes', icon: <Info className="text-gray-400 w-6 h-6" /> },
                      };
                      const { label, icon } = questionMap[key] || { label: key, icon: <Info className="text-gray-400 w-6 h-6" /> };
                      return (
                        <Dialog key={key}>
                          <DialogTrigger asChild>
                            <button className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 shadow hover:shadow-md transition cursor-pointer text-left">
                              <div>{icon}</div>
                              <div>
                                <div className="font-bold uppercase text-sm mb-1 tracking-wide">{label}</div>
                                <div className="text-gray-700 text-base truncate max-w-[250px]">{String(value)}</div>
                              </div>
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">{icon} {label}</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 text-lg text-gray-800 whitespace-pre-wrap">{String(value)}</div>
                          </DialogContent>
                        </Dialog>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {selectedSubmission.submission_photos && selectedSubmission.submission_photos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Image className="w-5 h-5 mr-2" />
                        Fotos ({selectedSubmission.submission_photos.length})
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAllPhotos(selectedSubmission.id, selectedSubmission.submission_photos!)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Todas
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedSubmission.submission_photos.map((photo, index) => (
                        <div 
                          key={index} 
                          className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => handleImageClick(photo)}
                        >
                          <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                            <img 
                              src={getPhotoUrl(photo.file_path)}
                              alt={photo.legenda}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                              onError={(e) => {
                                e.currentTarget.src = '';
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden flex items-center justify-center h-full">
                              <Image className="w-12 h-12 text-gray-400" />
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-sm mb-1">{photo.legenda}</p>
                            <p className="text-xs text-gray-500">Ano: {photo.ano}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedSubmission.status === 'finalizado' ? 'default' : 'secondary'}>
                      {selectedSubmission.status === 'finalizado' ? 'Finalizado' : 'Pendente'}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-2">{formatDate(selectedSubmission.created_at)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Organizar com IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Obtenha uma linha do tempo cronológica e sugestões para ilustração, organizadas automaticamente pela IA.</p>
                  <Dialog open={iaDialogOpen} onOpenChange={setIaDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                          const respostas: Record<string, string> = {};
                          Object.entries(selectedSubmission).forEach(([key, value]) => {
                            if ([
                              'id', 'created_at', 'status', 'observacoes', 'submission_photos', 'updated_at', 'telefone'
                            ].includes(key) || !value) return;
                            respostas[key] = String(value);
                          });
                          if (selectedSubmission.nomes) {
                            respostas['nomes'] = selectedSubmission.nomes;
                          }
                          navigate(`/admin/organizacao/${selectedSubmission.id}`, {
                            state: { id: selectedSubmission.id, respostas }
                          });
                        }}
                        disabled={iaLoading}
                      >
                        <Sparkles className="w-4 h-4" />
                        Organizar com IA
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Organização com IA</DialogTitle>
                      </DialogHeader>
                      {iaLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin mb-2 text-amber-500" />
                          <span className="text-sm text-gray-500">Aguarde, organizando informações...</span>
                        </div>
                      ) : iaError ? (
                        <div className="text-red-500 text-sm">{iaError}</div>
                      ) : organizacao ? (
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-2">Organização com IA</h4>
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{organizacao}</ReactMarkdown>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={handleCopyIa}
                          >
                            <ClipboardCopy className="w-4 h-4" />
                            {copied ? 'Copiado!' : 'Copiar resposta'}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => {
                              navigate(`/admin/organizacao/${selectedSubmission?.id}`, {
                                state: { organizacao }
                              });
                            }}
                          >
                            <Maximize2 className="w-4 h-4" />
                            Ver em tela cheia
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Clique no botão acima para organizar com IA.</div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Observações Internas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={selectedSubmission.observacoes}
                    onChange={(e) => {
                      setSelectedSubmission(prev => 
                        prev ? { ...prev, observacoes: e.target.value } : null
                      );
                    }}
                    placeholder="Adicione observações sobre este pedido..."
                    rows={6}
                  />
                  <Button 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={() => updateObservacoes(selectedSubmission.id, selectedSubmission.observacoes)}
                  >
                    Salvar
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Fotos enviadas:</span>
                    <span className="font-medium">{selectedSubmission.submission_photos?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Data de envio:</span>
                    <span className="font-medium">{formatDate(selectedSubmission.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status atual:</span>
                    <Badge className={getStatusColor(selectedSubmission.status)}>
                      {selectedSubmission.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <ImageViewer
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          image={selectedImage}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Painel Administrativo - Mapas Ilustrados
            </h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="em-andamento">Em Andamento</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por período:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">De:</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Até:</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-auto"
                />
              </div>
              {(dateFrom || dateTo) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                  }}
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-3xl font-bold">{filteredSubmissions.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Novos</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {filteredSubmissions.filter(s => s.status === 'novo').length}
                  </p>
                </div>
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Em Andamento</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {filteredSubmissions.filter(s => s.status === 'em-andamento').length}
                  </p>
                </div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Finalizados</p>
                  <p className="text-3xl font-bold text-green-600">
                    {filteredSubmissions.filter(s => s.status === 'finalizado').length}
                  </p>
                </div>
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulários Recebidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Casal</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fotos</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-semibold">{submission.nomes}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {submission.telefone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={submission.status}
                        onValueChange={(value) => updateStatus(submission.id, value as FormSubmission['status'])}
                      >
                        <SelectTrigger
                          className={`w-36
                            ${submission.status === 'novo' ? 'bg-blue-100 text-blue-800' : ''}
                            ${submission.status === 'em-andamento' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${submission.status === 'finalizado' ? 'bg-green-100 text-green-800' : ''}
                          `}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="novo">Novo</SelectItem>
                          <SelectItem value="em-andamento">Em Andamento</SelectItem>
                          <SelectItem value="finalizado">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Image className="w-4 h-4 mr-2 text-gray-400" />
                        {submission.submission_photos?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(submission.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="flex gap-6 items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (window.confirm('Tem certeza que deseja excluir este formulário?')) {
                            const { error } = await supabase
                              .from('form_submissions')
                              .delete()
                              .eq('id', submission.id);
                            if (!error) {
                              setSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
                              setFilteredSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
                              toast({ title: 'Excluído', description: 'Formulário removido com sucesso.' });
                            } else {
                              toast({ title: 'Erro', description: 'Erro ao excluir formulário.', variant: 'destructive' });
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredSubmissions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum formulário encontrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
