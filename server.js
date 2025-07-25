const express = require('express');
const path = require('path');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // ta clé secrète Stripe est lue dans les variables Render

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Affichage HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 🔒 Création du PaymentIntent avec capture différée
app.post('/create-payment-intent', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10000, // 100 euros
      currency: 'eur',
      capture_method: 'manual' // ✅ Empreinte CB sans encaissement immédiat
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
