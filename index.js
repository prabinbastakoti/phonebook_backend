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

app.get("/api/persons/:id", morgan("tiny"), (request, response, next) => {
  person
    .findById(request.params.id)
    .then((data) => {
      if (data) {
        response.json(data);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", morgan("tiny"), (request, response, next) => {
  const id = request.params.id;
  person
    .findByIdAndRemove(id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error));
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

app.put("/api/persons/:id", morgan("tiny"), (request, response, next) => {
  const id = request.params.id;
  const body = request.body;

  const people = {
    name: body.name,
    number: body.number,
  };

  person
    .findByIdAndUpdate(id, people, { new: true })
    .then((updatedPeople) => response.json(updatedPeople))
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
};

app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
