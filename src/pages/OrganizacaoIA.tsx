import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ClipboardCopy, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const OrganizacaoIA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, respostas } = location.state || {};
  const [organizacao, setOrganizacao] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchOrganizacao = async () => {
      setLoading(true);
      setErro('');
      setOrganizacao('');
      try {
        const response = await fetch('https://n8n-webhook.thiffanysoares.com/webhook/organize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, respostas }),
        });
        if (!response.ok) throw new Error('Erro ao organizar com IA');
        const data = await response.json();
        let org = '';
        if (data.respostaLimpa) {
          org = data.respostaLimpa;
        }
        setOrganizacao(org);
      } catch (err) {
        setErro('Erro ao organizar com IA. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    if (id && respostas) fetchOrganizacao();
    // eslint-disable-next-line
  }, [id, respostas]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(organizacao);
            }}
            disabled={!organizacao}
          >
            <ClipboardCopy className="w-4 h-4" />
            Copiar resposta
          </Button>
        </div>
        <h1 className="text-3xl font-extrabold mb-6 text-amber-700 tracking-tight">Organizando os principais detalhes</h1>
        {loading ? (
          <div className="flex flex-col items-center py-12">
            <span className="animate-spin text-amber-500 mb-2" style={{ fontSize: 32 }}>⏳</span>
            <span className="text-gray-500">Aguarde, organizando informações...</span>
          </div>
        ) : erro ? (
          <div className="text-red-500">{erro}</div>
        ) : organizacao ? (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 md:p-8 shadow-inner transition-all">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-amber-700 mt-6 mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-amber-600 mt-6 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-amber-500 mt-4 mb-2" {...props} />,
                strong: ({node, ...props}) => <strong className="text-amber-900 font-bold" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 text-gray-800 leading-relaxed" {...props} />,
              }}
            >
              {organizacao}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-gray-500">Nenhuma resposta encontrada.</div>
        )}
      </div>
    </div>
  );
};

export default OrganizacaoIA; 