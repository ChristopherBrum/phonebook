const supertest = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Person = require('../models/person');
const User = require('../models/user');

beforeEach(async () => {
  await Person.deleteMany({});
  await Person.insertMany(helper.initialPeople);
});

describe('when there is initially some people saved', () => {
  test('people are returned as JSON', async () => {
    await api
      .get('/api/persons')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  }, 100000);

  test('all people are returned', async () => {
    const response = await api.get('/api/persons');

    expect(response.body).toHaveLength(helper.initialPeople.length);
  });

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/persons');

    const contents = response.body.map(r => r.name);
    expect(contents).toContain('Beemo the Cat');
  });

  test('there are three people', async () => {
    const response = await api.get('/api/persons');

    expect(response.body).toHaveLength(3);
  });
});

describe('viewing a specific person', () => {
  test('succeeds with a valid id', async () => {
    const peopleToStart = await helper.peopleInDb();
    const person = peopleToStart[0];

    const resultPerson = await api
      .get(`/api/persons/${person.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(resultPerson.body).toEqual(person);
  });

  test('fails with a statuscode 404 if the note does not exist', async () => {
    const peopleToStart = await helper.peopleInDb();
    const person = peopleToStart[0];
    const personId = person.id;

    await api.delete(`/api/persons/${personId}`);

    await api
      .get(`/api/persons/${person.id}`)
      .expect(404);
  });

  test('fails with a statuscode 400 if the id is invalid', async () => {
    await api
      .get('/api/persons/1212121212')
      .expect(400);
  });
});

describe('addition of a new person', () => {
  beforeEach(async () => {
		await User.deleteMany({});

		const passwordHash = await bcrypt.hash('sekret', 10);
		const user = new User({ username: 'root', passwordHash });

		await user.save();
	});

  test('succeeds with valid data', async () => {
    const user = await helper.usersInDb();
    const userId = user[0].id;

    const newPerson = {
      name: 'Cecil the Dog',
      number: '333-333-3333',
      // fails the test because of hardcoding the userId in our POST route
      userId
    };

    await api
      .post('/api/persons')
      .send(newPerson)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const peopleAtEnd = await helper.peopleInDb();
    expect(peopleAtEnd).toHaveLength(helper.initialPeople.length + 1);

    const contents = peopleAtEnd.map(person => person.name);
    expect(contents).toContain('Cecil the Dog');
  });

  test('fails with statuscode 400 if data invalid', async () => {
    const newPerson = { name: 'Mimi' };

    await api
      .post('/api/persons')
      .send(newPerson)
      .expect(400);

    const peopleAtEnd = await helper.peopleInDb();
    expect(peopleAtEnd).toHaveLength(helper.initialPeople.length);
  });
});

describe('updating of a person', () => {
  test('succeeds with valid person data', async () => {
    const peopleAtStart = await helper.peopleInDb();
    const person = peopleAtStart[0];
    const newPersonObject = {
      name: person.name,
      number: '123-456-7890',
      id: person.id,
    };

    await api
      .put(`/api/persons/${person.id}`)
      .send(newPersonObject)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const peopleAtEnd = await helper.peopleInDb();
    const contents = peopleAtEnd.map(person => person.number);
    expect(contents).toContain('123-456-7890');
  });
});

describe('deletion of a person', () => {
  test('succeeds with a statuscode 204 if id is valid', async () => {
    const peopleAtStart = await helper.peopleInDb();
    const startPerson = peopleAtStart[0];

    await api
      .delete(`/api/persons/${startPerson.id}`)
      .expect(204);

    const peopleAtEnd = await helper.peopleInDb();
    const noMatchingPerson = peopleAtEnd.every(endPerson => endPerson !== startPerson);
    expect(noMatchingPerson).toBe(true);
    expect(peopleAtEnd).toHaveLength(peopleAtStart.length - 1);
  });
});

afterAll(async () => {
	await mongoose.connection.close();
});