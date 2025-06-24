require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer"); // Import multer
const path = require("path"); // Import path module for directory manipulation
const fs = require("fs"); // Import fs for file system operations
const axios = require("axios"); // NEW: Import axios for making HTTP requests
const FormData = require("form-data"); // NEW: Import form-data for constructing multipart/form-data

const app = express();
const PORT = process.env.SERVER_PORT || 5000; // Use port from .env or default to 5000

app.use(cors()); // Enables CORS for all origins, you might want to restrict this in production
app.use(express.json()); // To parse JSON request bodies

// Create the 'uploads/resumes' directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads", "resumes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Files will be saved in 'uploads/resumes' directory
  },
  filename: function (req, file, cb) {
    // Generate a unique filename: fieldname-timestamp.ext
    // Example: resume-1678912345678.pdf
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    // Allow only PDF and common document types for resumes
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Only PDF, DOC, and DOCX files are allowed!");
    }
  },
});

// MySQL connection setup
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "cih2",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    process.exit(1);
  } else {
    console.log("Connected to MySQL database:", process.env.DB_NAME || "cih2");
  }
});

// 1. API to verify linkId against assessment_uuid and fetch details (for AI Screening page)
app.get("/api/assessment/:linkId", (req, res) => {
  const linkId = req.params.linkId;

  if (!linkId) {
    return res.status(400).json({ message: "Assessment ID is missing." });
  }

  const query = "SELECT * FROM assessment WHERE assessment_uuid = ?";

  db.query(query, [linkId], (err, results) => {
    if (err) {
      console.error("Error checking assessment_uuid:", err);
      console.error("SQL Error Details:", err.sqlMessage, "SQL:", err.sql);
      return res
        .status(500)
        .json({ error: "Database error", details: err.sqlMessage });
    }

    if (results.length > 0) {
      res.status(200).json({
        message: "Valid assessment link and details fetched",
        data: results[0],
      });
    } else {
      res.status(404).json({
        message: "Invalid or expired assessment link",
      });
    }
  });
});

// 2. API to submit assessment results (from the frontend's main assessment platform)
app.post("/api/assessment/submit-results", (req, res) => {
  const {
    assessmentId,
    employeeId,
    score,
    totalQuestions,
    answers,
    proctoringViolations,
  } = req.body;

  if (
    !assessmentId ||
    !employeeId ||
    score === undefined ||
    totalQuestions === undefined
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields for result submission." });
  }

  const finalStatus = proctoringViolations.isDisqualified
    ? "disqualified"
    : "completed";
  const tabSwitches = proctoringViolations.tabSwitchCount || 0;
  const answersJsonString = JSON.stringify(answers);

  const updateQuery = `
    UPDATE assessment 
    SET 
      score = ?, 
      status = ?, 
      end_time = CURRENT_TIMESTAMP, 
      proctoring_violations_count = ?,
      answers_json = ? 
    WHERE assessment_uuid = ? AND candidate_id = ?;
  `;

  db.query(
    updateQuery,
    [
      score,
      finalStatus,
      tabSwitches,
      answersJsonString,
      assessmentId,
      employeeId,
    ],
    (err, result) => {
      if (err) {
        console.error("Error submitting assessment results:", err);
        console.error("SQL Error Details:", err.sqlMessage, "SQL:", err.sql);
        return res
          .status(500)
          .json({ error: "Failed to save results", details: err.sqlMessage });
      }

      if (result.affectedRows === 0) {
        console.warn(
          `No assessment found to update for UUID: ${assessmentId} and Candidate ID: ${employeeId}`
        );
        return res
          .status(404)
          .json({ message: "Assessment or candidate not found for update." });
      }

      console.log(
        `Assessment results for ${assessmentId} (Candidate: ${employeeId}) submitted successfully.`
      );
      res
        .status(200)
        .json({ message: "Assessment results received and processed." });
    }
  );
});

