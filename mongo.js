const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://prabinbastakoti1:${password}@cluster0.kpfnxrs.mongodb.net/Phonebook?retryWrites=true&w=majority`;

mongoose.connect(url).then(() => console.log('connected'));

const phoneSchema = new mongoose.Schema({
  name: String,
  number: Number,
});

const Phone = mongoose.model('Information', phoneSchema);

if (process.argv.length === 3) {
  Phone.find({}).then((result) => {
    console.log('Phonebook: ');
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];

  const newPhone = new Phone({
    name,
    number,
  });

  newPhone.save().then(() => {
    console.log(`added ${name} ${number} to phonebook.`);
    mongoose.connection.close();
  });
} else {
  console.log("Correct format is node mongo.js 'password' 'name' 'number'.");
  process.exit(1);
}
