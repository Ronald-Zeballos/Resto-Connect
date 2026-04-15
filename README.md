# README - Resto-Connect

## 🍽️ Resto-Connect

Plataforma moderna de gestión de restaurantes construida con **Arquitectura Hexagonal**, **Domain-Driven Design** y un **Monolito Modular Evolutivo**.

## ✨ Características

- 🏗️ **Arquitectura Hexagonal** - Separación clara de responsabilidades
- 🎯 **Domain-Driven Design** - Lógica de negocio en el corazón
- 📦 **Modular** - Fácil de escalar y mantener
- 🔄 **Evolutivo** - Preparado para transicionar a microservicios
- 🔐 **Seguro** - Autenticación JWT y validaciones
- 📱 **Responsive** - Funciona en desktop y mobile
- 🚀 **Modern Stack** - TypeScript, Express, React, Vite

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- PostgreSQL 14+ (para producción)

## 🚀 Instalación

### 1. Clonar repositorio
```bash
git clone https://github.com/tuusername/resto-connect
cd resto-connect
```

### 2. Instalar dependencias

#### Backend
```bash
cd backend
npm install
cp .env.example .env
```

#### Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
```

## 🛠️ Desarrollo

### Backend

```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

Health check: `http://localhost:3000/health`

### Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3001`

Automáticamente proxea las llamadas `/api/*` a `http://localhost:3000`

## 📁 Estructura del Proyecto

```
resto-connect/
├── backend/
│   ├── src/
│   │   ├── domain/          # Lógica pura del negocio
│   │   ├── application/     # Casos de uso
│   │   ├── infrastructure/  # Detalles técnicos (DB, HTTP)
│   │   └── shared/          # Utilities
│   ├── tests/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── modules/         # Módulos de negocio
│   │   ├── shared/          # Componentes reutilizables
│   │   ├── core/            # Servicios centrales
│   │   └── App.tsx
│   ├── public/
│   └── package.json
│
└── docs/
    ├── ARCHITECTURE.md      # Documentación arquitectónica
    ├── DOMAIN_MAP.md        # Mapa del dominio DDD
    └── SPRINTS.md           # Plan de sprints
```

## 🏃 Scripts Disponibles

### Backend
- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm run start` - Ejecutar app compilada
- `npm test` - Ejecutar tests
- `npm run lint` - Validar código
- `npm run format` - Formatear código

### Frontend
- `npm run dev` - Desarrollo con Vite
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run lint` - Validar código
- `npm run format` - Formatear código

## 🧪 Testing

```bash
# Backend - Todos los tests
cd backend
npm test

# Backend - Con coverage
npm run test:cov

# Frontend - (configurar en el futuro)
```

## 📚 Documentación

- [Arquitectura Hexagonal + DDD](docs/ARCHITECTURE.md)
- [Domain Map](docs/DOMAIN_MAP.md)
- [Plan de Sprints](docs/SPRINTS.md)

## 🔐 Seguridad

- ✅ Validación en dominio
- ✅ DTOs para inputs
- ✅ JWT para autenticación (Sprint 1)
- ✅ HTTPS en producción (próximamente)
- ✅ Rate limiting (próximamente)
- ✅ CORS configurado

## 🚀 Deployment

### Docker (próximamente)
```bash
docker-compose up
```

### Cloud (próximamente)
- Backend: AWS / Heroku
- Frontend: Vercel / Netlify
- Database: AWS RDS / Heroku Postgres

## 📊 Roadmap

### Sprint 0: ✅ Completado
- Estructura base
- Documentación

### Sprint 1: En Progreso
- Autenticación JWT
- User Management

### [Ver todos los sprints](docs/SPRINTS.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/feature-name`)
3. Commit cambios (`git commit -m 'Add feature'`)
4. Push a la rama (`git push origin feature/feature-name`)
5. Abre PR para revisión

### Estándares de Código
- TypeScript strict mode
- ESLint + Prettier
- Tests para nuevas features
- Documentación en README

## 📝 Convenciones

### Nombres
- Funciones y variables: `camelCase`
- Clases y tipos: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Archivos: `camelCase.ts` o `PascalCase.ts` (clases)

### Commits
```
feat: descripción breve
fix: descripción breve
docs: descripción breve
test: descripción breve
refactor: descripción breve
```

### PRs
- Título descriptivo
- Descripción detallada de cambios
- Linked issues
- Screenshots si aplica

## 🆘 Soporte

- Issues: Usa GitHub Issues
- Discussions: GitHub Discussions
- Email: support@resto-connect.io

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE)

## 👨‍💻 Autor

**Ronald Villarroel**
- GitHub: [@ronaldvillarroel](https://github.com/ronaldvillarroel)

## 🙏 Agradecimientos

- [Domain-Driven Design by Eric Evans](https://domainlanguage.com/ddd/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)

---

**Última actualización**: Abril 2026  
**Status**: 🚀 En Desarrollo Activo
