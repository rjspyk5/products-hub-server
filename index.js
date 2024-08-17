const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(express.json());
app.use(cors());
const uri = process.env.URI;
app.get("/", async (req, res) => {
  res.send("test");
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const productsCollection = client
      .db("productsHub")
      .collection("productsCollection");

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });
    app.get("/catagoriesandbrand", async (req, res) => {
      const pipeline = [
        {
          $group: {
            _id: null,
            categories: { $addToSet: "$category" },
            brands: { $addToSet: "$brand" },
          },
        },
        {
          $project: {
            _id: 0,
            categories: 1,
            brands: 1,
          },
        },
      ];
      const result = await productsCollection.aggregate(pipeline).toArray();
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port);
