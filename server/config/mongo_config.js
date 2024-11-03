const mongoose = require('mongoose');
 
// mongoose.connect('mongodb+srv://nucasajerick:5sAb73lTrLX0c6Fy@cluster0.khsbida.mongodb.net/comexconnect', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("Connected to MongoDB");
  }).catch((error) => {
    console.error("MongoDB connection error:", error);
  });
  