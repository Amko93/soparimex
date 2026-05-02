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
      // Cas : Formulaire de contact
      const { nom, prenom, email, entreprise, telephone, message, sujet } = data;
      const fullName = `${prenom || ""} ${nom || ""}`.trim() || "Visiteur";
      const subjectText = sujet || "Message depuis le site";
      const clientEmail = email || "";

      // Validation des champs requis
      if (!clientEmail || !message) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: email and message are required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }

      // FROM : Adresse vérifiée (obligatoire pour Resend)
      // TO : Adresse de destination fixe
      // REPLY-TO : Email du client pour pouvoir répondre directement
      to = ADMIN_EMAIL;
      subject = `Contact Site: ${subjectText}`;
      
      // HTML simplifié
      html = `
        <h1>Nouveau message du site</h1>
        <p><strong>Nom :</strong> ${fullName}</p>
        <p><strong>Email :</strong> ${clientEmail}</p>
        ${entreprise ? `<p><strong>Entreprise :</strong> ${entreprise}</p>` : ""}
        ${telephone ? `<p><strong>Téléphone :</strong> ${telephone}</p>` : ""}
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `;
    } else {
      // Cas par défaut : envoi générique (compatible avec l'ancienne fonction resend)
      to = data.to;
      subject = data.subject;
      html = data.html;
    }

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // Préparation du payload Resend
    const resendPayload: any = {
      // FROM : utiliser le domaine vérifié @soparimex.com
      from: type === "contact"
        ? "Soparimex Contact <contact@soparimex.com>"
        : "Soparimex <contact@soparimex.com>",
      to: to,
      subject: subject,
      html: html,
    };

    // Ajout du reply-to pour le type contact (permet de répondre directement au client)
    if (type === "contact" && data.email) {
      resendPayload.reply_to = data.email;
    }

    console.log("RESEND_API_KEY défini :", !!RESEND_API_KEY);
    console.log("Envoi email vers :", to);
    console.log("Payload Resend :", JSON.stringify(resendPayload));

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
    console.log("Réponse Resend body :", JSON.stringify(result));

    // Vérification de la réponse Resend
    if (!res.ok || result.error) {
      return new Response(
        JSON.stringify({
          error: result.error?.message || result.message || "Failed to send email",
          details: result
        }),
        {
          status: res.status >= 400 && res.status < 500 ? res.status : 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }
};

serve(handler);
