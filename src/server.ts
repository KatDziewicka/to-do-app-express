import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import filePath from "./filePath";
import { Client, ClientConfig} from "pg";
dotenv.config();

const connectToHeroku = process.env.NODE_ENV === 'production';


const config: ClientConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: connectToHeroku ? {
    rejectUnauthorized: false
  } : false
};

console.log({ config, connectToHeroku, nodeEnv: process.env.NODE_ENV });


const client = new Client(config);

client.connect();

const app = express();

// loading in some dummy items into the database
// (comment out if desired, or change the number)
// addDummyDbItems(20);


/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// read in contents of any environment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// GET /items
//these should be all the things on my to do list
app.get("/todos", async (req, res) => {
  try {
  const text = 'SELECT * FROM todos';
  const todoList = await client.query(text);
  // res.status(200).json(res)
  res.status(200).json({
    "status": "success",
    "tasks": todoList.rows
  });
  } catch (error) {
    console.log("error 401")
  }
});


// POST /items
//add a to-do
app.post("/todos", async (req, res) => {
  try {
    const { description } = req.body;
    const text = 'INSERT INTO todos (description) VALUES ($1)';
    const values = [description]
    await client.query(text, values);
    // res.status(200).json(res)
    res.status(200).json({
      "status": "success",
      "task-added": description
  });
  } catch (error) {
    console.log("error 401")
  }
});


// GET /items/:id
//view a particular id
app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const text = 'SELECT * FROM todos WHERE id=$1';
    const values = [id]
    const task = await client.query(text, values);
    // res.status(200).json(res)
    res.status(200).json({
      "status": "success",
      "task": task.rows
  });
  } catch (error) {
    console.log("error 401")
  }
});

// DELETE /items/:id
//delete a task
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const text = 'DELETE FROM todos WHERE id=$1';
    const values = [id]
    const deletedTask = await client.query(text, values);
    // res.status(200).json(res)
    res.status(200).json({
      "status": "success",
      "message": "The task was deleted!"
  });
  } catch (error) {
    console.log("error 401")
  }
});



// // PATCH /items/:id
// app.patch<{ id: string }, {}, Partial<DbItem>>("/items/:id", (req, res) => {
//   const matchingSignature = updateDbItemById(parseInt(req.params.id), req.body);
//   if (matchingSignature === "not found") {
//     res.status(404).json(matchingSignature);
//   } else {
//     res.status(200).json(matchingSignature);
//   }
// });

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
