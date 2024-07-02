const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");


const sessionSecret = process.env.SECRET_KEY;
const nfcSecret = process.env.NFC_SECRET_KEY;

router.post("/user/auth", async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
    
    try {
        const payload = jwt.verify(token, nfcSecret);
        const { email } = payload
        const findUser = await User.findOne({ email });
        if (!findUser) {
          return res.status(400).json({ message: 'User does not exist in the database' });
        }

        const sessionToken = jwt.sign({ userId: payload.userId, role: payload.role }, sessionSecret, { expiresIn: '1h' });

        return res.status(200).json({ message: "SUCCESS", data : {sessionToken }});
      } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
      }
})

module.exports = router;