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
            kanekalon INTEGER,
            natural INTEGER,
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

    // Tabla de Testimonios
    db.run(`
        CREATE TABLE IF NOT EXISTS testimonials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            rating INTEGER NOT NULL,
            message TEXT NOT NULL,
            service_name TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Insertar servicios iniciales si no existen
    db.all("SELECT name FROM services", (err, rows) => {
        const existingNames = rows ? rows.map(r => r.name) : [];
        const initialServices = [
            { name: 'Box Braids', price: 45000, description: 'Trenzas africanas clásicas', image: '', category: 'women', kanekalon: 45000,},
            { name: 'Twists', price: 50000, description: 'Twists para cabello natural', image: '', category: 'women', kanekalon: 50000, natural: 45000 },
            { name: 'Cornrows', price: 60000, description: 'Trenzas pegadas al cuero cabelludo', image: '', category: 'women', kanekalon: 65000, natural: 60000 },
            { name: 'Trenzas', price: 65000, description: 'Trenzas tradicionales y modernas', image: '', category: 'women', kanekalon: 50000, natural: 40000 },
            { name: 'Definición de rizos', price: 55000, description: 'Definición profesional de rizos para cabello natural', image: '', category: 'women',},
            { name: 'Trenzas Hombre', price: 50000, description: 'Trenzas modernas para hombres', image: '', category: 'men', kanekalon: 55000, natural: 50000 },
            { name: 'Gusanillos', price: 45000, description: 'Gusanillos artísticos', image: '', category: 'men', kanekalon: 50000, natural: 45000 },
            { name: 'Cornrows Hombre', price: 40000, description: 'Cornrows para hombres', image: '', category: 'men', kanekalon: 45000, natural: 40000 }
        ];
        initialServices.forEach(service => {
            if (!existingNames.includes(service.name)) {
                db.run(
                    'INSERT INTO services (name, price, description, image, category, kanekalon, natural) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [service.name, service.price, service.description, service.image, service.category, service.kanekalon, service.natural]
                );
            }
        });
        if (initialServices.length > 0) {
            console.log('✅ Peinados por defecto insertados al inventario si faltaban');
        }
    });

    // Insertar testimonios de ejemplo si no existen
    db.all("SELECT COUNT(*) as count FROM testimonials", (err, rows) => {
        if (rows && rows[0].count === 0) {
            const testimonials = [
                { name: 'María López', email: 'maria@example.com', rating: 5, message: 'Kika es una artista. Mi peinado duró 8 semanas perfectas y el cuidado que me dieron fue excepcional. ¡Definitivamente vuelvo!', service_name: 'Trenzas Box Braids', status: 'approved' },
                { name: 'Juan Carlos', email: 'juan@example.com', rating: 5, message: 'Excelente profesionalismo. El equipo es muy amable y te hace sentir cómodo durante todo el proceso. Totalmente recomendado.', service_name: 'Gusanillos', status: 'approved' },
                { name: 'Sandra García', email: 'sandra@example.com', rating: 5, message: 'Transformaron mi cabello. Llegué sin esperanzas y salí feliz. Han ganado una clienta de por vida.', service_name: 'Extensiones Afro', status: 'approved' }
            ];

            testimonials.forEach(t => {
                db.run(
                    'INSERT INTO testimonials (name, email, rating, message, service_name, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [t.name, t.email, t.rating, t.message, t.service_name, t.status]
                );
            });
            console.log('✅ Testimonios iniciales insertados');
        }
    });
}

// ==================== ENDPOINTS DE SERVICIOS ====================
// Endpoint para subir imágenes
const multer = require('multer');
const upload = multer({
    dest: path.join(__dirname, 'img'),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    // Guardar el nombre del archivo
    const filename = req.file.filename;
    const ext = path.extname(req.file.originalname);
    const newFilename = filename + ext;
    const oldPath = req.file.path;
    const newPath = path.join(req.file.destination, newFilename);
    // Renombrar para conservar extensión
    require('fs').rename(oldPath, newPath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al guardar imagen' });
        }
        res.json({ imageUrl: '/img/' + newFilename });
    });
});

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
                    // Enviar notificación por WhatsApp
                    const whatsappNumber = '3116620413';
                    const message = `Nueva reserva:\nNombre: ${name}\nServicio: ${service_name}\nFecha: ${date} a las ${time}\nTeléfono: ${phone}\nNotas: ${notes || ''}`;
                    // Enviar usando WhatsApp Web (solo abre enlace, requiere WhatsApp en el dispositivo)
                    // Puedes integrar Twilio o una API real si lo deseas
                    const whatsappUrl = `https://wa.me/57${whatsappNumber}?text=${encodeURIComponent(message)}`;
                    // Solo para propósitos de backend, no abre el navegador, pero puedes registrar el enlace
                    console.log('Reserva enviada a WhatsApp:', whatsappUrl);
                    res.json({ 
                        id: this.lastID, 
                        name, email, phone, service_id, service_name, price, date, time, notes,
                        status: 'pending',
                        created_at: new Date().toISOString(),
                        whatsappUrl
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

// ==================== ENDPOINTS TESTIMONIOS ====================

// Obtener testimonios aprobados
app.get('/api/testimonials', (req, res) => {
    db.all('SELECT * FROM testimonials WHERE status = "approved" ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows || []);
    });
});

// Obtener todos los testimonios (admin)
app.get('/api/testimonials/all', (req, res) => {
    db.all('SELECT * FROM testimonials ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows || []);
    });
});

// Crear nuevo testimonio
app.post('/api/testimonials', (req, res) => {
    const { name, email, rating, message, service_name } = req.body;
    
    if (!name || !email || !rating || !message) {
        res.status(400).json({ error: 'Faltan campos requeridos' });
        return;
    }
    
    db.run(
        'INSERT INTO testimonials (name, email, rating, message, service_name, status) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, rating, message, service_name || '', 'pending'],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Gracias por tu comentario. Será revisado y publicado pronto.' });
        }
    );
});

// Actualizar estado de testimonio (admin - aprobar/rechazar)
app.put('/api/testimonials/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    db.run(
        'UPDATE testimonials SET status = ? WHERE id = ?',
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

// Eliminar testimonio
app.delete('/api/testimonials/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM testimonials WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Testimonio eliminado' });
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
