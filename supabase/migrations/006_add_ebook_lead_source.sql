-- Add 'ebook' as a valid lead source
-- This migration updates the leads.source CHECK constraint to include 'ebook'.

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Find the existing CHECK constraint for leads.source (name may differ per environment)
  SELECT c.conname
    INTO constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public'
    AND t.relname = 'leads'
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%CHECK%source%IN%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.leads DROP CONSTRAINT %I', constraint_name);
  END IF;

  ALTER TABLE public.leads
    ADD CONSTRAINT leads_source_check
    CHECK (source IN (
      'chatbot', 'contact_form', 'manual', 'newsletter', 'ebook', 'guest_popup',
      'youtube_description', 'instagram_bio', 'paid_social',
      'landing_youtube', 'landing_instagram', 'landing_social'
    ));
EXCEPTION
  WHEN undefined_table THEN
    -- If the table doesn't exist yet, skip.
    NULL;
END $$;
