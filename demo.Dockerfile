FROM node:20-alpine

WORKDIR /app/lib

COPY lib .

RUN npm ci --frozen-lockfile
RUN npm run build

WORKDIR /app/demo

COPY demo /app/demo

RUN npm ci --frozen-lockfile

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
