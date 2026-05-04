import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "contact@soparimex.com";

const handler = async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body = await request.json();
    const { type, ...data } = body;

    let to: string;
    let subject: string;
    let html: string;

    if (type === "contact") {
      // ── Formulaire de contact ──
      const { nom, prenom, email, entreprise, telephone, message, sujet } = data;
      const fullName = `${prenom || ""} ${nom || ""}`.trim() || "Visiteur";
      const subjectText = sujet || "Message depuis le site";
      const clientEmail = email || "";

      if (!clientEmail || !message) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: email and message are required" }),
          { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }

      to = ADMIN_EMAIL;
      subject = `Contact Site: ${subjectText}`;
      html = `
        <h1>Nouveau message du site</h1>
        <p><strong>Nom :</strong> ${fullName}</p>
        <p><strong>Email :</strong> ${clientEmail}</p>
        ${entreprise ? `<p><strong>Entreprise :</strong> ${entreprise}</p>` : ""}
        ${telephone ? `<p><strong>Téléphone :</strong> ${telephone}</p>` : ""}
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `;

    } else if (type === "lead-message") {
      // ── Notification nouveau message dans une demande ──
      // On n'inclut PAS le contenu du message pour la confidentialité
      const { to: recipient, senderName, leadTitle } = data;

      if (!recipient) {
        return new Response(
          JSON.stringify({ error: "Missing required field: to" }),
          { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }

      to = recipient;
      subject = `Soparimex — Nouveau message sur "${leadTitle || "votre demande"}"`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
          <div style="background:#1e40af;border-radius:8px;padding:16px 24px;margin-bottom:24px;">
            <h1 style="color:#ffffff;margin:0;font-size:20px;">Soparimex</h1>
          </div>
          <div style="background:#ffffff;border-radius:8px;padding:24px;border:1px solid #e2e8f0;">
            <p style="font-size:16px;color:#1e293b;margin-top:0;">
              Bonjour,
            </p>
            <p style="font-size:15px;color:#334155;">
              <strong>${senderName || "Un membre de l'équipe"}</strong> vous a envoyé un nouveau message
              concernant la demande <strong>"${leadTitle || "votre demande"}"</strong>.
            </p>
            <p style="font-size:15px;color:#334155;">
              Connectez-vous sur votre espace Soparimex pour consulter et répondre au message.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="https://soparimex.com/mes-demandes"
                 style="background:#1e40af;color:#ffffff;padding:14px 32px;border-radius:8px;
                        text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
                Voir le message
              </a>
            </div>
            <p style="font-size:13px;color:#94a3b8;margin-bottom:0;">
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
            </p>
          </div>
        </div>
      `;

    } else {
      // ── Cas générique (compatibilité) ──
      to = data.to;
      subject = data.subject;
      html = data.html;
    }

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const resendPayload: any = {
      from: type === "contact"
        ? "Soparimex Contact <contact@soparimex.com>"
        : "Soparimex <contact@soparimex.com>",
      to,
      subject,
      html,
    };

    if (type === "contact" && data.email) {
      resendPayload.reply_to = data.email;
    }

    console.log("RESEND_API_KEY défini :", !!RESEND_API_KEY);
    console.log("Envoi email vers :", to);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(resendPayload),
    });

    const result = await res.json();
    console.log("Réponse Resend status :", res.status);

    if (!res.ok || result.error) {
      return new Response(
        JSON.stringify({ error: result.error?.message || result.message || "Failed to send email", details: result }),
        { status: res.status >= 400 && res.status < 500 ? res.status : 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
};

serve(handler);
