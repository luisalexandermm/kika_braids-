// Datos de servicios con precios en pesos colombianos
const services = {
  women: [
    { id: 1, name: 'Trenzas Africanas', price: 150000, description: 'Trenzas clásicas africanas', image: 'img/trenzas.jpg' },
    { id: 2, name: 'Trenzas Box Braids', price: 180000, description: 'Box braids premium', image: 'img/box-braids.jpg' },
    { id: 3, name: 'Extensiones Afro', price: 200000, description: 'Extensiones de cabello afro', image: 'img/extensiones.jpg' },
    { id: 4, name: 'Loc o Ganchillos', price: 160000, description: 'Loc y ganchillos instalados', image: 'img/locs.jpg' },
    { id: 5, name: 'Peinado Natural', price: 85000, description: 'Definición y peinado natural', image: 'img/natural.jpg' },
    { id: 6, name: 'Alisado Japonés', price: 220000, description: 'Alisado profesional', image: 'img/alisado.jpg' }
  ],
  men: [
    { id: 7, name: 'Trenzas Hombre', price: 120000, description: 'Trenzas personalizadas para hombres', image: 'img/trenzas-hombre.jpg' },
    { id: 8, name: 'Gusanillos', price: 100000, description: 'Gusanillos con diseño', image: 'img/gusanillos.jpg' },
    { id: 9, name: 'Définición de Crespo', price: 80000, description: 'Definición y cuidado de cabello crespo', image: 'img/definicion.jpg' },
    { id: 10, name: 'Loc Hombre', price: 140000, description: 'Loc profesional para hombres', image: 'img/loc-hombre.jpg' },
    { id: 11, name: 'Corte y Definición', price: 95000, description: 'Corte con líneas y definición', image: 'img/corte.jpg' }
  ]
};

// Estado de reservas
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
let adminAuthenticated = false;

// Función para cambiar de página
function showPage(pageName) {
  // Ocultar todas las páginas
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  
  // Mostrar página solicitada
  const pageElement = document.getElementById(`page-${pageName}`);
  if (pageElement) {
    pageElement.classList.add('active');
    
    // Actualizar nav links
    const navLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Cerrar menú móvil
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      mobileMenu.style.display = 'none';
    }
    
    // Scroll al inicio
    window.scrollTo(0, 0);
    
    // Cargar datos específicos de la página
    if (pageName === 'services') {
      loadAllServices();
    } else if (pageName === 'gallery') {
      loadGallery();
    } else if (pageName === 'booking') {
      loadServiceSelect();
    } else if (pageName === 'admin-dashboard') {
      loadAdminDashboard();
    }
  }
}

// Función para menú móvil
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.style.display = mobileMenu.style.display === 'none' ? 'block' : 'none';
  }
}

// Cargar servicios en la página de inicio
function loadHomeServices() {
  const womenServices = document.getElementById('women-services');
  const menServices = document.getElementById('men-services');
  
  if (womenServices) {
    womenServices.innerHTML = services.women.slice(0, 3).map(service => 
      createServiceCard(service)
    ).join('');
  }
  
  if (menServices) {
    menServices.innerHTML = services.men.slice(0, 3).map(service => 
      createServiceCard(service)
    ).join('');
  }
}

// Cargar todos los servicios
function loadAllServices() {
  const womenServices = document.getElementById('all-women-services');
  const menServices = document.getElementById('all-men-services');
  
  if (womenServices) {
    womenServices.innerHTML = services.women.map(service => 
      createServiceCard(service)
    ).join('');
  }
  
  if (menServices) {
    menServices.innerHTML = services.men.map(service => 
      createServiceCard(service)
    ).join('');
  }
}

// Cargar servicios específicos por categoría
function loadCategoryServices(category) {
  const categoryServices = category === 'women' ? services.women : services.men;
  
  showPage(category === 'women' ? 'women' : 'men');
  
  const containerId = category === 'women' ? 'women-services-page' : 'men-services-page';
  const servicesContainer = document.getElementById(containerId);
  if (servicesContainer) {
    servicesContainer.innerHTML = categoryServices.map(service => 
      createServiceCard(service)
    ).join('');
  }
}

// Crear tarjeta de servicio
function createServiceCard(service) {
  return `
    <div class="service-card">
      <img src="${service.image}" alt="${service.name}" class="service-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22300%22 height=%22300%22/%3E%3C/svg%3E'">
      <div class="service-content">
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <div class="service-footer">
          <span class="service-price">$${service.price.toLocaleString('es-CO')}</span>
          <button class="btn btn-small" onclick="bookService(${service.id})">Reservar</button>
        </div>
      </div>
    </div>
  `;
}

// Reservar servicio
function bookService(serviceId) {
  const service = [...services.women, ...services.men].find(s => s.id === serviceId);
  if (service) {
    document.getElementById('service-select').value = serviceId;
    showPage('booking');
  }
}

