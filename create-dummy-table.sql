
-- Create a dummy table for testing
CREATE TABLE IF NOT EXISTS dummy_products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO dummy_products (product_name, price, category, in_stock) VALUES
('Smartphone X', 599.99, 'Electronics', TRUE),
('Laptop Pro', 1299.99, 'Electronics', TRUE),
('Cotton T-Shirt', 19.99, 'Apparel', TRUE),
('Coffee Maker', 79.99, 'Home Appliances', FALSE),
('Wireless Headphones', 149.99, 'Electronics', TRUE);

-- Verify the data
SELECT * FROM dummy_products;
DROP TABLE `dummy_products`;
