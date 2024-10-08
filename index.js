const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://products-hub-7b147.web.app",
      "https://products-hub-7b147.firebaseapp.com",
    ],
  })
);
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
    app.get("/products", async (req, res) => {
      const categories = req?.query?.categories;
      const brand = req?.query?.brand;
      const dateRange = req?.query?.dateRange;
      const sort = req?.query?.sort;
      const searchTerm = req?.query?.searchTerm || "";
      const page = parseInt(req?.query?.page) || 1;
      const size = parseInt(req?.query?.size) || 10;
      console.log(sort);
      const filters = {};
      if (categories) {
        filters.category = { $in: categories.split(",") };
      }
      if (brand) {
        filters.brand = { $in: brand.split(",") };
      }
      if (dateRange) {
        const date = dateRange?.split(",");
        filters.productCreationDate = {
          $gte: new Date(date[0]),
          $lte: new Date(date[1]),
        };
      }

      if (searchTerm) {
        filters.productName = { $regex: searchTerm, $options: "i" };
      }

      const sortOptions = {};
      if (sort === "ascendingPrice") {
        sortOptions.price = 1;
      } else if (sort === "descendingPrice") {
        sortOptions.price = -1;
      } else if (sort === "ascendingDate") {
        sortOptions.productCreationDate = 1;
      } else if (sort === "descendingDate") {
        sortOptions.productCreationDate = -1;
      }

      const result = await productsCollection
        .find(filters)
        .sort(sortOptions)
        .skip((page - 1) * size)
        .limit(size)
        .toArray();

      res.send(result);
    });

    app.get("/productsCount", async (req, res) => {
      const result = await productsCollection.estimatedDocumentCount();
      res.send({ productsCount: result });
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
  }
}
run().catch(console.dir);

app.listen(port);
