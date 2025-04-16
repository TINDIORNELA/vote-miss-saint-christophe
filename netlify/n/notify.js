// netlify/functions/notify.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kmkhcsentzqbetozxgwu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtta2hjc2VudHpxYmV0b3p4Z3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NzcxMzEsImV4cCI6MjA2MDM1MzEzMX0.Fm8MGN5ZA57rFqZRmxengrU5q2OfKR_vVw0JzmwL8N4' 
);

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Méthode non autorisée" }),
    };
  }

  const data = JSON.parse(event.body);
  const status = data?.cpm_result;
  const nom = data?.cpm_custom;
  const montant = data?.cpm_amount || 100;

  console.log("🔔 Notification de CinetPay :", { nom, montant, status });

  if (status === "ACCEPTED") {
    const { error } = await supabase
      .from("paiements")
      .insert([
        {
          nom_candidat: nom,
          montant: montant,
          statut: status,
        }
      ]);

    if (error) {
      console.error("❌ Erreur Supabase :", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Erreur lors de l'insertion" }),
      };
    }

    console.log("✅ Paiement enregistré !");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Notification traitée" }),
  };
};

  