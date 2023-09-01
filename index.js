require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const person = require("./models/phone");
const app = express();

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());

morgan.token("body", function (req) {
  const object = JSON.stringify(req.body);
  return object;
});

app.get("/api/persons", morgan("tiny"), (request, response) => {
  person.find({}).then((data) => {
    response.json(data);
  });
});

app.get("/info", morgan("tiny"), (request, response) => {
  person.count({}).then((count) => {
    const currentTime = new Date();
    return response.send(
      `<p>Persons has info for ${count} persons</p>
      <p>${currentTime}</p>`
    );
  });
});

app.get("/api/persons/:id", morgan("tiny"), (request, response) => {
  person.findById(request.params.id).then((data) => response.json(data));
});

app.delete("/api/persons/:id", morgan("tiny"), (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.post(
  "/api/persons",
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
  (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
      return response
        .status(400)
        .json({ error: "name or number is not provided" });
    }

    const newPerson = new person({
      name: body.name,
      number: body.number,
    });

    newPerson.save().then((savedPerson) => {
      console.log(savedPerson);
      return response.json(savedPerson);
    });
  }
);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
