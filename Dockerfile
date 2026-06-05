FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY env.template.js /usr/share/nginx/html/env.template.js
COPY --from=build /app/dist /usr/share/nginx/html

RUN printf '#!/bin/sh\nset -eu\nenvsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js\nexec "$@"\n' > /docker-entrypoint.d/99-envsubst.sh \
  && chmod +x /docker-entrypoint.d/99-envsubst.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
