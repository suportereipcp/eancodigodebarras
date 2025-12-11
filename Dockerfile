FROM node:18-alpine

WORKDIR /app

# Instala o PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia arquivos de dependência
COPY package.json pnpm-lock.yaml* ./

# Instala dependências
RUN pnpm install

# Copia o código
COPY . .

# --- PARTE CRUCIAL (As chaves entram aqui) ---
# 1. ARG: Captura o valor enviado pelo deploy.yml
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. ENV: Grava no ambiente para o Next.js ler
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
# ---------------------------------------------

# Constrói o site (agora com as chaves disponíveis)
RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]