const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dafmrk2.mongodb.net/?retryWrites=true&w=majority`;

console.log(
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  process.env.JWT_SECRET,
  uri
);
const client = new MongoClient(uri);
const services = client.db("Services").collection("foods");

async function run() {
  try {
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = services.find(query);
      const totalServices = await cursor.toArray();
      res.send(totalServices);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await services.findOne(query);
      res.send(service);
    });
  } finally {
  }
}
run();
app.listen(port, () => {
  console.log(`port is running on ${port}`);
});
