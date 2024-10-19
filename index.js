const express = require('express');
const routes = require('./routes');
const mongoose = require('mongoose');
// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/astDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/',(req,res)=>{
    res.send("hello");
})
// API routes
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
