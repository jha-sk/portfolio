import { Resend } from 'resend';
import { links } from '@/data/links';
import { identity } from '@/data/identity';

/**
 * POST /api/contact — delivers the contact form via Resend.
 *
 * Env vars:
 *   RESEND_API_KEY  (required) — your Resend API key (secret, server-only).
 *   RESEND_FROM     (optional) — verified sender, e.g. "Sourabh Jha <noreply@yourdomain.com>".
 *                                Defaults to Resend's shared onboarding sender (test mode).
 *   CONTACT_TO      (optional) — destination address. Defaults to links.email.
 *
 * In test mode (onboarding@resend.dev) Resend only delivers to the email tied
 * to your Resend account — verify a domain + set RESEND_FROM for production.
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'Email service not configured.' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();

  if (!name || !message || !emailRegex.test(email)) {
    return Response.json({ error: 'Please fill in all fields with a valid email.' }, { status: 422 });
  }

  const from = process.env.RESEND_FROM || `${identity.name} Portfolio <onboarding@resend.dev>`;
  // Delivery inbox — the public contact email (also the Resend account email,
  // so test-mode delivery works). Override with CONTACT_TO if needed.
  const to = process.env.CONTACT_TO || links.email;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New portfolio message — ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#0a141a">
          <h2 style="margin:0 0 8px">New message — ${escapeHtml(identity.name)} portfolio</h2>
          <p style="margin:0 0 4px"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:12px 0" />
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (error) {
      return Response.json({ error: error.message || 'Send failed.' }, { status: 502 });
    }

    // Auto-reply to the sender — only once a real sender is configured
    // (RESEND_FROM, i.e. a verified domain). Skipped in test mode since Resend
    // can't deliver to arbitrary recipients there. Best-effort: never blocks
    // the main submission.
    if (process.env.RESEND_FROM) {
      try {
        await resend.emails.send({
          from,
          to: email,
          replyTo: to,
          subject: `Thanks for reaching out — ${identity.name}`,
          text:
            `Hi ${name},\n\n` +
            `Thanks for reaching out through my portfolio — your message landed safely and I'll get back to you shortly.\n\n` +
            `In the meantime, feel free to browse my work or connect:\n` +
            `GitHub: ${links.github}\nLinkedIn: ${links.linkedin}\n\n` +
            `— ${identity.name}\n${identity.title}`,
          html: autoReplyHtml(name),
        });
      } catch (_) { /* best-effort; ignore */ }
    }

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: 'Unexpected error sending email.' }, { status: 500 });
  }
}

function autoReplyHtml(name) {
  return `
  <div style="margin:0;padding:0;background:#020202">
    <div style="max-width:520px;margin:0 auto;padding:36px 28px;font-family:'Helvetica Neue',Arial,sans-serif;color:#cfe1ea">
      <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#7fb3c8">
        ${escapeHtml(identity.name)} // message received
      </div>
      <h1 style="margin:14px 0 18px;font-size:22px;font-weight:700;color:#eaf6fb;letter-spacing:.5px">
        Thanks, ${escapeHtml(name)} — message received.
      </h1>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#b6cdd9">
        Your message landed safely. I read every note personally and I'll get back to you shortly.
      </p>
      <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#b6cdd9">
        In the meantime, feel free to explore my work:
      </p>
      <div>
        <a href="${links.github}" style="display:inline-block;margin:0 8px 8px 0;padding:9px 16px;border:1px solid rgba(178,213,229,.3);border-radius:8px;color:#eaf6fb;text-decoration:none;font-size:13px">GitHub →</a>
        <a href="${links.linkedin}" style="display:inline-block;margin:0 8px 8px 0;padding:9px 16px;border:1px solid rgba(178,213,229,.3);border-radius:8px;color:#eaf6fb;text-decoration:none;font-size:13px">LinkedIn →</a>
      </div>
      <hr style="border:none;border-top:1px solid rgba(178,213,229,.15);margin:26px 0 18px" />
      <div style="font-size:14px;line-height:1.5;color:#9fb8c5">
        <strong style="color:#eaf6fb">${escapeHtml(identity.name)}</strong><br/>
        ${escapeHtml(identity.title)}
      </div>
      <div style="margin-top:18px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#5b7b8a">
        — this is an automated acknowledgement —
      </div>
    </div>
  </div>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
