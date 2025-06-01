# Mapa Ilustrativo Personalizado

> Aplicação React para transformar histórias de casais em mapas ilustrados personalizados. Coleta momentos marcantes, fotos e detalhes via formulário multi-etapas, com painel admin para gestão, download de fotos e integração com IA.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## ✨ Sobre o Projeto

Este projeto transforma histórias de casais em mapas ilustrados personalizados, coletando momentos marcantes e fotos para criar uma arte única. Possui um fluxo acolhedor para o usuário e um painel administrativo completo para gestão dos pedidos.

---

## 🚀 Tecnologias Utilizadas
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [shadcn-ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 📦 Instalação e Uso

```sh
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Instale as dependências
npm install

# 3. Rode o projeto em modo desenvolvimento
npm run dev
```
Acesse http://localhost:8080

---

## 🧭 Funcionalidades

### Usuário
- Landing page explicativa
- Formulário multi-etapas com validação e upload de fotos (até 10)
- Revisão final antes do envio
- Confirmação visual após envio

### Admin
- Login restrito
- Dashboard com filtros, cards-resumo e busca
- Visualização detalhada dos pedidos
- Download de fotos (individual ou em lote)
- Alteração de status e observações
- Organização automática das respostas com IA
- Exclusão de pedidos

---

## 📁 Estrutura de Pastas
```
src/
  pages/         # Páginas principais (formulário, admin, sucesso, etc)
  components/    # Componentes reutilizáveis e de UI (shadcn-ui)
  hooks/         # Hooks customizados (ex: use-toast, useIsMobile)
  integrations/  # Integrações externas (ex: supabase)
  lib/           # Utilitários internos
  index.css      # Estilos globais
```

---

## 📝 Observações e Regras de Negócio
- Autenticação simples para admin (apenas demonstração)
- Fotos armazenadas no Supabase Storage
- Formulário exige pelo menos 1 foto, com descrição e ano obrigatórios
- Cards com ícones e popups para respostas
- Integração com IA para organização das respostas
- UI responsiva, com feedback visual (toasts, loaders, etc)

---

