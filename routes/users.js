const router = require("express").Router();
const User = require("../models/user.model");
const Session = require("../models/session.model");
const jwt = require("jsonwebtoken");
const { getIdentify } = require("../utils/utils");


const sessionSecret = process.env.SECRET_KEY;
const nfcSecret = process.env.NFC_SECRET_KEY;

router.post("/user/auth", async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
    
    try {
        const payload = jwt.verify(token, nfcSecret);
        const { email, name } = payload
        const findUser = await User.findOne({ email });
        if (!findUser) {
          return res.status(400).json({ message: 'User does not exist in the database' });
        }

        const sessionToken = jwt.sign({ userId: payload.userId, role: payload.role }, sessionSecret, { expiresIn: '1h' });
        
       const identity = await getIdentify(name)
       const code = Math.floor(10 + Math.random() * 90)

       const newSession = {
        sessionToken: sessionToken,
        code,
        date: new Date()
      };

      let sessionDocument = await Session.findOne({ identity });
      if (sessionDocument) {
        sessionDocument.session.push(newSession);
      } else {
        sessionDocument = new Session({
          identity: identity,
          session: [newSession]
        });
      }
      await sessionDocument.save();

        return res.status(200).json({ message: "SUCCESS", data : {sessionToken, code }});
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
})

router.get('/auth/verify-session', (req, res) => {
    const authHeader = req.headers['authorization'];
  
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is required' });
    }
  
    const token = authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }
  
    try {
      const payload = jwt.verify(token, sessionSecret);

      return res.status(200).json({ valid: true, user: payload });
    } catch (error) {
      return res.status(401).json({ valid: false, message: 'Invalid token' });
    }
  });

  
router.post("/nfc/generate-token", async (req, res) => {
    const { email, role, firstName, lastName } = req.body;

    if (!email | !firstName | !lastName  | !role) {
        return res.status(400).json({ message: 'Required attribut is missing : email | role | firstName | lastName' });
      }
    
    try {
        const findUser = await User.findOne({ email });
        if (findUser) {
          return res.status(400).json({ message: "Email user already exist ! " });
        }
        const userInfo = {
            name: `${firstName} ${lastName}`,
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