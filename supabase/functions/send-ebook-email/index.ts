import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const EBOOK_URL = Deno.env.get('EBOOK_URL') || 'https://your-domain.com/ebook.pdf'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'ICONIC Podcast <info@iconicpodcast.eu>'
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'info@iconicpodcast.eu'

interface LeadPayload {
  type: 'INSERT'
  table: 'leads'
  record: {
    id: string
    name: string
    email: string
    source: string
    interest: string
  }
  schema: 'public'
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: LeadPayload = await req.json()

    // Only send email for ebook signups
    if (payload.record.source !== 'ebook') {
      return new Response(
        JSON.stringify({ message: 'Not an ebook signup, skipping email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const { name, email } = payload.record
    const firstName = name.split(' ')[0] || 'there'

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: '🎁 Tvůj e-book je tady! | ICONIC Podcast',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0;">ICONIC Podcast</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <h2 style="color: #ec4899; font-size: 24px; margin: 0 0 20px;">Ahoj ${firstName}! 💖</h2>
              
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Děkujeme, že ses přihlásil/a k odběru! Tady je tvůj exkluzivní e-book od Zuzzi.
              </p>
              
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Objev 3 věty s mocí okamžitě změnit tvůj život i business.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${EBOOK_URL}" 
                       style="display: inline-block; background-color: #ec4899; color: #ffffff; font-weight: bold; font-size: 16px; padding: 16px 40px; border-radius: 50px; text-decoration: none;">
                      STÁHNOUT E-BOOK
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
                Pokud tlačítko nefunguje, zkopíruj tento odkaz:<br>
                <a href="${EBOOK_URL}" style="color: #ec4899;">${EBOOK_URL}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #111111; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ICONIC Podcast. Všechna práva vyhrazena.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend API error:', data)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Email sent successfully to:', email)

    // Send admin notification email
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: `🆕 Nový lead: ${name} | ICONIC Podcast`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 20px; background-color: #1a1a1a;">
        <h1 style="color: #ec4899; font-size: 20px; margin: 0;">🆕 Nový Lead z Ebook Popup</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Jméno:</td>
            <td style="border-bottom: 1px solid #eee;">${name}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
            <td style="border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #ec4899;">${email}</a></td>
          </tr>
          <tr>
            <td style="border-bottom: 1px solid #eee; font-weight: bold;">Zdroj:</td>
            <td style="border-bottom: 1px solid #eee;">${payload.record.source}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px solid #eee; font-weight: bold;">Zájem:</td>
            <td style="border-bottom: 1px solid #eee;">${payload.record.interest}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Čas:</td>
            <td>${new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' })}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border-radius: 8px; color: #166534;">
          ✅ Uživateli byl automaticky odeslán e-book.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      }),
    })

    if (!adminRes.ok) {
      console.error('Failed to send admin notification')
    } else {
      console.log('Admin notification sent to:', ADMIN_EMAIL)
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully', id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
