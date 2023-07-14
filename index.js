const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const Person = require('./models/person');

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

	console.log(error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message });
	}

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
}

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static('build'));

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(() => {
			response.status(204).end();
		})
		.catch(error => {
			// next(error)
			console.log(`error deleting person with id: ${request.params.id}`, error.message);
      response.status(404).end()
		});
})

app.get('/info', (request, response) => {
	Person
    .find({})
    .then((persons) => {
			console.log(persons)
			const infoMessage = `Phonebook has info for ${persons.length} people`;
			const timeReceived = String(new Date());
			const htmlText = [infoMessage, timeReceived].map(text => '<p>' + text + '</p>').join('');
			response.set('Content-Type', 'text/html');
			response.send(htmlText);
    })
    .catch(error => {
      console.log('error fetching all persons:', error.message)
      response.status(404).end()
    })
})

app.get('/api/persons', (request, response) => {
	Person
    .find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch(err => {
      console.log('error fetching all persons:', err.message)
      response.status(404).end()
    })
})

app.get('/api/persons/:id', (request, response) => {
	Person
    .findById(request.params.id)
    .then(person => {
      response.json(person);
    })
    .catch(err => next(err));
})

app.post('/api/persons', (request, response, next) => {
	const body = request.body;

	const person = new Person({
		name: body.name,
		number: body.number
	})

	person.save()
		.then(savedPerson => {
			response.json(savedPerson);
		})
		.catch(err => next(err));
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id, 
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  ) 
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
})