# 🚀 Testing Sprint 1 - Auth & Users

## ⚡ Quick Test (5 minutos)

### 1. Start both servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```
✅ Debería ver: `🚀 Server running on port 3000`

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```
✅ Debería ver la URL para abrir (ej: `http://localhost:3001`)

---

## 🧪 Test 1: Register (Crear Usuario)

### Via cURL (Backend API):
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "SecurePass123",
    "name": "María García",
    "role": "CUSTOMER"
  }'
```

**Respuesta esperada (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "maria@example.com",
    "name": "María García",
    "role": "CUSTOMER",
    "isActive": true,
    "createdAt": "2024-04-14T10:30:00.000Z",
    "updatedAt": "2024-04-14T10:30:00.000Z"
  }
}
```

### Via Frontend:
1. Abre `http://localhost:3001`
2. Click en "Registrarse"
3. Completa:
   - Email: `pedro@example.com`
   - Contraseña: `SecurePass456` (min 8 chars)
   - Nombre: `Pedro López`
   - Rol: `Cliente` (dropdown)
4. Click "Registrarse"
5. ✅ Debería ir a Login automáticamente

---

## 🧪 Test 2: Login (Iniciar Sesión)

### Via cURL:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "SecurePass123"
  }'
```

**Respuesta esperada (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJodHRwIjoi...",
    "refreshToken": "eyJodHRwIjoi...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "maria@example.com",
      "name": "María García",
      "role": "CUSTOMER",
      "isActive": true,
      "lastLoginAt": "2024-04-14T10:35:00.000Z"
    }
  }
}
```

### Via Frontend:
1. Debería estar en login page
2. Email: `maria@example.com`
3. Password: `SecurePass123`
4. Click "Iniciar Sesión"
5. ✅ Navega a home y ve Navbar con "María García (CUSTOMER)"

---

## 🧪 Test 3: Token Validation

### Via cURL:
```bash
# Obtén el token del login anterior (copiar accessToken)
TOKEN="eyJodHRwIjoi..." # Token del login

curl -X POST http://localhost:3000/api/auth/validate-token \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta esperada (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "maria@example.com"
  }
}
```

### Via Frontend:
- Token se valida automáticamente en cada request
- Si token inválido/expirado → muestra "Acceso Denegado"

---

## 🧪 Test 4: Protected Routes

### Via cURL:
Sin token (debería fallar):
```bash
curl http://localhost:3000/api/restaurants
# 401: Missing authorization header
```

Con token (debería funcionar):
```bash
TOKEN="eyJodHRwIjoi..."

curl http://localhost:3000/api/restaurants \
  -H "Authorization: Bearer $TOKEN"
```

### Via Frontend:
- Sin login → RestaurantsPage no visible
- Vé mensaje "Debes iniciar sesión"
- Con login → RestaurantsPage accesible
- Logout → Regresa a login

---

## 🧪 Test 5: Registro & Login Completo en Frontend

### Flujo:
1. Abre `http://localhost:3001`
2. Página de home (si no hay sesión)
3. Click "Registrarse"
4. Formulario de registro:
   ```
   Name: Ana Martínez
   Email: ana@example.com
   Password: MySecurePass789
   Role: Propietario de Restaurante
   ```
5. Click "Registrarse" → Va a Login
6. Completa Login:
   ```
   Email: ana@example.com
   Password: MySecurePass789
   ```
7. Click "Iniciar Sesión"
8. ✅ Ve RestaurantsPage
9. Navbar muestra: "Ana Martínez (RESTAURANT_OWNER)"
10. Click Logout → Vuelve a login

---

## 🧪 Test 6: Validar Password Hashing

### Intenta login con password INCORRECTO:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "WrongPassword123"
  }'
```

**Respuesta esperada (401)**:
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

## 📋 Checklist de Validación

- [ ] Backend arranca sin errores
- [ ] Frontend arranca sin errores
- [ ] Puedo registrar usuario vía cURL ✅
- [ ] Puedo registrar usuario vía UI ✅
- [ ] Puedo login vía cURL ✅
- [ ] Puedo login vía UI ✅
- [ ] Token se guarda en localStorage ✅
- [ ] Puedo validar token ✅
- [ ] Sin token, no puedo acceder a rutas protegidas ✅
- [ ] Con token, puedo acceder ✅
- [ ] Password incorrecto rechaza login ✅
- [ ] Logout limpia tokens ✅
- [ ] Reload de página mantiene sesión (localStorage) ✅

---

## 🐛 Troubleshooting

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en backend/.env
PORT=3001
```

### Error: "Cannot find module"
```bash
cd backend
npm install
npm run build
```

### Error: CORS
Ya configurado en vite.config.ts - debería funcionar.

### Login no funciona
- Verifica que email y password sean correctos
- Asegúrate de haber registrado primero
- Revisa console del navegador por errores

### Token no se envía
- Debería estar en localStorage
- Abre DevTools → Application → Local Storage
- Verifica que `accessToken` existe

---

## 🔍 Details Under the Hood

### Password Hashing (Non-Production)
```
Plain: "SecurePass123"
Encoded: "YmNyeXB0OlNlY3VyZVBhc3MxMjM=" (base64)

En producción usaremos bcrypt:
bcrypt.hash("SecurePass123") → "$2b$10$..." (60 chars)
```

### JWT Token (Base64 simulado)
```
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "maria@example.com",
  "iat": 1713087000,
  "exp": 1713090600,  // +1 hora
  "type": "access"
}
↓ (base64 encoded)
eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6Im1hcmlhQGV4YW1wbGUuY29tIiwiaWF0IjoxNzEzMDg3MDAwLCJleHAiOjE3MTMwOTA2MDAsInR5cGUiOiJhY2Nlc3MifQ==
```

### Request Flow
```
Frontend (LoginPage)
  ↓ AuthService.login({email, password})
  ↓ axios.post('/auth/login')
  ↓ 
Backend (AuthController)
  ↓ LoginUserUseCase.execute(LoginUserDTO)
  ↓
Domain (User.recordLogin(), tokenGenerator.generateAccessToken())
  ↓
Response con tokens
  ↓ 
Frontend (localStorage.setItem, useAuthStore.setUser)
  ↓
Navigate to /home → RestaurantsPage

All subsequent requests:
  Authorization: Bearer {accessToken}
  ↓
AuthMiddleware valida token
  ↓
Si válido → continúa
Si inválido → 401 Unauthorized
```

---

## 🚀 Next Steps

Después de validar todo funciona:

1. **Tests**: Escribe unit tests para UseCases
2. **Prisma**: Setup PostgreSQL + Prisma ORM
3. **Production**: Implementar bcrypt real + jsonwebtoken librería
4. **Sprint 2**: Update, Delete, List restaurantes

---

## 📞 Support

- **Errores de build**: `npm run build`
- **Errores de import**: Verifica path aliases en `tsconfig.json`
- **API offline**: Asegúrate que backend está en puerto 3000
- **Token inválido**: Limpia localStorage y rehaz login

---

**¿Todo funciona?** → Listo para Sprint 2! 🎉

Prueba ahora, reporta cualquier issue.
