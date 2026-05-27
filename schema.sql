-- Esquema de Base de Datos - SUBLICOLOR

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL DEFAULT 0.0,
    category TEXT,
    icon TEXT,
    image_url TEXT,
    sizes TEXT, -- Tallas separadas por comas, ej: "S,M,L,XL"
    active INTEGER NOT NULL DEFAULT 1, -- 1 = Activo, 0 = Inactivo
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Pedidos
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- ID único del pedido (ej: SUB-XXXX)
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, en_produccion, listo_entrega, completado, cancelado
    total_items INTEGER NOT NULL DEFAULT 0,
    total_price REAL NOT NULL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalles de Pedido (Productos asociados)
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size TEXT, -- Talla seleccionada (opcional)
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Tabla de Ventas Registradas
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    monto REAL NOT NULL DEFAULT 0.0,
    metodo_pago TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Tabla de Usuarios Administradores
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Sesiones Activas
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at INTEGER NOT NULL -- Timestamp Unix de expiración
);

-- --- PRECARGA DE DATOS ---

-- Insertar productos iniciales del catálogo existente
INSERT OR REPLACE INTO products (id, name, description, price, category, icon, image_url, sizes, active) VALUES
('franela', 'Franela Personalizada', 'Franelas de alta calidad con estampados full color que resisten el paso del tiempo.', 0.0, 'vestimenta', 'shirt', 'assets/product_franela.png', 'S,M,L,XL', 1),
('taza', 'Taza Sublimada', 'Tazas de cerámica premium, perfectas para regalos o detalles especiales.', 0.0, 'hogar', 'coffee', 'assets/product_taza.png', NULL, 1),
('gorra', 'Gorra Personalizada', 'Gorras con diseños únicos usando vinil textil o sublimación de la mejor calidad.', 0.0, 'accesorios', 'crown', 'assets/product_gorras.png', NULL, 1),
('vinil', 'Vinil Textil', 'Cortes precisos y aplicaciones duraderas para uniformes y moda urbana.', 0.0, 'impresion', 'scissors', 'assets/product_vinil.png', NULL, 1),
('pop', 'Pop Socket', 'Agarres para celulares con el logo de tu marca a todo color.', 0.0, 'accesorios', 'circle-dot', 'assets/product_popsockets.png', NULL, 1),
('lanyard', 'Llavero / Lanyard', 'Identificadores, cintas y llaveros ideales para eventos y merchandising.', 0.0, 'accesorios', 'link', 'assets/product_lanyards.png', NULL, 1);

-- Insertar usuario admin inicial (contraseña por defecto: "admin123" usando hash SHA-256)
-- Hash de "admin123": 2407891470e8da5c3a4f66a939f7574a6b251910cf1c0d489b09fa5d6e2e0f2f (SHA-256 en hexadecimal)
INSERT OR IGNORE INTO users (username, password_hash) VALUES
('admin', '2407891470e8da5c3a4f66a939f7574a6b251910cf1c0d489b09fa5d6e2e0f2f');
