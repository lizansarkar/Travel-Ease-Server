const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// there are will be middlewere here
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://TravelEase:WuGVU8A34EgcAK8y@lizan0.tl45evy.mongodb.net/?appName=lizan0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
    res.send('Travel Ease Server Is Running')
})

async function connectToDatabase () {
    try {
        await client.connect();

        const database = client.db('TravelEase')
        const travelCollection = database.collection('travel');

        app.post('/travels', async (req, res) => {
            const newTravelTicket = req.body;
            const result = await travelCollection.insertOne(newTravelTicket);
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {

    }
}

connectToDatabase().catch(console.dir)

app.listen(port, () => {
    console.log(`travel ease server is running on port ${port}`)
})



//password: WuGVU8A34EgcAK8y