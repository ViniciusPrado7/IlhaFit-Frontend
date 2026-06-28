# IlhaFit — Frontend

Interface web da plataforma **IlhaFit**, onde o usuário descobre **estabelecimentos** e
**profissionais** fitness, vê avaliações, explora no mapa e gerencia seu perfil.

Construído com **React** e **Vite**.

## Tecnologias

- **React 19**
- **Vite 7** (bundler e servidor de desenvolvimento)
- **Material UI (MUI) 7** + **Emotion** — componentes e estilização
- **React Router 7** — rotas
- **Axios** — requisições HTTP
- **Leaflet** + **MapTiler** — mapa interativo
- **react-toastify** — notificações
- **react-icons** — ícones
- **jsPDF** + **jspdf-autotable** — exportação em PDF
- **ESLint** — padronização de código
- **Docker** + **Nginx** (build de produção)

## Pré‑requisitos

- **Node.js 18+** (recomendado 20+)
- **npm**
- O **backend** rodando (veja o README do backend) — por padrão em `http://localhost:8080`

## Configuração (variáveis de ambiente)

As variáveis do Vite ficam em um arquivo `.env` na raiz do frontend e **são lidas em
tempo de build** (precisam do prefixo `VITE_`).

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base do backend (ex.: `http://localhost:8080`). Se vazio, usa `/api` relativo. |
| `VITE_MAPTILER_KEY` | Chave do **MapTiler** usada para renderizar o mapa (obrigatória para o mapa). |

Exemplo de `.env`:

```env
VITE_API_URL=http://localhost:8080
VITE_MAPTILER_KEY=sua-chave-do-maptiler
```

> Obtenha uma chave gratuita em https://www.maptiler.com/.

## Como rodar

1. Entre na pasta do frontend:
   ```bash
   cd IlhaFit-Frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o `.env` (veja acima) e inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

A aplicação abre em **http://localhost:5173**.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento (hot reload) |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Pré‑visualiza localmente o build de produção |
| `npm run lint` | Roda o ESLint |

## Docker

O build de produção é servido por Nginx. Para gerar a imagem:

```bash
docker build -t ilhafit-frontend --build-arg VITE_MAPTILER_KEY=sua-chave .
docker run -p 8080:80 ilhafit-frontend
```

> Como as variáveis `VITE_*` são lidas no **build**, a chave do MapTiler é passada como
> **build arg** no `docker build` (e não em tempo de execução).

## Estrutura do projeto

```
src/
├── components/   # Componentes reutilizáveis (cards, modais, navbar, mapa, etc.)
├── pages/        # Páginas (Home, Estabelecimento, Profissional, Mapa, Login,
│                 #          Cadastro, Configurações, Admin...)
├── service/      # Integração com a API (Axios) e sessão de autenticação
├── utils/        # Funções utilitárias (formatação, avaliações, etc.)
└── hooks/        # Hooks customizados
```

## Principais funcionalidades

- Listagem e busca de **estabelecimentos** e **profissionais** por nome, categoria e localização
- **Mapa** com os estabelecimentos próximos
- Cadastro/login de aluno, profissional e estabelecimento (com confirmação de e‑mail)
- **Avaliações** e **denúncias**
- Páginas de **configurações** (dados, atividades, fotos, solicitações de categoria)
- **Painel administrativo** (usuários, denúncias, categorias)
