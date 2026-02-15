# Kika Braids - Sistema de Reservas

Sistema completo de reservas para Kika Braids con React + Node.js + SQLite.

## 🚀 Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor
```bash
npm start
```

El servidor se iniciará en `http://localhost:5000`

## 📋 Características

✅ **Calendario de Reservas**
- Detección automática de horarios ocupados
- Validación de disponibilidad en tiempo real
- Prevención de doble reserva

✅ **Panel Administrativo**
- Gestión completa de reservas
- Cambio de estado (pendiente → completada)
- Eliminación de reservas

✅ **Gestión de Servicios**
- Crear nuevos servicios
- Editar servicios existentes
- Eliminar servicios
- Persistencia en base de datos

✅ **Base de Datos Segura**
- SQLite local
- Datos persistentes
- Relaciones entre tablas

## 📁 Estructura

```
kika_braids/
├── server.js              # Backend Node.js + Express
├── index.html             # Frontend React
├── styles.css             # Estilos CSS
├── package.json           # Dependencias
├── .env                   # Variables de entorno
├── .gitignore             # Archivos ignorados en Git
└── kika_braids.db         # Base de datos (generada automáticamente)
```

## 🔐 Seguridad

- Credenciales en `.env` (no se suben a Git)
- `.gitignore` protege archivos sensibles
- Base de datos local sin exposición

## 🛠️ API Endpoints

### Servicios
- `GET /api/services` - Obtener todos los servicios
- `POST /api/services` - Crear nuevo servicio
- `PUT /api/services/:id` - Actualizar servicio
- `DELETE /api/services/:id` - Eliminar servicio

### Reservas
- `GET /api/bookings` - Obtener todas las reservas
- `POST /api/bookings` - Crear nueva reserva
- `POST /api/bookings/check-availability` - Verificar disponibilidad
- `PUT /api/bookings/:id` - Actualizar estado
- `DELETE /api/bookings/:id` - Eliminar reserva

### Estadísticas
- `GET /api/stats` - Obtener estadísticas generales

## 👤 Acceso Admin

**Contraseña:** `kikabraids2026`

## 📝 Notas

- La primera vez que inicia, la DB se crea automáticamente con servicios iniciales
- Las reservas se guardan permanentemente
- Los productos agregados desde el admin persisten en la BD
