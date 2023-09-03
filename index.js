require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/phone');

const app = express();

app.use(express.static('dist'));
app.use(express.json());
app.use(cors());

morgan.token('body', (req) => {
  const object = JSON.stringify(req.body);
  return object;
});

app.get('/api/persons', morgan('tiny'), (request, response) => {
  Person.find({}).then((data) => {
    response.json(data);
  });
});

app.get('/info', morgan('tiny'), (request, response) => {
  Person.count({}).then((count) => {
    const currentTime = new Date();
    return response.send(
      `<p>Persons has info for ${count} persons</p>
      <p>${currentTime}</p>`
    );
  });
});

app.get('/api/persons/:id', morgan('tiny'), (request, response, next) => {
  Person.findById(request.params.id)
    .then((data) => {
      if (data) {
        response.json(data);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', morgan('tiny'), (request, response, next) => {
  const { id } = request.params;
  Person.findByIdAndRemove(id)
    .then(() => response.status(204).end())
    .catch((error) => next(error));
});

app.post(
  '/api/persons',
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
  (request, response, next) => {
    console.log(request);
    const { body } = request;

    const newPerson = new Person({
      name: body.name,
      number: body.number,
    });

    newPerson
      .save()
      .then((savedPerson) => {
        console.log(savedPerson);
        return response.json(savedPerson);
      })
      .catch((error) => next(error));
  }
);

app.put('/api/persons/:id', morgan('tiny'), (request, response, next) => {
  const { id } = request.params;
  const { body } = request;

  const people = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(id, people, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPeople) => response.json(updatedPeople))
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  next(error);
  return null;
};

app.use(errorHandler);

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
