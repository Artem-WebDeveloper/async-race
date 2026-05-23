# 🏎️ Async Race

## Live Demo

Для просмотра приложения достаточно запустить сервер локально — деплой уже поднят
**Deploy →** https://artem-webdeveloper.github.io/async-race/

## Launch

Приложение требует локально запущенного сервера - PORT: `3000`.

Для запуска нужно:

### 1. Клонировать [сервер](https://github.com/Artem-WebDeveloper/async-race-api)

```bash
git clone https://github.com/mikhama/async-race-api.git
```

### 2. Запустить сервер

```bash
cd async-race-api
npm install
npm start
```

Сервер поднимется на `http://localhost:3000`

### 3. Открыть приложение

**Deploy →** https://artem-webdeveloper.github.io/async-race/

...
...
...
...
...

## Setup Dev

1. [Запустить сервер локально](#launch)

2. Клонировать и установить зависимости:

```bash
git clone https://github.com/Artem-WebDeveloper/async-race.git
cd async-race
npm install
```

3. Создать `.env` файл в корне проекта:

```env
VITE_API_URL=http://127.0.0.1:3000
```

4. Запустить в режиме разработки:

```bash
npm run dev
```
