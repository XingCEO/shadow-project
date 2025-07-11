const { createRequestHandler } = require("@remix-run/express");
const express = require("express");
const path = require("path");

const app = express();

// Serve static files
app.use(express.static("public"));

// Handle Remix requests
app.all("*", createRequestHandler({
  build: require("./build"),
  mode: process.env.NODE_ENV
}));

module.exports = app;