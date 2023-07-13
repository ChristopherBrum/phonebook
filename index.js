require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Person = require('./models/person');

app.use(express.json());
app.use(express.static('build'));
app.use(cors());

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

// Helpers

const nameExists = (attemptedName) => {
	Person
    .find({})
    .then((persons) => {
			// persons.some(person => {
			// 		console.log(personExists, person.name === attemptedName)
			// })			
    })
    .catch(err => {
      console.log('error fetching all persons:', err.message)
      response.status(404).end()
    })
}

// Routes

app.get('/info', (request, response) => {
	const infoMessage = `Phonebook has info for ${persons.length} people`;
	const timeReceived = String(new Date());
	const htmlText = [infoMessage, timeReceived].map(text => '<p>' + text + '</p>').join('');
	
	response.set('Content-Type', 'text/html');
	response.send(htmlText);
})

app.get('/api/persons', (request, response) => {
	Person
    .find({})
    .then((persons) => {
			console.log('persons:', persons)
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
    .catch(err => {
      console.log('error fetching person:', err.message)
      response.status(404).end()
    });
})

app.post('/api/persons', (request, response) => {
	const body = request.body;

	if (!body.name || !body.number) {
		return response.status(404).json({
      error: "name or number missing",
    })
	} else if (nameExists(body.name)) {
		return response.status(404).json({
      error: `${body.name} already exists`,
    })
	}

	const person = new Person({
		name: body.name,
		number: body.number
	})

	person.save()
		.then(savedPerson => {
			response.json(savedPerson);
		})
})

app.delete('/api/persons/:id', (request, response) => {
	const personId = request.params.id;
	const targetPerson = persons.find(person => String(person.id) === personId)
	const targetIndex = persons.indexOf(targetPerson);

	if (targetIndex === -1) {
		response.status(204).end();
	} else {
		persons.splice(targetIndex, 1);
		response.status(204).end();
	}
})

// Listener

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
})