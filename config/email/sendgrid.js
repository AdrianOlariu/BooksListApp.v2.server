require('dotenv').config({path:'../../.env'});
const client = require('@sendgrid/mail');

client.setApiKey(process.env.SENDGRID_API_KEY);

const email = {
    to: 'adyyo93@gmail.com', // Change to your recipient
    from: 'adrian.olariu93@gmail.com', // Change to your verified sender
    subject: 'test',
    text: 'test',
    html: '<strong>test with Node.js</strong>',
}


module.exports = {client, email};