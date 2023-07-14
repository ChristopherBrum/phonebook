const mongoose = require('mongoose');

const url = process.env.MONGODB_URI

console.log('connecting to', url);

mongoose.set('strictQuery', false);
mongoose.connect(url)
	.then(result => {
		console.log('connected to MongoDB');
	})
	.catch(err => {
		console.log('error connecting to MongoDB:', err.message);
	});

// const phoneFormatValidator = (phoneNumber) => {
//   const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
//   return phoneRegex.test(phoneNumber);
// }

const personSchema = new mongoose.Schema({
  // name: {
  //   type: String,
  //   minLength: 3,
  //   required: true,
  // },
  // number: {
  //   type: String,
  //   validate: {
  //     validator: phoneFormatValidator,
  //     message: 'Invalid phone number format'
    // },
  // },
  name: String,
  number: String,
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema);