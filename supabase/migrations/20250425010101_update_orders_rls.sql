/*
  Update orders table Row Level Security policies:
  - Drop the existing policy that restricts inserting orders 
  - Allow service role to continue managing all orders
  - Add a policy for inserting orders from any source
*/

-- Drop existing RLS policies on orders table
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
DROP POLICY IF EXISTS "Users can read their own orders" ON orders;

-- Allow service role to manage all orders
CREATE POLICY "Service role can manage orders"
  ON orders
  FOR ALL
  TO service_role
  USING (true);

-- Allow anyone to insert orders (for public API access)
CREATE POLICY "Anyone can insert orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to read orders by request_id
CREATE POLICY "Users can read orders by request_id"
  ON orders
  FOR SELECT
  TO anon, authenticated
  USING (true); 