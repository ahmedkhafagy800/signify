const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;
app.use(cors());
app.use(express.json());


app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});

// node .\server.js
