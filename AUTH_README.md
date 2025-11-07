# Sistema de Autenticación

## ✅ Componentes creados:

### 1. **Navbar** (`pages/components/Navbar.js`)
- Navbar fija en la parte superior
- Logo temporal (reemplazar con `/logo_mini.png`)
- Botones de "Iniciar Sesión" y "Registrarse"
- Modales integrados

### 2. **LoginModal** (`pages/components/LoginModal.js`)
- Modal de inicio de sesión
- Envía petición POST a `/auth/login`
- Formato: `application/x-www-form-urlencoded`
- Guarda token en `localStorage`
- Redirige a `/dashboard` al completar

### 3. **RegisterModal** (`pages/components/RegisterModal.js`)
- Modal de registro
- Validación de contraseñas
- Envía petición POST a `/auth/register`

### 4. **Dashboard** (`pages/dashboard/index.js`)
- Página simple post-login
- Muestra el token guardado
- Botón de cerrar sesión
- Protegida (redirige si no hay token)

## 🔧 Configuración:

### Variables de entorno (`.env`):
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Uso del token en peticiones:
```javascript
import { fetchWithAuth } from '@/lib/auth';

// Hacer petición autenticada
const response = await fetchWithAuth('/api/endpoint', {
  method: 'GET',
});
```

### Obtener token manualmente:
```javascript
const token = localStorage.getItem('access_token');
const tokenType = localStorage.getItem('token_type');
```

## 📝 Notas:

1. **Logo**: Coloca tu logo en `/public/logo_mini.png` y descomenta el código en `Navbar.js`
2. **API de Registro**: Actualiza el endpoint `/auth/register` según tu backend
3. **Rutas protegidas**: Usa el patrón del Dashboard para proteger otras páginas
4. **Personalización**: Los modales usan shadcn/ui, puedes personalizar estilos en `components/ui/`

## 🎨 Personalización de colores:

Los colores están en `styles/globals.css` usando CSS variables de shadcn.
