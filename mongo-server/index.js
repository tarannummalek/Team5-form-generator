const express = require("express");
let mongoose = require("mongoose");
const config = require("./config.json");
let app = express();
app.use(express.json());
app.use(express.static("public"));

let url = `mongodb+srv://${config.username}:${config.userpassword}@${config.dbname}.${config.userstring}.mongodb.net/${config.dbname}?retryWrites=true&w=majority&appName=Valtech`;

mongoose
  .connect(url)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((error) => {
    console.log("Error", error);
  });

let Schema = mongoose.Schema;
let ObjectId = mongoose.Schema.Types.ObjectId;

let Form = mongoose.model(
  "Form",
  new Schema({
    formId: { type: ObjectId, auto: true },
    title: { type: String, required: true },
    noOfQues: { type: Number, required: true },
    questions: [
      {
        question: { type: String},
        type: { type: String},
      },
    ],
  })
);


let FormResponse = mongoose.model(
  "FormResponse",
  new Schema({
    formId: { type: ObjectId, ref: "Form", required: true },
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
  res.sendFile(__dirname + "/public/views/user-dashboard.html");
});

app.get("/forms/:formId", (req, res) => {
  res.sendFile(__dirname + "/public/views/user-formpage.html");
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

      const formattedForm = {
        formId: form._id,
        title: form.title,
        questions: form.questions.map((q) => ({
          question: q.question,
          type: q.type,
        })),
      };

      res.json(formattedForm);
    })
    .catch(() => res.status(500).json({ error: "Failed to fetch form" }));
});

app.post("/submit-response", (req, res) => {
  const { formId, userId, responses } = req.body;


  if (!mongoose.Types.ObjectId.isValid(formId)) {
    return res.status(400).json({ error: "Invalid formId" });
  }


  let formResponse = new FormResponse({
    formId: mongoose.Types.ObjectId(formId), 
    userId,
    responses,
  });

  formResponse
    .save()
    .then(() => {
      res.status(200).json({ message: "Responses saved successfully" });
    })
    .catch((error) =>
      res.status(500).json({ error: "Failed to save responses", details: error.message })
    );
});


app.listen(config.port, config.host, () => {
  console.log("Server running on " + config.host + ":" + config.port);
});
