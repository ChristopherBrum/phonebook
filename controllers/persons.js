const personRouter = require('express').Router();
const Person = require('../models/person');

personRouter.get('/', async (request, response) => {
  const people = await Person.find({});
  response.json(people);
});

personRouter.get('/:id', async (request, response) => {
  const person = await Person.findById(request.params.id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

personRouter.post('/', async (request, response) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number
  });

  if (!/^\d{3}-\d{3}-\d{4}$/.test(body.number)) {
    response.status(400).end();
    return;
  }

  const savedPerson = await person.save();
  response.status(201).json(savedPerson);
});

personRouter.put('/:id', async (request, response) => {
  const { name, number } = request.body;

  const updatedPerson = await Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  );
  response.json(updatedPerson);
});

personRouter.delete('/:id', async (request, response) => {
  await Person.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

module.exports = personRouter;