FROM node:18-alpine

# Create app directory
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

# Bundle app source
COPY . .


EXPOSE 3000

CMD [ "npm", "run", "startmigrate" ]