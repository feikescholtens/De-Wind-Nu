import nodemailer from "nodemailer";

export async function addFeedback(request, response) {

  //Set variables
  const data = request.body;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "dewindnu@gmail.com",
      pass: process.env.GMAIL_APP_KEY
    }
  });
  const regex = /\\n|\\r\\n|\\n\\r|\\r/g

  const name = data.name.slice(1, -1)
  const email = data.email.slice(1, -1)
  const message = data.message.replace(regex, '<br>').slice(1, -1)

  let subject = "Nieuwe feedback"
  if (name !== "") subject += ` van ${name}`

  let mailOptions = {
    from: '"Website" <dewindnu@gmail.com>',
    to: "dewindnu@gmail.com",
    subject: subject
  }

  //Send email to my email address
  mailOptions.html = `<h1>Nieuwe feedback</h1>
                      <table border="1px">
                        <tr>
                          <td>Naam:</td>
                          <td>${name}</td>
                        </tr>
                        <tr>
                          <td>E-mail:</td>
                          <td>${email}</td>
                        </tr>
                        <tr>
                          <td>Bericht:</td>
                          <td>${message}</td>
                        </tr>
                      </table>`
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      log(error, "error")
    } else {
      response.send(info.response.substring(0, 12));
    }
  })
}