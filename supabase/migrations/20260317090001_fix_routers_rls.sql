/*
  # Fix routers table RLS policies
  Allow anon access so the frontend (using anon key) can read/write routers.
*/

DROP POLICY IF EXISTS "Everyone can read routers" ON routers;
DROP POLICY IF EXISTS "Everyone can create routers" ON routers;
DROP POLICY IF EXISTS "Everyone can update routers" ON routers;
DROP POLICY IF EXISTS "Everyone can delete routers" ON routers;

CREATE POLICY "Allow anon read routers"
  ON routers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert routers"
  ON routers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update routers"
  ON routers FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete routers"
  ON routers FOR DELETE
  TO anon
  USING (true);
