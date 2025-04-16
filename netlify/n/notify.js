// netlify/functions/notify.js
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const crypto = require('crypto');

// Initialisation Supabase
const supabase = createClient(
  'https://kmkhcsentzqbetozxgwu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtta2hjc2VudHpxYmV0b3p4Z3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NzcxMzEsImV4cCI6MjA2MDM1MzEzMX0.Fm8MGN5ZA57rFqZRmxengrU5q2OfKR_vVw0JzmwL8N4' 
);

// Fonction de vérification HMAC
function verifyHMAC(body, xToken, secretKey) {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(body);
  const calculatedToken = hmac.digest('hex');
  return calculatedToken === xToken;
}

// Fonction de vérification via l'API de CinetPay
async function verifyWithCinetPay(transaction_id, api_key) {
  try {
    const response = await axios.post('https://api-checkout.cinetpay.com/v2/payment/check', {
      apikey: api_key,
      transaction_id: transaction_id,
    });

    return response.data.code === '00'; // "00" signifie succès
  } catch (error) {
    console.error('Erreur de vérification CinetPay :', error.response?.data || error.message);
    return false;
  }
}

// Fonction principale appelée par Netlify
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Méthode non autorisée" }),
    };
  }

  const rawBody = event.body;
  const body = JSON.parse(rawBody);
  const xToken = event.headers['x-token'];
  const secretKey = '172361040967fcb841792be7.37339670'; // Clé secrète pour HMAC
  const apiKey = '172361040967fcb841792be7.37339670';     // Clé API pour vérification

  // Vérifier le HMAC
  if (!verifyHMAC(rawBody, xToken, secretKey)) {
    console.error("❌ HMAC invalide !");
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "HMAC non valide" }),
    };
  }

  const status = body?.cpm_result;
  const nom = body?.cpm_custom;
  const montant = body?.cpm_amount || 100;
  const transaction_id = body?.cpm_trans_id;

  console.log("🔔 Notification reçue :", { nom, montant, status, transaction_id });

  // Vérification auprès de l'API CinetPay
  const isVerified = await verifyWithCinetPay(transaction_id, apiKey);
  if (!isVerified) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Échec de la vérification auprès de CinetPay" }),
    };
  }

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

    console.log("✅ Paiement enregistré dans Supabase !");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Notification traitée avec succès" }),
  };
}