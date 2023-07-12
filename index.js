const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [
	{ 
		"id": 1,
		"name": "Arto Hellas", 
		"number": "040-123456"
	},
	{ 
		"id": 2,
		"name": "Ada Lovelace", 
		"number": "39-44-5323523"
	},
	{ 
		"id": 3,
		"name": "Dan Abramov", 
		"number": "12-43-234345"
	},
	{ 
		"id": 4,
		"name": "Mary Poppendieck", 
		"number": "39-23-6423122"
	}
]

app.get('/api/persons', (request, response) => {
	response.send(persons);
})

app.get('/info', (request, response) => {
	const infoMessage = `Phonebook has info for ${persons.length} people`;
	const timeReceived = String(new Date());
	const htmlText = [infoMessage, timeReceived].map(text => '<p>' + text + '</p>').join('');
	
	response.set('Content-Type', 'text/html');
	response.send(htmlText);
})

app.get('/api/persons/:id', (request, response) => {
	const personId = request.params.id;
	const person = persons.find(person => String(person.id) === personId)

	if (person) {
		response.json(person);
	} else {
		response.status(404).end();
	}
})

const generateId = () => {
	const maxId = persons.length > 0 
		? Math.max(...persons.map(person => Number(person.id))) 
		: 0; 

	return maxId + 1;
}

const nameExists = (attemptedName) => {
	return persons.some(person => person.name === attemptedName);
}

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

	const newPerson = {
		id: generateId(),
		name: body.name,
		number: body.number
	}

	persons = persons.concat(newPerson);
	response.json(newPerson);
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
})