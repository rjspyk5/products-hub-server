const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(express.json());
app.use(cors());
app.get("/", async (req, res) => {
  res.send("test");
});
app.listen(port);
