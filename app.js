const express = require('express');
const parser = require('body-parser');
const app = express();
const https = require('https');
const port = 3000;
app.use(parser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get('/', (req, res) => {
  res.sendFile("/signup.html", {root: __dirname});
})

app.post("/", (req, res) => {
  var firstName = req.body.fname;
  var lastName = req.body.lname;
  var email = req.body.email;

  var data {
      members: [
        {
          email_address: email,
          status: "subscribed",
          merge_fields: {
            FNAME: "firstName",
            LNAME: "lastName"
          }
        }
      ]
  };

  var jsonData = JSON.stringify(data);
  const url = "https://us18.admin.mailchimp.com/";

  https.request(url, options, () => {

  })

})


app.listen(port, () => {
  console.log("listening on port " + port);
})

//API Key
//c14d1ba89d4d67919766129577e91c01-us18

//list id
//5a2c143b6a
