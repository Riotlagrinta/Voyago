require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.send({
  from: 'Voyago <delivered@resend.dev>',
  to: 'djkeda82@gmail.com',
  subject: 'Test de configuration Resend - Voyago',
  html: '<h2>Test réussi !</h2><p>Resend est correctement configuré pour Voyago.</p>'
})
.then(console.log)
.catch(console.error);