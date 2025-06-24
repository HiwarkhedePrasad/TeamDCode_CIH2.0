const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "CIH2",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// ✅ API to verify linkId against assessment_uuid
app.get("/api/assessment/:linkId", (req, res) => {
  const linkId = req.params.linkId;

  // Query to select all columns from the 'assessment' table
  // since candidate_id, job_title, and candidate_email are already in it.
  const query = "SELECT * FROM assessments WHERE assessment_uuid = ?";

  db.query(query, [linkId], (err, results) => {
    if (err) {
      console.error("Error checking assessment_uuid:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      console.log(results);
      // If a match is found, send all details from the assessment table itself
      res.status(200).json({
        message: "Valid assessment link and details fetched",
        data: results[0], // results[0] will contain all columns of the matching assessment record
      });
    } else {
      res.status(404).json({
        message: "Invalid or expired assessment link",
      });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
