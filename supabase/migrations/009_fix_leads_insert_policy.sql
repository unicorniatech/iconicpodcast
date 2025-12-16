-- Fix RLS policy for leads table to allow anonymous inserts
-- The original policy may not have been applied correctly

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;

-- Recreate the policy to explicitly allow anon and authenticated roles
CREATE POLICY "Anyone can create leads" ON leads 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);
