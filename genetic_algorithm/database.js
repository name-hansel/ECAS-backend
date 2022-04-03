const mongoose = require("mongoose")

const connectToDatabase = async (threadId) => {
  try {
    const uri = process.env.MONGOURI || "";
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Database connected in thread ${threadId}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = connectToDatabase