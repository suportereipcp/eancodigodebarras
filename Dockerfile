# Usa uma imagem leve do Node.js
FROM node:18-alpine

# Define a pasta de trabalho
WORKDIR /app

# Instala o gerenciador de pacotes PNPM (que você usa no projeto)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia os arquivos de dependências primeiro (para ser mais rápido)
COPY package.json pnpm-lock.yaml* ./

# Instala as dependências do projeto
RUN pnpm install

# Copia todo o resto do código para dentro da imagem
COPY . .

# Constrói o site (Build)
RUN pnpm run build

# Expõe a porta 3000 (padrão do Next.js)
EXPOSE 3000

# Comando para iniciar o site
CMD ["pnpm", "start"]