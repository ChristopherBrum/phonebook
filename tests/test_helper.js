const Person = require('../models/person');
const User = require('../models/user');

const initialPeople = [
  {
    name: 'Chris Brum',
    number: '111-222-3333'
  },
  {
    name: 'Adrienne Jacob',
    number: '444-555-6666'
  },
  {
    name: 'Beemo the Cat',
    number: '000-000-0000'
  }
];

const nonExistingNumber = async () => {
  const person = new Person({ name: 'Ricky Henderson' });
  await person.save();
  await person.deleteOne();

  return person._id.toString();
};

const peopleInDb = async () => {
  const people = await Person.find({});
  return people.map(person => person.toJSON());
};

const insertMany = async (people) => {
  const peopleObjects = people.map(person => new Person(person));
  const promiseArray = peopleObjects.map(person => person.save());
  await Promise.all(promiseArray);
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
};

module.exports = {
  initialPeople, nonExistingNumber, peopleInDb, usersInDb
};