async function addFeedback(request, response) {
  const nodemailer = require("nodemailer")

  //Set variables
  data = request.body;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.GMAIL_APP_KEY
    }
  });
  let mailOptions = {
    from: '"Website" <dewindnu@gmail.com>',
    to: 'dewindnu@gmail.com',
    subject: 'Nieuwe feedback'
  };

  //Send email to my email address
  const regex = /\\n|\\r\\n|\\n\\r|\\r/g

  mailOptions.html = `<h1>Nieuwe feedback</h1><table border="1px"><tr><td>Naam:</td><td>${data.name.slice(1,-1)}</td></tr><tr><td>E-mail:</td><td>${data.email.slice(1,-1)}</td></tr><tr><td>Bericht:</td><td>${data.message.replace(regex, '<br>').slice(1,-1)}</td></tr></table>`;
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      response.send(info.response.substring(0, 12));
    }
  });
}

module.exports = {
  addFeedback
};