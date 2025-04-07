FROM node:18.5-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
# Servir el build con un servidor estático
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
