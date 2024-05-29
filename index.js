const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;


const corsOptions = {
  origin: "https://to-do-job-task.vercel.app",
   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
   credentials: true,
   optionsSuccessStatus: 204,
};

// app
app.use(cors(corsOptions));
app.use(express.json());

//mongoDB connection

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@todo.bjvfl.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@todos.omr7xh3.mongodb.net/?retryWrites=true&w=majority&appName=todos`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//jwt function
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

// api function
async function run() {
  try {
    await client.connect();
    const tasksCollection = client.db("toDoTask").collection("task");
    const usersCollection = client.db("toDoTask").collection("users");

    //add task
    app.post("/task", verifyJWT, async (req, res) => {
      const newTask = req.body;
      const result = await tasksCollection.insertOne(newTask);
      res.send(result);
    });

    // get task for per user
    app.get("/singleTask", verifyJWT,  async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const tasks = await tasksCollection.find(query).toArray();
      return res.send(tasks);
    });
    //Get Task: Send data to client
    // app.get("/tasks", async (req, res) => {
    //   const query = {};
    //   const cursor = tasksCollection.find(query);
    //   const tasks = await cursor.toArray();
    //   res.send(tasks);
    // });
    //get single  task
    app.get("/task/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const task = await tasksCollection.findOne(query);
      res.send(task);
    });
    //update task: receive data from client
    app.put("/task/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          date: updatedTask.date,
        },
      };
      const result = await tasksCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    //delete tasks
    app.delete("/task/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });
    // store user to database for make admin
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "12h" }
      );
      res.send({ result, token });
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
