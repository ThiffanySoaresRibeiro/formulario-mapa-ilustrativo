import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar se já está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const adminAuth = localStorage.getItem('adminAuthenticated');
      if (adminAuth === 'true') {
        navigate('/admin/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      // Verificar se o admin existe na tabela
      const {
        data: admin,
        error: selectError
      } = await supabase.from('admins').select('*').eq('email', email).single();
      if (selectError || !admin) {
        toast({
          title: "Email não autorizado",
          description: "Este email não tem permissão de acesso.",
          variant: "destructive"
        });
        return;
      }

      // Validar senha usando bcryptjs
      const isValidPassword = bcrypt.compareSync(password, admin.password_hash);

      if (isValidPassword) {
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminEmail', email);
        toast({
          title: "Login realizado",
          description: "Bem-vindo ao painel administrativo!"
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          title: "Credenciais inválidas",
          description: "Email ou senha incorretos.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Login Administrativo
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Acesso restrito para administradores autorizados
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@exemplo.com" className="pl-10 border-gray-200 focus:border-amber-400" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" className="pl-10 pr-10 border-gray-200 focus:border-amber-400" required />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1 h-8 w-8 p-0">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                

                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  {loading ? 'Processando...' : 'Entrar'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button variant="link" onClick={() => navigate('/')} className="text-gray-600 hover:text-amber-600">
                  ← Voltar ao site
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};

export default AdminLogin;