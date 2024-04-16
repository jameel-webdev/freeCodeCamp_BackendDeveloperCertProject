var express = require("express");
var cors = require("cors");
require("dotenv").config();
const multer = require("multer");
var app = express();

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Set up storage location and filename using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route to handle POST requests for file uploads
app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  // Respond with the file details in JSON format
  res.json({
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});
