# skye-front

Фронтенд приложение для SkyeChat, построенное на React, TypeScript и Vite.

## Требования

- Node.js 20 или выше
- npm или bun
- Docker (опционально, для контейнеризации)

## Установка и запуск

### Вариант 1: Использование npm

1. Перейдите в директорию проекта:
```bash
cd skyechat
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите приложение в режиме разработки:
```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

4. Для сборки production версии:
```bash
npm run build
```

5. Для предварительного просмотра production сборки:
```bash
npm run preview
```

### Вариант 2: Использование bun

1. Перейдите в директорию проекта:
```bash
cd skyechat
```

2. Установите зависимости:
```bash
bun install
```

3. Запустите приложение в режиме разработки:
```bash
bun run dev
```

4. Для сборки production версии:
```bash
bun run build
```

5. Для предварительного просмотра production сборки:
```bash
bun run preview
```

### Вариант 3: Использование Docker

1. Перейдите в директорию проекта:
```bash
cd skyechat
```

2. Соберите Docker образ:
```bash
docker build -t skyechat-front .
```

3. Запустите контейнер:
```bash
docker run -p 80:80 skyechat-front
```

Приложение будет доступно по адресу `http://localhost`

## Доступные скрипты

- `npm run dev` / `bun run dev` - запуск сервера разработки с hot-reload
- `npm run build` / `bun run build` - сборка приложения для production
- `npm run preview` / `bun run preview` - предварительный просмотр production сборки
- `npm run lint` / `bun run lint` - проверка кода с помощью ESLint

## Технологический стек

- **React 19** - библиотека для построения пользовательского интерфейса
- **TypeScript** - типизированный JavaScript
- **Vite** - инструмент сборки и сервер разработки
- **Tailwind CSS** - CSS фреймворк
- **React Router** - маршрутизация
- **Radix UI** - компоненты пользовательского интерфейса
