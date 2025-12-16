import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SEND_EMAIL_HOOK_SECRET = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'ICONIC Podcast <info@iconicpodcast.eu>'
const SITE_URL = Deno.env.get('SITE_URL') || 'https://iconicpodcast.eu'

interface AuthEmailPayload {
  user: {
    email: string
    user_metadata?: {
      name?: string
    }
  }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change'
    site_url: string
  }
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    let emailData: AuthEmailPayload
    
    // Verify webhook signature if secret is configured
    if (SEND_EMAIL_HOOK_SECRET) {
      const wh = new Webhook(SEND_EMAIL_HOOK_SECRET)
      emailData = wh.verify(payload, headers) as AuthEmailPayload
    } else {
      emailData = JSON.parse(payload)
    }

    const { user, email_data } = emailData
    const { token_hash, redirect_to, email_action_type } = email_data
    const userEmail = user.email
    const userName = user.user_metadata?.name || userEmail.split('@')[0]

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: { message: 'Email service not configured' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build verification URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://xvkrephweqcomlilbrgm.supabase.co'
    const verificationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || SITE_URL}`

    // Determine email content based on action type
    let subject: string
    let heading: string
    let message: string
    let buttonText: string

    switch (email_action_type) {
      case 'signup':
        subject = '✨ Potvrď svůj email | ICONIC Podcast'
        heading = `Ahoj ${userName}! 💖`
        message = 'Děkujeme za registraci! Klikni na tlačítko níže pro potvrzení tvého emailu a aktivaci účtu.'
        buttonText = 'POTVRDIT EMAIL'
        break
      case 'recovery':
        subject = '🔐 Obnova hesla | ICONIC Podcast'
        heading = `Ahoj ${userName}!`
        message = 'Obdrželi jsme žádost o obnovu hesla. Klikni na tlačítko níže pro nastavení nového hesla.'
        buttonText = 'OBNOVIT HESLO'
        break
      case 'invite':
        subject = '🎉 Pozvánka | ICONIC Podcast'
        heading = `Ahoj ${userName}!`
        message = 'Byl/a jsi pozván/a k připojení k ICONIC Podcast. Klikni na tlačítko níže pro přijetí pozvánky.'
        buttonText = 'PŘIJMOUT POZVÁNKU'
        break
      case 'magiclink':
        subject = '🔗 Přihlášení | ICONIC Podcast'
        heading = `Ahoj ${userName}!`
        message = 'Klikni na tlačítko níže pro přihlášení do svého účtu.'
        buttonText = 'PŘIHLÁSIT SE'
        break
      case 'email_change':
        subject = '📧 Změna emailu | ICONIC Podcast'
        heading = `Ahoj ${userName}!`
        message = 'Klikni na tlačítko níže pro potvrzení změny emailové adresy.'
        buttonText = 'POTVRDIT ZMĚNU'
        break
      default:
        subject = '📧 ICONIC Podcast'
        heading = `Ahoj ${userName}!`
        message = 'Klikni na tlačítko níže pro pokračování.'
        buttonText = 'POKRAČOVAT'
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [userEmail],
        subject: subject,
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
              <h2 style="color: #ec4899; font-size: 24px; margin: 0 0 20px;">${heading}</h2>
              
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                ${message}
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; background-color: #ec4899; color: #ffffff; font-weight: bold; font-size: 16px; padding: 16px 40px; border-radius: 50px; text-decoration: none;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
                Pokud tlačítko nefunguje, zkopíruj tento odkaz:<br>
                <a href="${verificationUrl}" style="color: #ec4899; word-break: break-all;">${verificationUrl}</a>
              </p>
              
              <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
                Pokud jsi tuto akci nežádal/a, můžeš tento email ignorovat.
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
        JSON.stringify({ error: { message: 'Failed to send email', details: data } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Auth email (${email_action_type}) sent successfully to:`, userEmail)
    
    return new Response(
      JSON.stringify({}),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: { message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
