const { json, urlencoded } = require("body-parser");
const author = require('./routes/api/author');
const cors = require("cors");
const express = require("express");
const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Francis  application." });
});

//TUTORIAL ROUTES
app.use("/api/author", author);




// let promise = getAllAuthors();
// promise
//   .then((result) => {
//     console.log(result);
//     //    result.forEach( (row) => {
//     //     console.log(`${row.name} lives in ${row.city}`);
//     //   });
//   })
//   .catch((error) => {
//     console.log(error);
//   });

// let promise2 = createAuthor({ name: "Craig Buckler", city: "Exmouth" });
// promise2
//   .then((result) => {
//     console.log("Successfully created a an author");
//     console.log(result.insertId);
//   })
//   .catch((error) => console.log(error));

// let promise3 = updateAuthor({ city: "Kampala", id: 3 });
// promise3
//   .then((res) => {
//     console.log("Successfully updated author");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// let promise4 = deleteAuthor(5);
// promise4
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => console.log(err));

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
