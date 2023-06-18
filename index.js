const express = require("express");
const connectToMongo = require("./db");
var cors = require('cors')

// Connect to MongoDB
connectToMongo();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

// available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
