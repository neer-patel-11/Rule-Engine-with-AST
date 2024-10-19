const express = require('express');
const routes = require('./routes');
const mongoose = require('mongoose');
const path = require('path');
// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/astDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', routes);
// Serve the index.html page as the main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
