const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const { errorHandler } = require("./utils/errorHandler");
const config = require("./config.json");
const FormData = require("./models/FormData");
const FormResponse = require("./models/FormResponse");
const { log } = require("console");
const app = express();
const port = config.port || 5050;
app.use(
  cors({
    origin: "http://localhost:5050", 
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "/public/views")));

const url = `mongodb+srv://${config.username}:${config.userpassword}@${config.dbname}.${config.userstring}.mongodb.net/${config.dbname}?retryWrites=true&w=majority&appName=Valtech`;

mongoose
  .connect(url)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/views", "login.html"));
  });
app.use("/api/auth", authRoutes);

app.get("/user-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views/user-dashboard.html"));
});

app.get("/forms/:formId", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views/user-formpage.html"));
});


app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views", "admin-dashboard.html"));
});
app.get("/admin1", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views/form1.html"));
});


app.get("/forms", (req, res) => {
  FormData.find()
    .then((forms) => {
      res.json(forms);
    })
    .catch((error) => res.status(500).json({ error: "Failed to fetch forms" }));
});

app.get("/api/forms/:formId", (req, res) => {
  FormData.findById(req.params.formId)
    .then((form) => {
      if (!form) return res.status(404).json({ message: "Form not found" });
      res.json(form);
    })
    .catch(() => res.status(500).json({ error: "Failed to fetch form" }));
});
app.get('/form/:id', (req, res) => {
  const formId = req.params.id;

  FormData.findById(formId)
    .then(form => {
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }
      res.json(form);
    })
    .catch(err => {
      console.error('Error fetching form:', err);
      res.status(500).json({ message: 'Error fetching form data', error: err });
    });
});

app.post("/submitForm", (req, res) => {
  const { title, noOfQues, questions } = req.body;

  const newForm = new FormData({
    title,
    noOfQues,
    questions,
  });

  newForm
    .save()
    .then(() => res.json({ message: "Form saved successfully", id: newForm._id }))
    .catch((err) => {
      console.error("Error saving form:", err);
      res.status(500).json({ message: "Error saving form", error: err });
    });
});

app.post("/submit-response", (req, res) => {
  const { formId, userId, responses } = req.body;

  let formResponse = new FormResponse({
    formId,
    userId,
    responses: responses.map((response) => ({
      questionText: response.questionText,
      response: response.response,
    })),
  });

  formResponse
    .save()
    .then(() => {
      res.status(200).json({ message: "Responses saved successfully" });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to save responses", details: error });
    });
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
    .populate("formId")
    .populate("userId")
    .then((dbRes) => {
      const formatted = dbRes.map((doc) => ({
        id: doc._id,
        username: doc.userId.name,
        formTitle: doc.formId?.title,
        userResponses: doc.responses,
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
    .populate("formId")
    .populate("userId")
    .then((resp) => {
      if (!resp) return res.status(404).json({ message: "No Response found" });
      
      const formatted = {
        id: resp._id,
        username: resp.userId.name,
        formTitle: resp.formId?.title,
        userResponses: resp.responses,
      };
      res.json(formatted);
    })
    .catch(() =>
      res.status(500).json({ error: "Failed to fetch user response" })
    );
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
