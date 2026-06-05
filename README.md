# inventario-chatbot-frontend

This template should help get you started developing with Vue 3 in Vite.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```sh
cp .env.example .env
```

`VITE_API_BASE_URL` debe ser la URL del backend vista desde el navegador. Para desarrollo local suele ser `http://localhost:8080`; en produccion debe ser el dominio o IP publica del backend.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Docker

Construir la imagen:

```sh
docker build -t luisalvarez3800/inventario-frontend:1.0 .
```

Ejecutar con Docker Compose:

```sh
docker compose up -d --build
```

Publicar en Docker Hub:

```sh
docker login
docker push luisalvarez3800/inventario-frontend:1.0
```

Usar una imagen ya publicada:

```sh
docker compose pull
docker compose up -d
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
