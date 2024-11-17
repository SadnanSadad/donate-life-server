const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://donate-life-92bb0.web.app",
      "https://donate-life-92bb0.firebaseapp.com"
    ]
  })
);
app.use(express.json());

//
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.yuyym.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const userCollection = client.db('donateLife').collection('users');
    const bloodRequestCollection = client.db('donateLife').collection('bloodRequest');
    const donorCollection = client.db('donateLife').collection('donorList');
    const userMessageCollection = client.db('donateLife').collection('userMessage');

    // get users by ownership

    // get admin
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await userCollection.findOne(query)
      let admin = false;
      if (user) {
        admin = user?.role === 'admin'
      }
      res.send({ admin })
    })

    // get donor verify
    app.get('/users/user/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const userList = await userCollection.findOne(query)
      let donor = false;
      if (userList) {
        donor = userList?.role === 'user'
      }
      res.send({ donor })
    })



    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        return res.status(200).json({ message: 'User already exists', exists: true });
      }
      const result = await userCollection.insertOne(user);
      res.status(201).json(result);
    })

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result)
    })




    // Blood Requests 

    app.get('/blood-req', async (req, res) => {
      const result = await bloodRequestCollection.find().toArray();
      res.send(result);
    })

    app.get('/blood-req/:type', async (req, res) => {
      const type = req.params.type;
      const query = { bloodType: type }
      const result = await bloodRequestCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/blood-req/email/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await bloodRequestCollection.find(query).toArray();
      res.send(result);
    })

    app.post("/blood-req", async (req, res) => {
      const bloodReq = req.body;

      const result = await bloodRequestCollection.insertOne(bloodReq);
      res.send(result);
    })

    app.patch("/blood-req/fulfilled/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updatedStatus = {
        $set: {
          status: "Fulfilled",
        }
      }
      const result = await bloodRequestCollection.updateOne(filter, updatedStatus);
      res.send(result);
    })

    app.delete('/blood-req/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bloodRequestCollection.deleteOne(query);
      res.send(result)
    })


    // get donors info

    app.get('/donorList', async (req, res) => {
      const result = await donorCollection.find().toArray();
      res.send(result);
    })

    app.get('/donorList/:name', async (req, res) => {
      const donorName = req.params.name;
      const query = { name: donorName }
      const result = await donorCollection.findOne(query);
      res.send(result);
    })

    app.post('/donorList', async (req, res) => {
      const donorInfo = req.body;
      const result = await donorCollection.insertOne(donorInfo);
      res.send(result);
    })

    app.patch("/donorList/inactive/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updatedStatus = {
        $set: {
          status: "Inactive",
        }
      };

      try {
        const result = await donorCollection.updateOne(filter, updatedStatus);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to update status" });
      }
    });

    app.patch("/donorList/active/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updatedStatus = {
        $set: {
          status: "Active",
        }
      };

      try {
        const result = await donorCollection.updateOne(filter, updatedStatus);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to update status" });
      }
    });


    app.delete('/donorList/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await donorCollection.deleteOne(query);
      res.send(result)
    })


    // User messages

    app.get('/user-message/:name', async (req, res) => {
      const messagesReceiver = req.params.name;
      const query = {recieverName : messagesReceiver}
      const result = await userMessageCollection.find(query).toArray();
      res.send(result);
    })

    app.post("/user-message", async (req, res) => {
      const message = req.body;

      const result = await userMessageCollection.insertOne(message);
      res.send(result);
    })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("Donate Life server is running");
})
app.listen(port, () => {
  console.log(`Server running in port: ${port}`);
})