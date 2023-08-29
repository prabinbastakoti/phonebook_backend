const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(express.json());

morgan.token("body", function (req) {
  const object = JSON.stringify(req.body);
  return object;
});

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", morgan("tiny"), (request, response) => {
  response.json(persons);
});

app.get("/info", morgan("tiny"), (request, response) => {
  const length = persons.length;
  const currentTime = new Date();
  return response.send(
    `<p>Persons has info for ${length} persons</p>
      <p>${currentTime}</p>`
  );
});

app.get("/api/persons/:id", morgan("tiny"), (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
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
    const person = request.body;
    const id = Math.floor(Math.random() * 100000);

    const exist = persons.find((item) => item.name === person.name);

    if (!person.name || !person.number) {
      return response
        .status(400)
        .json({ error: "name or number is not provided" });
    }
    if (exist) {
      return response.status(400).json({ error: "name must be unique" });
    }
    person.id = id;
    persons = persons.concat(person);
    response.json(persons);
  }
);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
