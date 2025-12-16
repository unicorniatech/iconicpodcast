import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const EBOOK_URL = Deno.env.get('EBOOK_URL') || 'https://your-domain.com/ebook.pdf'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'ICONIC Podcast <info@iconicpodcast.eu>'

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
