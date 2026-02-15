const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inicializar base de datos SQLite
const dbPath = path.join(__dirname, 'kika_braids.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('✅ Conectado a SQLite');
        initializeDatabase();
    }
});

// Inicializar tablas
function initializeDatabase() {
    // Tabla de Servicios
    db.run(`
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            description TEXT,
            image TEXT,
            category TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabla de Reservas
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            service_id INTEGER NOT NULL,
            service_name TEXT NOT NULL,
            price INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            notes TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(service_id) REFERENCES services(id),
            UNIQUE(date, time)
        )
    `);

    // Insertar servicios iniciales si no existen
    db.all("SELECT COUNT(*) as count FROM services", (err, rows) => {
        if (rows && rows[0].count === 0) {
            const initialServices = [
                { name: 'Trenzas Africanas', price: 150000, description: 'Trenzas clásicas africanas', image: 'img/trenzas.jpg', category: 'women' },
                { name: 'Trenzas Box Braids', price: 180000, description: 'Box braids premium', image: 'img/box-braids.jpg', category: 'women' },
                { name: 'Extensiones Afro', price: 200000, description: 'Extensiones de cabello afro', image: 'img/extensiones.jpg', category: 'women' },
                { name: 'Loc o Ganchillos', price: 160000, description: 'Loc y ganchillos instalados', image: 'img/locs.jpg', category: 'women' },
                { name: 'Peinado Natural', price: 85000, description: 'Definición y peinado natural', image: 'img/natural.jpg', category: 'women' },
                { name: 'Alisado Japonés', price: 220000, description: 'Alisado profesional', image: 'img/alisado.jpg', category: 'women' },
                { name: 'Trenzas Hombre', price: 120000, description: 'Trenzas personalizadas para hombres', image: 'img/trenzas-hombre.jpg', category: 'men' },
                { name: 'Gusanillos', price: 100000, description: 'Gusanillos con diseño', image: 'img/gusanillos.jpg', category: 'men' },
                { name: 'Definición de Crespo', price: 80000, description: 'Definición y cuidado de cabello crespo', image: 'img/definicion.jpg', category: 'men' },
                { name: 'Loc Hombre', price: 140000, description: 'Loc profesional para hombres', image: 'img/loc-hombre.jpg', category: 'men' },
                { name: 'Corte y Definición', price: 95000, description: 'Corte con líneas y definición', image: 'img/corte.jpg', category: 'men' }
            ];

            initialServices.forEach(service => {
                db.run(
                    'INSERT INTO services (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)',
                    [service.name, service.price, service.description, service.image, service.category]
                );
            });
            console.log('✅ Servicios iniciales insertados');
        }
    });
}

// ==================== ENDPOINTS DE SERVICIOS ====================

// Obtener todos los servicios
app.get('/api/services', (req, res) => {
    db.all('SELECT * FROM services ORDER BY category, name', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const services = {
            women: rows.filter(s => s.category === 'women'),
            men: rows.filter(s => s.category === 'men')
        };
        
        res.json(services);
    });
});

// Obtener todos los servicios como array plano
app.get('/api/services/all', (req, res) => {
    db.all('SELECT * FROM services ORDER BY category, name', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Crear nuevo servicio
app.post('/api/services', (req, res) => {
    const { name, price, description, image, category } = req.body;
    
    if (!name || !price || !category) {
        res.status(400).json({ error: 'Faltan campos requeridos' });
        return;
    }
    
    db.run(
        'INSERT INTO services (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)',
        [name, price, description || '', image || 'img/default.jpg', category],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, name, price, description, image, category });
        }
    );
});

// Actualizar servicio
app.put('/api/services/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, description, image, category } = req.body;
    
    db.run(
        'UPDATE services SET name = ?, price = ?, description = ?, image = ?, category = ? WHERE id = ?',
        [name, price, description, image, category, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id, name, price, description, image, category });
        }
    );
});

// Eliminar servicio
app.delete('/api/services/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM services WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Servicio eliminado' });
    });
});

// ==================== ENDPOINTS DE RESERVAS ====================

// Obtener todas las reservas
app.get('/api/bookings', (req, res) => {
    db.all('SELECT * FROM bookings ORDER BY date DESC, time DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Verificar disponibilidad de fecha y hora
app.post('/api/bookings/check-availability', (req, res) => {
    const { date, time } = req.body;
    
    if (!date || !time) {
        res.status(400).json({ error: 'Fecha y hora requeridas' });
        return;
    }
    
    db.get(
        'SELECT id FROM bookings WHERE date = ? AND time = ? AND status != "cancelled"',
        [date, time],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (row) {
                res.json({ available: false, message: 'Este horario ya está ocupado' });
            } else {
                res.json({ available: true, message: 'Horario disponible' });
            }
        }
    );
});

// Crear nueva reserva
app.post('/api/bookings', (req, res) => {
    const { name, email, phone, service_id, service_name, price, date, time, notes } = req.body;
    
    if (!name || !email || !phone || !service_id || !date || !time) {
        res.status(400).json({ error: 'Faltan campos requeridos' });
        return;
    }
    
    // Verificar disponibilidad
    db.get(
        'SELECT id FROM bookings WHERE date = ? AND time = ? AND status != "cancelled"',
        [date, time],
        (err, existingBooking) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (existingBooking) {
                res.status(400).json({ error: 'Este horario ya está ocupado' });
                return;
            }
            
            // Crear la reserva
            db.run(
                'INSERT INTO bookings (name, email, phone, service_id, service_name, price, date, time, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name, email, phone, service_id, service_name, price, date, time, notes || '', 'pending'],
                function(err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    res.json({ 
                        id: this.lastID, 
                        name, email, phone, service_id, service_name, price, date, time, notes,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    });
                }
            );
        }
    );
});

// Actualizar estado de reserva
app.put('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
        res.status(400).json({ error: 'Estado requerido' });
        return;
    }
    
    db.run(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id, status });
        }
    );
});

// Eliminar reserva
app.delete('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM bookings WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Reserva eliminada' });
    });
});

// ==================== ENDPOINTS ESTADÍSTICAS ====================

// Obtener estadísticas
app.get('/api/stats', (req, res) => {
    db.all(`
        SELECT 
            (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_count,
            (SELECT COUNT(*) FROM bookings) as total_count,
            (SELECT SUM(price) FROM bookings WHERE status = 'completed') as total_revenue
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const stats = rows[0];
        res.json({
            pending: stats.pending_count || 0,
            total: stats.total_count || 0,
            revenue: stats.total_revenue || 0
        });
    });
});

// ==================== SERVIR ARCHIVOS ESTÁTICOS ====================

app.use(express.static(path.join(__dirname)));

// Servir index.html para todas las rutas (SPA)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Base de datos: ${dbPath}`);
});

// Manejar cierre de la aplicación
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error(err);
        console.log('✅ Base de datos cerrada');
        process.exit(0);
    });
});
