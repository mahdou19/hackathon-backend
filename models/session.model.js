const mongoose = require("mongoose");

const SessionItemSchema = new mongoose.Schema(
    {
      sessionId: { type: String, required: true, unique: true },
      sessionToken: { type: String, required: true },
      code: { type: Number, required: true },
      date: { type: Date, default: Date.now } 
    }
  );
  
  const SessionSchema = new mongoose.Schema(
    {
      userId:{ type: String, required: true, unique: true },
      identity: { type: String, required: true, unique: true },
      session: { type: [SessionItemSchema], required: true },
    },
    { timestamps: true }
  );
module.exports = mongoose.model("Session", SessionSchema);