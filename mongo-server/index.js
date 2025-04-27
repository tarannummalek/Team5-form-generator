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
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.use("/api/auth", authRoutes);

app.use(express.static(path.join(__dirname, "/pages")));

app.use(errorHandler);

const PORT = 5050;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
