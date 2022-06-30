const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// app
app.use(cors());
app.use(express.json());


//mongoDB connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@todo.bjvfl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//jwt function
// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: "UnAuthorized access" });
//   }
//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//     if (err) {
//       return res.status(403).send({ message: "Forbidden access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// }

// api function
async function run() {
  try {
    await client.connect();
    const tasksCollection = client.db("toDoTask").collection("task");
   

    //add task
    app.post("/task", async (req, res) => {
      const newTask = req.body;
      const result = await tasksCollection.insertOne(newTask);
      console.log(newTask);
      res.send(result);
    });
    //Get Task: Send data to client
    app.get("/tasks", async (req, res) => {
      const query = {};
      const cursor = tasksCollection.find(query);
      const product = await cursor.toArray();
      res.send(product);
    });

   
    //delete tasks
    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });


   
    
  } finally {
    //here error or something
  }
}
run().catch(console.dir);

// <!-----root app--------->
app.get("/", (req, res) => {
  res.send("To-Do Task");
});

// listing port
app.listen(port, () => {
  console.log(`To-Do task ${port}`);
});
