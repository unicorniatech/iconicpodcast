-- Migration: Add webhook trigger for ebook confirmation emails
-- This creates a database webhook that calls the send-ebook-email Edge Function
-- when a new lead with source='ebook' is inserted.

-- NOTE: Database webhooks are configured in Supabase Dashboard, not via SQL.
-- This file documents the required setup.

/*
SETUP INSTRUCTIONS:

1. Deploy the Edge Function:
   cd supabase
   supabase functions deploy send-ebook-email

2. Set the Edge Function secrets:
   supabase secrets set RESEND_API_KEY=re_your_api_key
   supabase secrets set EBOOK_URL=https://your-project.supabase.co/storage/v1/object/public/assets/ebook/iconic-ebook.pdf
   supabase secrets set FROM_EMAIL="ICONIC Podcast <noreply@iconicpodcast.cz>"

3. Create Database Webhook in Supabase Dashboard:
   - Go to Database > Webhooks
   - Click "Create a new webhook"
   - Name: send-ebook-email
   - Table: leads
   - Events: INSERT
   - Type: Supabase Edge Functions
   - Edge Function: send-ebook-email
   - HTTP Headers: (leave default)

4. Test by submitting the ebook popup form on your site.

ALTERNATIVE: If you prefer pg_net extension (requires enabling in Dashboard):
*/

-- Uncomment below if using pg_net extension instead of Dashboard webhooks:
/*
CREATE OR REPLACE FUNCTION notify_ebook_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.source = 'ebook' THEN
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_functions_url') || '/send-ebook-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'leads',
        'record', row_to_json(NEW),
        'schema', 'public'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ebook_lead_insert
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_ebook_signup();
*/
