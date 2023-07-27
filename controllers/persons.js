const personRouter = require('express').Router();
const Person = require('../models/person');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const getTokenFrom = request => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

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
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }

  const user = await User.findById(decodedToken.id);

  const person = new Person({
    name: body.name,
    number: body.number,
    user: user._id,
  });

  if (!/^\d{3}-\d{3}-\d{4}$/.test(body.number)) {
    return response.status(400).end();
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