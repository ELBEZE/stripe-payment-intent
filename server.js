// ✅ Chargement dynamique des variables d'environnement
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser'); // ✅ Ajouté
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // ✅ Clé Stripe lue via .env

const app = express();

// ✅ Clé Stripe tirée de .env ou .env.production selon le mode

app.use(cors());
app.use(bodyParser.json()); // ✅ Ajouté
app.use(express.static(__dirname));

// 👉 Affichage du formulaire HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 🔒 Création du PaymentIntent avec capture différée
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { nom } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 50000, // 500 euros
      currency: 'eur',
      capture_method: 'manual'
       metadata: { nom: nom || 'non précisé' } // 🆕 ajout du nom dans metadata
    });


    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ✅ Capture d'une empreinte CB
app.post('/capture-payment', async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    res.send({ status: 'captured', paymentIntent });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ❌ Annulation d'une empreinte CB
app.post('/cancel-payment', async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const canceledIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    res.send({ status: 'cancelled', canceledIntent });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// 🚀 Démarrage serveur
const PORT = process.env.PORT || 3000;
app.post('/create-payment-intent', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // Montant en centimes (1,00€)
      currency: 'eur',
      capture_method: 'manual', // pour empreinte CB (capture différée)
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
