# skye-front

Frontend application for SkyeChat, built with React, TypeScript, and Vite.

## Requirements

- Node.js 20 or higher
- npm
- Docker (optional, for containerization)

## Installation and Running

### Using npm

1. Navigate to the project directory:
```bash
cd skyechat
```

2. Install dependencies:
```bash
npm install
```

3. Run the application in development mode:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

4. To build the production version:
```bash
npm run build
```

5. To preview the production build:
```bash
npm run preview
```

### Using Docker

1. Navigate to the project directory:
```bash
cd skyechat
```

2. Build the Docker image:
```bash
docker build -t skyechat-front .
```

3. Run the container:
```bash
docker run -p 80:80 skyechat-front
```

The application will be available at `http://localhost`

## Available Scripts

- `npm run dev` - start development server with hot-reload
- `npm run build` - build the application for production
- `npm run preview` - preview the production build
- `npm run lint` - check code with ESLint

## Technology Stack

- **React 19** - library for building user interfaces
- **TypeScript** - typed JavaScript
- **Vite** - build tool and development server
- **Tailwind CSS** - CSS framework
- **React Router** - routing
- **Radix UI** - user interface components
