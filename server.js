const express = require("express");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

app.use(cors());
app.use(bodyParser.json());

// Sert le fichier index.html
app.use(express.static(path.join(__dirname, ".")));

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      capture_method: "manual",
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
