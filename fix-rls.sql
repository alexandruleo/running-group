-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view runners" ON runners;
DROP POLICY IF EXISTS "Users can update own profile" ON runners;
DROP POLICY IF EXISTS "Users can insert own profile" ON runners;

-- Create simpler policies that work with service role
CREATE POLICY "Enable read access for all authenticated users"
ON runners FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for all authenticated users"
ON runners FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for users based on email"
ON runners FOR UPDATE
TO authenticated
USING (auth.uid()::text = clerk_user_id)
WITH CHECK (auth.uid()::text = clerk_user_id);
