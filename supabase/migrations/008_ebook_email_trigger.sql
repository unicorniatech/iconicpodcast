-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to call the Edge Function when a new ebook lead is inserted
CREATE OR REPLACE FUNCTION public.notify_ebook_signup()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  function_url text := 'https://xvkrephweqcomlilbrgm.supabase.co/functions/v1/send-ebook-email';
  service_role_key text;
BEGIN
  -- Only trigger for ebook signups
  IF NEW.source = 'ebook' THEN
    payload := jsonb_build_object(
      'type', 'INSERT',
      'table', 'leads',
      'record', jsonb_build_object(
        'id', NEW.id,
        'name', NEW.name,
        'email', NEW.email,
        'source', NEW.source,
        'interest', NEW.interest
      ),
      'schema', 'public'
    );
    
    -- Use net.http_post to call the Edge Function
    PERFORM net.http_post(
      url := function_url,
      body := payload,
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_ebook_lead_insert ON public.leads;
CREATE TRIGGER on_ebook_lead_insert
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_ebook_signup();
