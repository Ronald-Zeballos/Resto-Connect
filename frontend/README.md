# RestoConnect Pro Frontend

Frontend operativo para el backend Spring Boot de RestoConnect Pro.

## Requisitos

- Node 20 o superior
- Backend en `http://localhost:8080`

## Instalacion

```bash
npm install
npm run dev
```

## Variables

Copiar `.env.example` a `.env` si se necesita cambiar la URL del API:

```bash
VITE_API_URL=http://localhost:8080
```

## Credenciales seed

- Admin: `admin / admin123`
- Mesero: `mesero / mesero123`
- Cocina: `cocina / cocina123`

## Build

```bash
npm run build
```

La app intenta consumir el API real primero. Si el backend no responde, usa datos demo locales para mantener la experiencia navegable.
