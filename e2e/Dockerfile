FROM mcr.microsoft.com/playwright:v1.65.1-jammy

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# The stack (db, backend, frontend) must be running; base URLs come from Compose service names.
ENV E2E_BASE_URL=http://frontend:5173
ENV E2E_API_URL=http://backend:3000

CMD ["npm", "test"]
