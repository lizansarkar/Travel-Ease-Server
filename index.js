const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// there are will be middlewere here
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://TravelEase:WuGVU8A34EgcAK8y@lizan0.tl45evy.mongodb.net/?appName=lizan0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Travel Ease Server Is Running");
});

async function connectToDatabase() {
  try {
    await client.connect();

    const database = client.db("TravelEase");
    const travelCollection = database.collection("travel");

    app.post("/travels", async (req, res) => {
      const newTravelTicket = req.body;
      const result = await travelCollection.insertOne(newTravelTicket);
      res.send(result);
    });

    app.get('/travels', async (req, res) => {
      console.log("Request received for all travel tickets.");
      try {
        const cursor = travelCollection.find({});
        const travels = await cursor.toArray();
        res.send(travels);
      } catch (error) {
        console.error("Failed to fetch travel data from MongoDB:", error);
        res
          .status(500)
          .send({
            message: "errot to server get to data",
            error: error.message,
          });
      }
    });

    //get single travel data again again
    app.get('/travels/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: id }
        const result = await travelCollection.findOne(query);
        res.send(result)
    })

    app.patch('/travels/:id', async (req, res) => {
        const id = req.params.id;
        const updateTravelData = req.body;
        const query = {_id: id}
        const upadate  = {
            $set: {
                owner: updateTravelData.owner,
                pricePerDay: updateTravelData.pricePerDay
            }
        }

        const result = await travelCollection.updateOne(query, upadate)
        res.send(result)
    })

    app.delete("/travels/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await travelCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}

connectToDatabase().catch(console.dir);

app.listen(port, () => {
  console.log(`travel ease server is running on port ${port}`);
});

//password: WuGVU8A34EgcAK8y
