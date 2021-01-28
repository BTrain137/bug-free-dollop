"use strict";

require("dotenv").config("./.env");
const path = require("path");
const express = require("express");
const logger = require("morgan");
const webhookRoutes = require("./webhook");
const apiRoutes = require("./api");
const shopifyAuth = require("./shopifyAuthenticate.js");

const app = express();
const { NODE_ENV, PORT } = process.env;
const port = PORT || 3001;

app.use(logger("dev"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Middleware
app.use(
  "/webhooks",
  express.json({
    verify: function (req, _, buf) {
      req.rawbody = buf;
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Used to install the app or update permissions.
app.use(shopifyAuth);

// Routes
app.use("/webhooks", webhookRoutes);
app.use("/api", apiRoutes);

if (NODE_ENV !== "development") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", function (_, res) {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

module.exports = app;