// Cargar opciones de servicio en selector
function loadServiceSelect() {
  const select = document.getElementById('service-select');
  if (select) {
    select.innerHTML = '<option value="">Selecciona un servicio</option>';
    
    const allServices = [...services.women, ...services.men];
    
    // Grupo de servicios para mujeres
    const womenOptgroup = document.createElement('optgroup');
    womenOptgroup.label = 'Servicios para Mujeres';
    services.women.forEach(service => {
      const option = document.createElement('option');
      option.value = service.id;
      option.textContent = `${service.name} - $${service.price.toLocaleString('es-CO')}`;
      womenOptgroup.appendChild(option);
    });
    select.appendChild(womenOptgroup);
    
    // Grupo de servicios para hombres
    const menOptgroup = document.createElement('optgroup');
    menOptgroup.label = 'Servicios para Hombres';
    services.men.forEach(service => {
      const option = document.createElement('option');
      option.value = service.id;
      option.textContent = `${service.name} - $${service.price.toLocaleString('es-CO')}`;
      menOptgroup.appendChild(option);
    });
    select.appendChild(menOptgroup);
  }
}

// Manejar reserva
function handleBooking(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const serviceId = parseInt(formData.get('service'));
  const service = [...services.women, ...services.men].find(s => s.id === serviceId);
  
  const booking = {
    id: Date.now(),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    service: service.name,
    serviceId: serviceId,
    price: service.price,
    date: formData.get('date'),
    time: formData.get('time'),
    notes: formData.get('notes'),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  bookings.push(booking);
  localStorage.setItem('bookings', JSON.stringify(bookings));
  
  showToast('¡Reserva enviada! El administrador se pondrá en contacto pronto.');
  event.target.reset();
  
  setTimeout(() => showPage('home'), 2000);
}

// Cargar galería
function loadGallery() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    const images = Array(12).fill().map((_, i) => `
      <div class="gallery-item">
        <img src="img/gallery-${i + 1}.jpg" alt="Galería ${i + 1}" 
             onerror="this.parentElement.innerHTML='<div class=\\"gallery-placeholder\\">Imagen ${i + 1}</div>'">
      </div>
    `).join('');
    galleryGrid.innerHTML = images;
  }
}

// Admin - Manejar login
function handleAdminLogin(event) {
  event.preventDefault();
  
  const password = document.getElementById('admin-password').value;
  
  if (password === 'kikabraids2026') {
    adminAuthenticated = true;
    sessionStorage.setItem('adminAuth', 'true');
    showPage('admin-dashboard');
  } else {
    showToast('Contraseña incorrecta', 'error');
  }
}

// Admin - Logout
function handleAdminLogout() {
  adminAuthenticated = false;
  sessionStorage.removeItem('adminAuth');
  showPage('home');
  showToast('Sesión cerrada');
}

// Admin - Cargar dashboard
function loadAdminDashboard() {
  if (!adminAuthenticated && !sessionStorage.getItem('adminAuth')) {
    showPage('admin');
    return;
  }
  
  // Mostrar página del dashboard
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  const dashboardPage = document.getElementById('page-admin-dashboard');
  if (dashboardPage) {
    dashboardPage.classList.add('active');
  }
  
  window.scrollTo(0, 0);
  
  loadAdminStats();
  loadAdminBookings();
  loadAdminProducts();
}

// Admin - Cargar estadísticas
function loadAdminStats() {
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const totalCount = bookings.length;
  const revenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.price, 0);
  
  document.getElementById('stat-pending').textContent = pendingCount;
  document.getElementById('stat-total').textContent = totalCount;
  document.getElementById('stat-revenue').textContent = `$${revenue.toLocaleString('es-CO')}`;
}

// Admin - Cargar reservas
function loadAdminBookings() {
  const bookingsList = document.getElementById('bookings-list');
  
  if (bookingsList) {
    if (bookings.length === 0) {
      bookingsList.innerHTML = '<p style="text-align:center; color: #999; padding: 2rem;">No hay reservas aún</p>';
      return;
    }
    
    bookingsList.innerHTML = bookings.map(booking => `
      <div class="booking-card" style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem;">
        <div class="booking-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600;">${booking.name}</h3>
            <p style="margin: 0.25rem 0; color: #666; font-size: 0.875rem;">${booking.service}</p>
          </div>
          <span style="background: ${booking.status === 'pending' ? '#fef3c7' : '#d1fae5'}; color: ${booking.status === 'pending' ? '#92400e' : '#065f46'}; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600;">
            ${booking.status === 'pending' ? 'Pendiente' : 'Completada'}
          </span>
        </div>
        <div class="booking-details" style="gap: 1rem; margin-bottom: 1rem; font-size: 0.875rem;">
          <p style="margin: 0;"><strong>📧 Email:</strong> ${booking.email}</p>
          <p style="margin: 0;"><strong>📞 Teléfono:</strong> ${booking.phone}</p>
          <p style="margin: 0;"><strong>💰 Precio:</strong> $${booking.price.toLocaleString('es-CO')}</p>
          <p style="margin: 0;"><strong>📅 Fecha:</strong> ${booking.date} a las ${booking.time}</p>
          ${booking.notes ? `<p style="margin: 0;"><strong>📝 Notas:</strong> ${booking.notes}</p>` : ''}
        </div>
        <div class="booking-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-small ${booking.status === 'completed' ? 'btn-disabled' : ''}" 
                  onclick="completeBooking(${booking.id})" 
                  ${booking.status === 'completed' ? 'disabled' : ''} 
                  style="max-width: 150px;">
            ✓ Completar
          </button>
          <button class="btn btn-small btn-danger" onclick="deleteBooking(${booking.id})" style="max-width: 150px;">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `).join('');
  }
}

