//user 2 temp password hash manually
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10; 

const password = 'password123'; // Choose a temporary password
bcrypt.hash(password, SALT_ROUNDS)
    .then(hash => {
        console.log('Hashed Password:', hash);
    })
    .catch(err => console.error(err));