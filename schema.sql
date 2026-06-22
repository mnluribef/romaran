-- Esquema de Base de Datos - SUBLICOLOR

-- Tabla de Tipos de Producto (Ramas de productos)
CREATE TABLE IF NOT EXISTS product_types (
    id TEXT PRIMARY KEY, -- 'apparel', 'mug', 'sticker', 'accessory', etc.
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'package',
    attributes TEXT DEFAULT '[]' -- JSON array de atributos válidos para esta rama
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL DEFAULT 0.0,
    category TEXT,
    icon TEXT,
    image_url TEXT,
    sizes TEXT, -- Tallas separadas por comas (para compatibilidad)
    type_id TEXT REFERENCES product_types(id), -- Rama asociada
    active INTEGER NOT NULL DEFAULT 1, -- 1 = Activo, 0 = Inactivo
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Atributos de Producto por Instancia
CREATE TABLE IF NOT EXISTS product_attributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    attr_key TEXT NOT NULL,       -- Ej: 'color', 'finish', 'capacity'
    attr_label TEXT NOT NULL,     -- Ej: 'Color', 'Acabado', 'Capacidad'
    attr_values TEXT NOT NULL,    -- JSON array de valores válidos: ["Blanco","Negro"]
    attr_type TEXT DEFAULT 'select', -- 'select', 'color_swatch', 'toggle'
    price_matrix TEXT DEFAULT '{}',  -- JSON object con deltas de precio: {"XL": 1.5, "XXL": 2.0}
    required INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Tabla de Variantes/Opciones de Producto (Para stock e identificadores únicos opcionales)
CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    sku TEXT,
    label TEXT NOT NULL,          -- Ej: 'Talla M, Color Rojo' o 'Mate, 11oz'
    price_delta REAL DEFAULT 0.0,
    stock INTEGER DEFAULT -1,     -- -1 = Ilimitado
    active INTEGER DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Tabla de Pedidos
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- ID único del pedido (ej: SUB-XXXX)
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, en_produccion, listo_entrega, completado, cancelado
    total_items INTEGER NOT NULL DEFAULT 0,
    total_price REAL NOT NULL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalles de Pedido (Productos asociados)
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size TEXT, -- Talla o variante seleccionada (opcional)
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL DEFAULT 0.0, -- Precio al momento de la compra
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
    password_salt TEXT, -- Salt para PBKDF2 (Nulo indica que requiere migración desde SHA-256)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Sesiones Activas
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at INTEGER NOT NULL -- Timestamp Unix de expiración
);

-- --- ÍNDICES PARA OPTIMIZACIÓN DE BÚSQUEDAS ---
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type_id);
CREATE INDEX IF NOT EXISTS idx_product_attributes_product ON product_attributes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_fecha ON sales(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- --- PRECARGA DE DATOS ---

-- Insertar tipos de productos iniciales
INSERT OR REPLACE INTO product_types (id, name, description, icon, attributes) VALUES
('apparel', 'Vestimenta', 'Prendas de vestir personalizables', 'shirt', '["size"]'),
('mug', 'Hogar y Tazas', 'Tazas y artículos de cerámica', 'coffee', '[]'),
('accessory', 'Accesorios', 'Gorras, llaveros y popsockets', 'crown', '[]'),
('print', 'Impresión y Vinil', 'Cortes de vinil y material publicitario', 'scissors', '[]');

-- Insertar productos iniciales del catálogo existente
INSERT OR REPLACE INTO products (id, name, description, price, category, icon, image_url, sizes, type_id, active) VALUES
('franela', 'Franela Personalizada', 'Franelas de alta calidad con estampados full color que resisten el paso del tiempo.', 0.0, 'vestimenta', 'shirt', 'assets/product_franela.png', 'S,M,L,XL', 'apparel', 1),
('taza', 'Taza Sublimada', 'Tazas de cerámica premium, perfectas para regalos o detalles especiales.', 0.0, 'hogar', 'coffee', 'assets/product_taza.png', NULL, 'mug', 1),
('gorra', 'Gorra Personalizada', 'Gorras con diseños únicos usando vinil textil o sublimación de la mejor calidad.', 0.0, 'accesorios', 'crown', 'assets/product_gorras.png', NULL, 'accessory', 1),
('vinil', 'Vinil Textil', 'Cortes precisos y aplicaciones duraderas para uniformes y moda urbana.', 0.0, 'impresion', 'scissors', 'assets/product_vinil.png', NULL, 'print', 1),
('pop', 'Pop Socket', 'Agarres para celulares con el logo de tu marca a todo color.', 0.0, 'accesorios', 'circle-dot', 'assets/product_popsockets.png', NULL, 'accessory', 1),
('lanyard', 'Llavero / Lanyard', 'Identificadores, cintas y llaveros ideales para eventos y merchandising.', 0.0, 'accesorios', 'link', 'assets/product_lanyards.png', NULL, 'accessory', 1);

-- Insertar usuario admin inicial (contraseña por defecto: "admin123" usando hash SHA-256 legacy)
INSERT OR REPLACE INTO users (username, password_hash, password_salt) VALUES
('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', NULL);

