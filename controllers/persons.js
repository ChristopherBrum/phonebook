const personRouter = require('express').Router();
const Person = require('../models/person');
const User = require('../models/user');

personRouter.get('/', async (request, response) => {
  const people = await Person.find({}).populate('user', { username: 1, name: 1 });
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

  // HARDCODED!!!! REPLACE
  // won't pass test because harding userId from production db
  const userId = '64b5ed2c9983e040315279c4';
  const user = await User.findById(userId);
  // const user = await User.findById(body.userId);

  const person = new Person({
    name: body.name,
    number: body.number,
    // CURRENTLY HARDCODED!!!!
    user: userId,
  });

  if (!/^\d{3}-\d{3}-\d{4}$/.test(body.number)) {
    response.status(400).end();
    return;
  }

  const savedPerson = await person.save();
  user.people = user.people.concat(savedPerson._id);
  await user.save();

  response.status(201).send(savedPerson);
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