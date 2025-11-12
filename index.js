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
    const travelCollection = database.collection("travelsDetails");
    const userCollection = database.collection("usersDetails");
    const bookingsCollection = database.collection("bookingsDetails");

    // add user data
    app.post("/users", async (req, res) => {
      const newUser = req.body;

      const email = req.body.email;
      const query = { email: email };
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        res.send({ message: "user already exist" });
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      }
    });

    // add all travel data
    app.post("/travels", async (req, res) => {
      const newTravelTicket = req.body;
      const result = await travelCollection.insertOne(newTravelTicket);
      res.send(result);
    });

    //get all travel data
    app.get("/travels", async (req, res) => {
      console.log("Request received for all travel tickets.");
      try {
        console.log(req.query);
        const email = req.query.email;
        const query = {};
        if (email) {
          query.userEmail = email;
        }

        const cursor = travelCollection.find(query);
        const travels = await cursor.toArray();
        res.send(travels);
      } catch (error) {
        console.error("Failed to fetch travel data from MongoDB:", error);
        res.status(500).send({
          message: "errot to server get to data",
          error: error.message,
        });
      }
    });

    //get last 6 travel data
    app.get("/letestTravels", async (req, res) => {
      console.log("Request received for latest 6 travel tickets.");
      try {
        const cursor = travelCollection.find({}).sort({ _id: -1 }).limit(6);
        const travels = await cursor.toArray();
        res.send(travels);
      } catch (error) {
        console.error("Failed to fetch travel data from MongoDB:", error);
        res.status(500).send({
          message: "errot to server get to data",
          error: error.message,
        });
      }
    });

    //get single travel data again again
    app.get("/travels/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await travelCollection.findOne(query);
      res.send(result);
    });

    //updte travel data
    app.patch("/travels/:id", async (req, res) => {
      const id = req.params.id;
      const updateTravelData = req.body;
      const query = { _id: new ObjectId(id) };
      const upadate = {
        $set: {
          owner: updateTravelData.owner,
          pricePerDay: updateTravelData.pricePerDay,
        },
      };

      const result = await travelCollection.updateOne(query, upadate);
      res.send(result);
    });

    //delete travel data
    app.delete("/travels/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await travelCollection.deleteOne(query);
      res.send(result);
    });

    //add new travel data
    app.post("/addedVehicle", async (req, res) => {
      const addNewVehicle = req.body;
      console.log("Received new vehicle data:", addNewVehicle);

      const result = await travelCollection.insertOne(addNewVehicle);

      res.send(result);
    });

    //add booking data
    app.post("/bookings", async (req, res) => {
      const bookingData = req.body;

      const query = {
        vehicleId: bookingData.vehicleId,
        renterEmail: bookingData.renterEmail,
      };

      const existingBooking = await bookingsCollection.findOne(query);

      if (existingBooking) {
        console.log("Duplicate booking attempt detected.");
        return res.send({
          success: false,
          message:
            "You have already placed a booking request for this vehicle.",
        });
      }

      const result = await bookingsCollection.insertOne(bookingData);

      res.send({
        success: true,
        insertedId: result.insertedId,
        message: "Booking request submitted successfully!",
      });
    });

    //get booking data mane data usser unujayi data
    app.get("/my-vehicles", async (req, res) => {
      const userEmail = req.query.email;

      if (!userEmail) {
        return res
          .status(401)
          .send({ message: "Email parameter is required." });
      }

      try {
        const query = { userEmail: userEmail };
        const vehicles = await travelCollection.find(query).toArray();
        res.send(vehicles);
      } catch (error) {
        console.error("Error fetching user vehicles:", error);
        res.status(500).send({ message: "Internal server error." });
      }
    });

    //delete vehicle booking
    app.delete("/vehicle/:id", async (req, res) => {
      const id = req.params.id;
      if (!id) {
        return res.status(401).send({ message: "Vehicle ID is required." });
      }
      try {
        const query = { _id: new ObjectId(id) };
        const result = await travelCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        res.status(500).send({ message: "Internal server error." });
      }
    });

    //update data put dite
    app.put("/vehicle/:id", async (req, res) => {
      const id = req.params.id;
      const updatedVehicleData = req.body;

      delete updatedVehicleData._id;

      try {
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            ...updatedVehicleData,
          },
        };

        const result = await travelCollection.updateOne(filter, updateDoc);

        res.send(result);
      } catch (error) {
        console.error("Error updating vehicle:", error);
        res.status(505).send({ message: "Internal server error." });
      }
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
