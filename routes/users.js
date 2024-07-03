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

        const userId = findUser.id  
        
        const sessionToken = jwt.sign({ userId, role: payload.role }, sessionSecret, { expiresIn: '1h' });
        
       const identity = await getIdentify(name)
       const code = Math.floor(10 + Math.random() * 90)

       const newSession = {
        sessionToken,
        code,
        date: new Date()
      };
      

      let sessionDocument = await Session.findOne({ identity });
      if (sessionDocument) {
        sessionDocument.session.push(newSession);
      } else {
        sessionDocument = new Session({
          userId,
          identity: identity,
          session: [newSession]
        });
      }
      await sessionDocument.save();

        return res.status(200).json({ message: "SUCCESS", data : { code, sessionToken }});
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
})

router.get('/auth/verify-identity', async (req, res) => {
    const { identity } = req.headers
  
    if (!identity) {
      return res.status(401).json({ message: 'Identity is required' });
    }
  
    try {
      let sessionDocument = await Session.findOne({ identity });
      if(!sessionDocument) {
        return res.status(401).json({ message: "Identity doesn't have a session. Please verify your identity or reconnect to scan to badge!" });
      }
      
      const { session } = sessionDocument
      const lastSession = session[session.length - 1];

     const payload = jwt.verify(lastSession.sessionToken, sessionSecret);
     if(!payload) {
      return res.status(401).json({ message: 'Invalid token' });
     }

     const identityToken = jwt.sign({ identity }, sessionSecret, { expiresIn: '5m' });

      return res.status(200).json({ identityToken  });
    } catch (error) {
      return res.status(401).json({ valid: false, message: 'Invalid token' });
    }
  });

  router.post('/auth/verify-code', async (req, res) => {
  
    const authorization = req.headers['authorization']

  
    const { code } = req.body
    if (!code | !authorization) {
      return res.status(401).json({ message: 'Code | authorization is required' });
    }
  const identityToken = authorization.split(" ")[1]

    try {
     const payload = jwt.verify(identityToken, sessionSecret);
     const { identity } = payload
     let sessionDocument = await Session.findOne({ identity });
   
      if(!sessionDocument) {
        return res.status(401).json({ message: "Identity doesn't have a session. Please verify your identity or reconnect to scan to badge!" });
      }
      const { session } = sessionDocument
      const lastSession = session[session.length - 1]
  
      if(code !== lastSession.code ) {
        const newCode = Math.floor(10 + Math.random() * 90);
        lastSession.code = newCode;
        lastSession.date = new Date(); 
       
        await sessionDocument.save();
        return res.status(401).json({ message: "code not correct !" });
      }

      const userData = await User.findById(sessionDocument.userId);

      return res.status(200).json({ message: 'User successfull connected', data : {
        sessionToken: lastSession.sessionToken,
        name: userData.name,
        role: userData.role
      }  });
    } catch (error) {
      console.error("Error : ", error);
      return res.status(401).json({ message: error.message });
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
        const nfcToken = jwt.sign(userInfo, sessionSecret, { expiresIn: '72h' });
        const newUser = new User(userInfo)
        const saveUser = await newUser.save();
        
        return res.status(200).json({ message: "SUCCESS", data : { nfcToken, user : saveUser }});
      } catch (error) {
        console.error("Error : ", error);
        return res.status(500).json({ message: error.message });
      }
})

module.exports = router;