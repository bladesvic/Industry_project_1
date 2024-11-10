const User = require('../models/User');

async function ensureNoUserExists() {
  // Check if a placeholder user named "No user" exists
  let noUser = await User.findOne({ name: "No user" });
  
  if (!noUser) {
    // Create the "No user" placeholder if it doesn’t exist
    noUser = new User({
      name: "No user",
      email: "no_user@example.com",
      passwordHash: "", // Leave this blank or generate a random string
      role: "user",
    });
    await noUser.save();
  }

  return noUser;
}

module.exports = { ensureNoUserExists };
