const express = require('express')
const axios = require('axios');
const cors = require('cors');
const nodemailer = require('nodemailer')
const saveDetails = require('./routes/SaveDetails')
const acceptance = require('./routes/ExpertAcceptance')
const result = require('./routes/MappingResults')
const boards = require('./routes/Boards')
const app = express();
const port = 5000;
const mongoDB = require('./db')
const mongoEx = require('./dbExpert')
const FASTAPI_URL = 'http://localhost:8000';
app.use(cors({origin: '*'}));
app.use(express.json());
mongoDB();
mongoEx();


// API route to get profile score from FastAPI
app.post('/api/profile-score', async (req, res) => {
    try {
        const { requirement } = req.body;
        console.log("calling api/match")
        // Send request to FastAPI service
        const response = await axios.post(`${FASTAPI_URL}/compute_profile_score/`, {
                requirement
        });
        
        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: 'Error connecting to FastAPI service' });
    }
});

app.use('/api',acceptance)
app.use('/api', result)
app.use('/api', boards)

app.post('/send-email', async (req, res) => {
  const { expertName, recipientEmail, token } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: 'tanviv8745@gmail.com', 
        pass: 'udol rccp ksrc bqog',
      },
    });

    const mailOptions = {
      from: 'tanviv8745@gmail.com',
      to: recipientEmail,
      subject: 'Invitation for SmartSync',
      html: `
        <div style="width: 100%; background-color: #f4f4f4; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
          <div style="max-width: 600px; background-color: white; padding: 20px; margin: 0 auto; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            
            // <!-- Logo or Image -->
            // <img src="https://your-image-url.com/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;" />

            <!-- Heading with SmartSync -->
            <h1 style="color: indigo; font-weight: bold; font-size: 24px; margin-bottom: 20px;">SmartSync</h1>
            
            <!-- Message -->
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Dear User,<br><br>
              Greetings from Smart-Sync.You have been invited for an interview </strong>.
            </p>

            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Would you like to accept or decline the invitation to this scheduled meeting?
            </p>

            <!-- Accept and Decline Buttons -->
            <div style="margin-top: 30px;">
              <a href="http://localhost:5000/api/update-response?token=${token}&response=accepted" 
                 style="display: inline-block; padding: 10px 20px; background-color: #4caf50; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px;">
                Accept
              </a>
              
              <a href="http://localhost:5000/api/update-response?token=${token}&response=declined" 
                 style="display: inline-block; padding: 10px 20px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px;">
                Decline
              </a>
            </div>

            <p style="margin-top: 30px; color: #777; font-size: 14px;">
              Thank you!<br>The SmartSync Team
            </p>

          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Sent mail");

    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email', error);
    res.status(500).send('Error sending email');
  }
});



app.get('/',(req,res)=>{
    res.send('Hello World');
})
// Add this line to include your new route
app.use('/api', require("./routes/SaveDetails"));

app.use('/api',require("./routes/CreateUser"))
// app.use('/api',require("./routes/Board"))
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })