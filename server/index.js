const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

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

  const query = "SELECT * FROM assessment WHERE assessment_uuid = ?";
  db.query(query, [linkId], (err, results) => {
    if (err) {
      console.error("Error checking assessment_uuid:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      res.status(200).json({
        message: "Valid assessment link",
        data: results[0],
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