// 3. API to create a trial assessment (called by the homepage's "Try AutoScreen.ai Now!" button)
app.post("/api/create-trial-assessment", (req, res) => {
  const { assessment_uuid, candidate_id, candidate_email, job_title, status } =
    req.body;

  if (
    !assessment_uuid ||
    !candidate_id ||
    !candidate_email ||
    !job_title ||
    !status
  ) {
    return res
      .status(400)
      .json({
        message: "Missing required fields for trial assessment creation.",
      });
  }

  const query = `
    INSERT INTO assessment 
    (assessment_uuid, candidate_id, candidate_email, job_title, status, created_at)
    VALUES (?, ?, ?, ?, ?, NOW());
  `;
  const params = [
    assessment_uuid,
    candidate_id,
    candidate_email,
    job_title,
    status,
  ];

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Error creating trial assessment:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({
            message: "Assessment with this UUID already exists.",
            details: err.sqlMessage,
          });
      }
      return res
        .status(500)
        .json({
          error: "Database error during trial assessment creation",
          details: err.sqlMessage,
        });
    }

    res.status(201).json({
      message: "Trial assessment created successfully",
      assessmentId: assessment_uuid,
      insertedId: result.insertId,
    });
  });
});

// 4. API for Resume Uploads (from the frontend) and forwarding to FastAPI
app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const fastapiUrl =
    process.env.FASTAPI_RESUME_UPLOAD_URL ||
    "http://localhost:6000/upload_resume"; // Default FastAPI URL

  console.log(`Forwarding resume to FastAPI at: ${fastapiUrl}`);

  try {
    const form = new FormData();
    // Append the file using fs.createReadStream to handle it efficiently
    form.append("resume", fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // You can also append other fields from the original request body if needed by FastAPI
    // for (const key in req.body) {
    //   form.append(key, req.body[key]);
    // }

    // Use axios to send the multipart/form-data
    const fastapiResponse = await axios.post(fastapiUrl, form, {
      headers: form.getHeaders(), // Important: This sets the correct Content-Type: multipart/form-data with boundary
      maxContentLength: Infinity, // Allow large files
      maxBodyLength: Infinity, // Allow large files
    });

    // Log the response from FastAPI for debugging
    console.log("FastAPI response status:", fastapiResponse.status);
    console.log("FastAPI response data:", fastapiResponse.data);

    // After successful forwarding, you might want to delete the temporary file Multer saved
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting temporary file:", err);
      else console.log("Cleaned up temporary file:", req.file.path);
    });

    // Send FastAPI's response back to the frontend
    res.status(fastapiResponse.status).json(fastapiResponse.data);
  } catch (error) {
    console.error("Error forwarding resume to FastAPI:", error);
    // Attempt to parse FastAPI's error response if available
    let errorMessage = "Failed to forward resume to FastAPI.";
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("FastAPI error response data:", error.response.data);
      console.error("FastAPI error response status:", error.response.status);
      errorMessage = `FastAPI Error: ${
        error.response.status
      } - ${JSON.stringify(error.response.data)}`;
      // If FastAPI sends a JSON error, forward it
      return res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "No response received from FastAPI. Is it running?";
      console.error("FastAPI error request:", error.request);
    } else {
      // Something else happened while setting up the request
      errorMessage = `Error setting up request to FastAPI: ${error.message}`;
    }

    // After an error, still try to delete the temporary file
    fs.unlink(req.file.path, (err) => {
      if (err)
        console.error(
          "Error deleting temporary file after forwarding error:",
          err
        );
      else
        console.log(
          "Cleaned up temporary file after forwarding error:",
          req.file.path
        );
    });

    res.status(500).json({ message: errorMessage });
  }
});

// Error handling for Multer (e.g., file size limits, invalid file types)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer Error: ${err.message}` });
  } else if (err) {
    return res
      .status(500)
      .json({ message: `File Upload Error: ${err.message}` });
  }
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
