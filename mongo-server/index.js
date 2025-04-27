const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const { errorHandler } = require("./utils/errorHandler");
const config = require("./config.json");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5050",
    credentials: true,
  })
);

app.use(express.json());


const url = `mongodb+srv://${config.username}:${config.userpassword}@${config.dbname}.${config.userstring}.mongodb.net/${config.dbname}?retryWrites=true&w=majority&appName=Valtech`;

mongoose
  .connect(url)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.use("/api/auth", authRoutes);

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId;

const Form = mongoose.model(
  "Form",
  new Schema({
    formId: ObjectId,
    title: String,
    noOfQues: Number,
    questions: [
      {
        question: String,
        type: String,
      },
    ],
  })
);

const FormResponse = mongoose.model(
  "FormResponse",
  new Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
    userId: { type: String, required: true },
    responses: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views/user-dashboard.html"));
});

app.get("/forms/:formId", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views/user-formpage.html"));
});

app.get("/forms", (req, res) => {
  Form.find()
    .then((forms) => {
      res.json(forms);
    })
    .catch((error) => res.status(500).json({ error: "Failed to fetch forms" }));
});

app.get("/api/forms/:formId", (req, res) => {
  Form.findById(req.params.formId)
    .then((form) => {
      if (!form) return res.status(404).json({ message: "Form not found" });
      res.json(form);
    })
    .catch(() => res.status(500).json({ error: "Failed to fetch form" }));
});

app.post("/submit-response", (req, res) => {
  const { formId, userId, responses } = req.body;
  let formResponse = new FormResponse({
    formId,
    userId,
    responses,
  });

  formResponse
    .save()
    .then(() => {
      res.status(200).json({ message: "Responses saved successfully" });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to save responses" });
    });
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "../mongo-client/pages")));

app.use(errorHandler);

const PORT = config.port || 5050;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

