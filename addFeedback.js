async function addFeedback(request, response, moment) {
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

  const date = moment().tz("Europe/Amsterdam").format("DD-MM-YYYY");
  const time = moment().tz("Europe/Amsterdam").format("HH:mm");
  const unix = moment().unix();

  //Add date and time to the obejct and insert into the database
  data.date = date;
  data.time = time;
  data.unix = unix

  //Send email to my email address
  mailOptions.html = `Op <strong>${date}</strong> om <strong>${time}</strong> nieuwe feedback<br><table><tr><td>Naam:</td><td>${data.name}</td></tr><tr><td>E-mail:</td><td>${data.email}</td></tr><tr><td>Bericht:</td><td>${data.message}</td></tr></table>`;
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