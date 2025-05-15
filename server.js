import express from 'express';

const app = express();
app.use(express.json());

const otpStore = new Map(); // Store OTPs temporarily

app.post('/api/send-otp', (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, otp);
  console.log(`OTP for ${phone}: ${otp}`); // Log OTP for testing
  res.status(200).send({ message: 'OTP sent successfully' });
});

app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const validOtp = otpStore.get(phone);
  if (validOtp === otp) {
    otpStore.delete(phone);
    res.status(200).send({ valid: true });
  } else {
    res.status(400).send({ valid: false });
  }
});

app.listen(3001, () => {
  console.log('Mock server running on http://localhost:3001');
});
