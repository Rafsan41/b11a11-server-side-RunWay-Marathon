const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
// const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
// __________________________________________
// middleware
app.use(cors());
app.use(express.json());
// app.use(cookieParser());

// runway - marathon;
// TZCOlvrS6CCXCO2q;

const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@clusteralpha.2srbfo8.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAlpha`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const eventDatabase = client.db("runway-marathon");
    const eventCollection = eventDatabase.collection("marathon-event");
    const today = new Date();
    // featured event api
    app.get("/featuredEvent", async (req, res) => {
      const cursor = eventCollection.find({ isFeatured: true });
      const result = await cursor.limit(6).toArray();
      res.send(result);
    });
    // upcomming event api
    app.get("/upCommingEvent", async (req, res) => {
      const cursor = eventCollection.find({
        registrationStart: { $gte: today.toISOString().split("T")[0] }, // future registration dates
      });
      const result = await cursor
        .sort({ registrationStart: 1 })
        .limit(3)
        .toArray();
      res.send(result);
    });
    // already registation start event api
    app.get("/openEvent", async (req, res) => {
      const cursor = eventCollection.find({
        registrationStart: { $lte: today.toISOString().split("T")[0] },
        registrationDeadline: { $gte: today.toISOString().split("T")[0] },
      });
      const result = await cursor.sort({ registrationStart: 1 }).toArray();
      res.send(result);
    });

    // all marathon event
    app.get("/allEvent", async (req, res) => {
      const cursor = eventCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("RunWay Marathon Portal Running");
});

app.listen(port, () => {
  console.log(`RunWay Marathon Portal listening on port ${port}`);
});
