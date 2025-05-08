const mongoose = require('mongoose');
const dotenv = require('dotenv');
mongoose.set('strictQuery', true);
dotenv.config({ path: '.env' });
// mongoose.set('strictQuery', false);
const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then((conn) => {
      // console.log(`Database Connected: ${conn.connection.host}`);
      console.log(`Database Connected: Succesfully`);
    })
  // .catch((err) => {
  //   console.error(`Database Error: ${err}`);
  //   process.exit(1);
  // });
};

module.exports = dbConnection;
