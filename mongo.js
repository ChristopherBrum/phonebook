const mongoose = require('mongoose');

const password = process.argv[2];
const personName = process.argv[3];
const personNumber = process.argv[4];

const url = `mongodb+srv://christopherbrum:${password}@cluster0.21oah6c.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  Person
    .find({})
    .then(result => {
      console.log('phonebook:');
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`);
      })
      mongoose.connection.close();
    })
    .catch(error => {
      console.error('Error occurred:', error);
      mongoose.connection.close();
    });
} else if (process.argv.length === 5) {
  const newPerson = new Person({
    name: personName,
    number: personNumber,
  });
  
  newPerson
    .save()
    .then(result => {
      console.log(`added --> name: "${personName}" number: "${personNumber}" to phonebook`);
      mongoose.connection.close()
    })
    .catch(error => {
      console.error('Error occurred:', error);
      mongoose.connection.close();
    });
} else {
  console.log('3 arguments required: <password> <contact name> <contact number>')
  process.exit(1);
}



// username = christopherbrum
// pw = GFZSxTyWhNfxTmjK