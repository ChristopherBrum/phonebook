require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

const Person = require('./models/person');

///// MIDDLEWARE

app.use(express.static('build'));
app.use(express.json());
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());


///// ROUTES /////

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
    .catch(err => {
      console.log('error fetching all persons:', err.message)
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
	Person.findByIdAndDelete(request.params.id)
		.then(person => {
			response.status(204).end();
		})
		.catch(err => {
			console.log('error deleting person', err);
		})
})

///// LISTENER /////

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
})