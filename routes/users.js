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
        return res.status(500).json({ message: error.message });
      }
})

router.post("/nfc/generate-token", async (req, res) => {
    const { email, role, name } = req.body;

    if (!email | !name | !role) {
        return res.status(400).json({ message: 'Required attribut is missing : email | role | name' });
      }
    
    try {
        const findUser = await User.findOne({ email });
        if (findUser) {
          return res.status(400).json({ message: "Email user already exist ! " });
        }
        const userInfo = {
            name,
            email,
            role,
          }
        const nfcToken = jwt.sign(userInfo, sessionSecret, { expiresIn: '8h' });
        const newUser = new User(userInfo)
        const saveUser = await newUser.save();
        
        return res.status(200).json({ message: "SUCCESS", data : { nfcToken, user : saveUser }});
      } catch (error) {
        console.error("Error : ", error);
        return res.status(500).json({ message: error.message });
      }
})

module.exports = router;