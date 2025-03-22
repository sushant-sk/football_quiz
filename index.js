import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './cred.env' });

// Database client setup
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
const port = 3000;

// Initialize database connection and data
let ans = [];
let isDbConnected = false;

async function initializeDatabase() {
  try {
    await db.connect();
    console.log("Connected to database");
    
    const result = await db.query("SELECT * FROM players");
    ans = result.rows;
    
    if (ans.length === 0) {
      throw new Error("No players found in the database");
    }
    
    isDbConnected = true;
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1); // Exit if we can't connect to DB
  }
}

// Initialize the database before starting the server
await initializeDatabase();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};
let totalCorrect = 0;

function getRandomQuestion() {
  if (ans.length === 0) {
    return { 
      name: "Unknown Player", 
      nationality: "Unknown" 
    };
  }
  return ans[Math.floor(Math.random() * ans.length)];
}

// Routes
app.get("/", (req, res) => {
  totalCorrect = 0;
  currentQuestion = getRandomQuestion();
  res.render("index.ejs", { 
    question: currentQuestion 
  });
});

app.post("/submit", (req, res) => {
  const answer = req.body.answer.trim().toLowerCase();
  const isCorrect = currentQuestion.nationality.toLowerCase() === answer;
  
  if (isCorrect) {
    totalCorrect++;
  }

  currentQuestion = getRandomQuestion();
  
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect
  });
});

// Server start
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log("Closing database connection");
  await db.end();
  process.exit();
});




// import express from "express";
// import bodyParser from "body-parser";
// import pg from "pg";
// import dotenv from 'dotenv';
// dotenv.config({ path: './cred.env' });


// const db = new pg.Client({
//   user: process.env.DB_USER, 
//   host: process.env.DB_HOST, 
//   database: process.env.DB_DATABASE, 
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });


// const app = express();
// const port = 3000;

// db.connect();

// let ans = [];
// db.query("SELECT * FROM players", (err, res) => {
//   if (err) {
//     console.error("Error executing query", err.stack);  
//   } else {
//     ans = res.rows;
//   }
//   db.end();
// });

// let totalCorrect = 0;

// // Middleware
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));

// let currentQuestion = {};

// // GET home page
// app.get("/", async (req, res) => {
//   totalCorrect = 0;
//   await nextQuestion();
//   console.log(currentQuestion);
//   res.render("index.ejs", { question: currentQuestion });
// });

// // POST a new post
// app.post("/submit", (req, res) => {
//   let answer = req.body.answer.trim();
//   let isCorrect = false;
//   if (currentQuestion.nationality.toLowerCase() === answer.toLowerCase()) {
//     totalCorrect++;
//     console.log(totalCorrect);
//     isCorrect = true;
//   }

//   nextQuestion();
//   res.render("index.ejs", {
//     question: currentQuestion,
//     wasCorrect: isCorrect,
//     totalScore: totalCorrect,
//   });
// });

// async function nextQuestion() {
//   const randomplayer = ans[Math.floor(Math.random() * ans.length)];
//   currentQuestion = randomplayer;
// }

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });