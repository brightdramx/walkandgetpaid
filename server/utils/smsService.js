// smsService.js
const twilio = require('twilio');

// Twilio credentials (get these from your Twilio account dashboard)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client 
const client = twilio(accountSid, authToken); 

// Function to send SMS
const sendSMS = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber, // Your Twilio number
      to: to, // Destination number 
    });

    console.log('SMS sent successfully:', response.sid);
    return response;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
};

module.exports = { sendSMS };