// Admin - Completar reserva
function completeBooking(bookingId) {
  const booking = bookings.find(b => b.id === bookingId);
  if (booking) {
    booking.status = 'completed';
    localStorage.setItem('bookings', JSON.stringify(bookings));
    loadAdminBookings();
    loadAdminStats();
    showToast('Reserva marcada como completada');
  }
}

// Admin - Eliminar reserva
function deleteBooking(bookingId) {
  if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
    bookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    loadAdminBookings();
    loadAdminStats();
    showToast('Reserva eliminada');
  }
}

// Admin - Cargar productos
function loadAdminProducts() {
  const productsList = document.getElementById('products-list');
  
  if (productsList) {
    const allProducts = [...services.women.map(p => ({...p, category: 'women'})), 
                         ...services.men.map(p => ({...p, category: 'men'}))];
    
    productsList.innerHTML = allProducts.map(product => `
      <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; background: white;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1.125rem;">${product.name}</h4>
        <p style="margin: 0.5rem 0; color: #666; font-size: 0.875rem;">${product.description}</p>
        <p style="margin: 0.5rem 0; color: var(--purple); font-weight: 600; font-size: 1.25rem;">$${product.price.toLocaleString('es-CO')}</p>
        <p style="margin: 0.5rem 0; color: #666; font-size: 0.875rem;">
          ${product.category === 'women' ? '👩 Servicio para Mujeres' : '👨 Servicio para Hombres'}
        </p>
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          <button class="btn btn-small" onclick="editProduct(${product.id})" style="flex: 1;">Editar</button>
          <button class="btn btn-small btn-danger" onclick="deleteProduct(${product.id})" style="flex: 1;">Eliminar</button>
        </div>
      </div>
    `).join('');
  }
}

// Admin - Agregar producto
function handleAddProduct(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const category = formData.get('category');
  const newId = Math.max(...services.women.map(s => s.id), ...services.men.map(s => s.id)) + 1;
  
  const newProduct = {
    id: newId,
    name: formData.get('name'),
    price: parseInt(formData.get('price')),
    description: formData.get('description') || '',
    image: formData.get('image') || 'img/default.jpg'
  };
  
  if (category === 'women') {
    services.women.push(newProduct);
  } else {
    services.men.push(newProduct);
  }
  
  localStorage.setItem('services', JSON.stringify(services));
  
  toggleAddProduct();
  loadAdminProducts();
  showToast('Servicio agregado exitosamente');
}

// Admin - Alternar formulario de agregar producto
function toggleAddProduct() {
  const form = document.getElementById('add-product-form');
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
}

// Admin - Eliminar producto
function deleteProduct(productId) {
  if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
    services.women = services.women.filter(s => s.id !== productId);
    services.men = services.men.filter(s => s.id !== productId);
    localStorage.setItem('services', JSON.stringify(services));
    loadAdminProducts();
    showToast('Servicio eliminado');
  }
}

// Admin - Mostrar tab
function showAdminTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab-btn');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  buttons.forEach(btn => btn.classList.remove('active'));
  
  const activeTab = document.getElementById(`admin-tab-${tabName}`);
  if (activeTab) {
    activeTab.classList.add('active');
    event.target.classList.add('active');
  }
}

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
  // Cargar servicios desde localStorage si existen
  const savedServices = localStorage.getItem('services');
  if (savedServices) {
    const parsed = JSON.parse(savedServices);
    services.women = parsed.women;
    services.men = parsed.men;
  }
  
  // Verificar autenticación admin
  if (sessionStorage.getItem('adminAuth')) {
    adminAuthenticated = true;
  }
  
  // Cargar servicios de la página de inicio
  loadHomeServices();
  
  // Enviar email de reserva (simulado)
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBooking);
  }
});

// Funciones para editar producto (stub)
function editProduct(productId) {
  showToast('Función de edición en desarrollo');
}
