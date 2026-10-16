# Gameficando Estudos — Frontend

Frontend em React (JavaScript) para o Gameficando Estudos, uma plataforma de estudos gamificada: professores criam matérias, alimentam uma base de conhecimento e geram atividades com IA; alunos praticam em sessões com questões aleatórias e acompanham ranking e ofensiva.

Este projeto consome a [API do backend](https://github.com/juantlt2811-cell/Back-End-Gameficando-Estudos) (.NET + PostgreSQL/pgvector via Supabase).

## Stack

- React 19 + React Router 7
- Vite
- CSS puro (sem framework de UI) — tema claro/escuro via `data-tema` e variáveis CSS
- JWT com refresh token automático

## Pré-requisitos

- Node.js
- O [backend](https://github.com/juantlt2811-cell/Back-End-Gameficando-Estudos) rodando localmente em `https://localhost:7259` (porta configurável em `src/constants/api.js`)

## Rodando o projeto

```bash
npm install
npm run dev
```

O Vite abre o projeto numa porta local (ex: `http://localhost:5173`). É necessário que o backend esteja rodando em paralelo para qualquer tela funcionar, já que não há dados mockados.

Outros scripts:

```bash
npm run build    # build de produção
npm run preview  # pré-visualiza o build
npm run lint     # lint com oxlint
```

## Papéis de usuário

A aplicação tem três perfis (`TipoUsuario`): **Aluno**, **Professor** e **Admin**. O cadastro público só permite Aluno ou Professor. A interface muda conforme o papel logado — por exemplo, só Professor vê "Minhas matérias" e a geração de atividades; só Aluno vê "Praticar".

## Funcionalidades

- **Autenticação**: login, cadastro, logout, renovação automática de token (refresh transparente em qualquer chamada autenticada — veja `fetchAutenticado` em `src/context/AuthContext.jsx`)
- **Matérias**: listar disponíveis, pesquisar por nome, criar/editar/excluir (Professor), duas visualizações (lista e cards)
- **Caixa de Fontes**: base de conhecimento de uma matéria — adicionar texto colado ou arquivo, listar e remover materiais
- **Atividades**: gerar com IA (múltipla escolha, dissertativa ou código), editar, excluir, testar gabarito (Professor)
- **Sessão Prática**: aluno confirma início, responde um conjunto de questões, vê feedback por questão e um resumo ao concluir
- **Ranking**: ofensiva geral e ranking por matéria
- **Estatísticas por matéria**: desempenho dos alunos (Professor)
- **Perfil / LGPD**: exportar dados em JSON, anonimizar/excluir conta

## Estrutura de pastas

```
src/
  components/   componentes reutilizáveis (Cabecalho, ListaMaterias, RotaProtegida, formulários)
  constants/    valores compartilhados (API_BASE_URL, enums de tipo de usuário/atividade)
  context/      AuthContext — usuário logado, login/logout e fetch autenticado com refresh
  pages/        uma página por rota
  index.css     estilos globais (tokens de tema, tipografia, componentes de UI)
```

## Notas

- A URL do backend está centralizada em `src/constants/api.js` — se a porta/domínio mudar, só precisa alterar ali.
- Projeto construído incrementalmente como aprendizado prático de React (fundamentos de JS → hooks → Context API → React Router → integração real com API), então o histórico de commits reflete esse progresso.
