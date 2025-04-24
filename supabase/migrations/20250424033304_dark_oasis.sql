/*
  # Create orders table for Anonymous Angel

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `request_id` (text, unique)
      - `product_id` (text)
      - `product_name` (text)
      - `message` (text, nullable)
      - `recipient_name` (text)
      - `reveal_email` (text, nullable)
      - `price` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `orders` table
    - Add policy for authenticated users to read their own data
    - Add policy for service role to manage all data
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text UNIQUE NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  message text,
  recipient_name text NOT NULL,
  reveal_email text,
  price numeric(10,2) NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all orders
CREATE POLICY "Service role can manage orders"
  ON orders
  FOR ALL
  TO service_role
  USING (true);

-- Allow users to read their own orders (if they authenticated with the reveal_email)
CREATE POLICY "Users can read their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.email() = reveal_email);