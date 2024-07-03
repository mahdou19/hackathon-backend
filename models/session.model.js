const mongoose = require("mongoose");

const SessionItemSchema = new mongoose.Schema(
    {
      sessionToken: { type: String, required: true },
      code: { type: Number, required: true },
      date: { type: Date, default: Date.now } 
    }
  );
  
  const SessionSchema = new mongoose.Schema(
    {
      identity: { type: String, required: true, unique: true },
      session: { type: [SessionItemSchema], required: true },
    },
    { timestamps: true }
  );
module.exports = mongoose.model("Session", SessionSchema);