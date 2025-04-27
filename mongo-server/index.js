const express = require("express");
const mongoose = require("mongoose");
const config = require("./config.json");
let app = express();

app.use(express.static("views"));
app.use(express.json());
let url = `mongodb+srv://${config.username}:${config.userpassword}@${config.clustername}.${config.userstring}.mongodb.net/${config.dbname}?retryWrites=true&w=majority&appName=Valtech`;

mongoose
  .connect(url)
  .then((res) => {
    console.log("DB Connected");
  })
  .catch((error) => {
    console.log("Error ", error);
  });

let Schema = mongoose.Schema;
let ObjectId = mongoose.Schema.ObjectId;

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, required: true },
  label: { type: String },
  id: { type: String, required: true }, // no unique
  name: { type: String, required: true },
  option: { type: [String] },
  accept: { type: String },
});

const formSchema = new mongoose.Schema({
  id: { type: ObjectId, unique: true, required: true },
  noOfQues: { type: Number, required: true },
  title: { type: String, required: true },
  questions: [questionSchema],
});

let FormData = mongoose.model("FormData", formSchema);

const User = mongoose.model(
  "User",
  new Schema({
    userId: ObjectId,
    firstname: String,
    lastname: String,
    email: String,
    password: String,
  })
);

const FormResponse = mongoose.model(
  "FormResponse",
  new Schema({
    formid: { type: mongoose.Schema.Types.ObjectId, ref: "FormData" },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userResponses: [
      {
        questionText: { type: String },
        response: { type: String },
      },
    ],
  })
);

app.get("/admin-dashboard", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/admin/forms", (req, res) => {
  FormData.find()
    .then((dbRes) => res.json(dbRes))
    .catch((error) => {
      console.log("Error fetching forms: ", error);
      res.status(500).send("Database error");
    });
});

app.get("/admin/forms/:id", (req, res) => {
  FormData.findById(req.params.id)
    .then((form) => {
      if (!form) return res.status(404).json({ message: "Form not found" });
      res.json(form);
    })
    .catch(() => res.status(500).json({ error: "Failed to fetch form" }));
});

app.get("/responses", (req, res) => {
  FormResponse.find()
    .populate("formid")
    .populate("userid")
    .then((dbRes) => {
      const formatted = dbRes.map((doc) => ({
        id: doc._id,
        username: doc.userid?.firstname + " " + doc.userid?.lastname,
        formTitle: doc.formid?.title,
        userResponses: doc.userResponses,
      }));
      res.json(formatted);
    })
    .catch((error) => {
      console.log("Error fetching responses: ", error);
      res.status(500).send("Error fetching responses");
    });
});

app.get("/responses/:id", (req, res) => {
  FormResponse.findById(req.params.id)
    .populate("formid")
    .populate("userid")
    .then((resp) => {
      if (!resp) return res.status(404).json({ message: "No Response found" });
      const formatted = {
        id: resp._id,
        username: resp.userid?.firstname + " " + resp.userid?.lastname,
        formTitle: resp.formid?.title,
        userResponses: resp.userResponses,
      };
      res.json(formatted);
    })
    .catch(() =>
      res.status(500).json({ error: "Failed to fetch user response" })
    );
});

app.listen(config.port, config.host, function (error) {
  if (error) {
    console.log("Error", error);
  } else {
    console.log("Express is live on port " + config.port);
  }
});
