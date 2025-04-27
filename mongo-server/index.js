const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const { errorHandler } = require("./utils/errorHandler");
const config = require("./config.json");
const Form = require("./models/FormData");
const FormResponse = require("./models/FormResponse");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5050",
    credentials: true,
  })
);
app.use(errorHandler);

const PORT = config.port || 5050;

app.use(express.json());
app.use(express.static("views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "/public/views")));
const url = `mongodb+srv://${config.username}:${config.userpassword}@${config.dbname}.${config.userstring}.mongodb.net/${config.dbname}?retryWrites=true&w=majority&appName=Valtech`;

mongoose
  .connect(url)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));


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

app.get("/admin-dashboard", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/admin/forms", (req, res) => {
  Form.find()
    .then((dbRes) => res.json(dbRes))
    .catch((error) => {
      console.log("Error fetching forms: ", error);
      res.status(500).send("Database error");
    });
});

app.get("/admin/forms/:id", (req, res) => {
  Form.findById(req.params.id)
   .then((form) => {
      if (!form) return res.status(404).json({ message: "Form not found" });
      res.json(form);
    })
    .catch(() => res.status(500).json({ error: "Failed to fetch form" }));
});

app.use("/api/auth", authRoutes);

app.get("/user-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views/user-dashboard.html"));
});

app.get("/forms/:formId", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views/user-formpage.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public/views", "login.html"));
  });
  
app.get("/forms", (req, res) => {
  console.log("in form");
  Form.find()
    .then((forms) => {
      console.log(forms)
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

app.post("/submit-response", (req, res) => {
  const { formId, userId, responses } = req.body;
console.log(req.body.responses);

  let formResponse = new FormResponse({
    formId,
    userId,
    responses: responses.map((response) => ({
      questionText: response.questionText,  
      response: response.response        
    }))
  });
console.log(formResponse);
alert("wait");
  formResponse
    .save()
    .then(() => {
      res.status(200).json({ message: "Responses saved successfully" });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to save responses", details: error });
    });
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
