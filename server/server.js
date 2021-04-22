const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
// const path = require("path");
const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./models");
db.sequelize.sync();

app.get("/", (req, res) => {
  res.json({ message: "Welcome :) ❤" });
  // res.sendFile(path.join(__dirname, "./public", "index.html"));
});

require("./routes/user.routes")(app);
require("./routes/monitoring.routes")(app);
require("./routes/board.routes")(app);
require("./routes/log.routes")(app);

require("./routes/tutorial.routes")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
