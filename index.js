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
const reviews = client.db("Reviews").collection("foodReviews");
const newServices = client.db("UserAddedServices").collection("addedServices");

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    // JWT

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });
      res.send({ token });
    });
    // Services are here
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = services.find(query);
      const totalServices = await cursor.limit(3).toArray();
      res.send(totalServices);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await services.findOne(query);
      res.send(service);
    });
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await services.insertOne(service);
      res.send(result);
    });
    // All reviews are here
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviews.find(query);
      const totalServices = await cursor.toArray();
      res.send(totalServices);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviews.insertOne(review);
      res.send(result);
    });
    // My added reviews start here
    app.get("/myreviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviews.find(query);
      const myreviews = await cursor.toArray();
      res.send(myreviews);
    });

    app.get("/myreviews/edit/:id", async (req, res) => {
      const { id } = req.params;
      const chosenReview = await reviews.findOne({ _id: ObjectId(id) });
      res.send(chosenReview);
    });

    app.patch("/myreviews/edit/:id", async (req, res) => {
      const { id } = req.params;
      const result = await reviews.updateOne(
        { _id: ObjectId(id) },
        { $set: req.body }
      );
    });
    app.delete("/myreviews/:id", async (req, res) => {
      const { id } = req.params;
      const result = await reviews.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });
    // User added newService to the homepage
    app.get("/newservices", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = newServices.find(query);
      const myNewAddedService = await cursor.toArray();
      res.send(myNewAddedService);
    });
    app.post("/newservices", async (req, res) => {
      const newService = req.body;
      const result = await newServices.insertOne(newService);

      res.send(result);
    });
    // This section ends here

    // Get all Service Data
    app.get("/allservices", async (req, res) => {
      const query = {};
      const cursor = services.find(query);
      const totalServices = await cursor.toArray();
      res.send(totalServices);
    });
  } finally {
  }
}
run();
app.listen(port, () => {
  console.log(`port is running on ${port}`);
});
