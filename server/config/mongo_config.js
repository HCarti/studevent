const mongoose = require('mongoose');
 
// mongoose.connect('mongodb+srv://nucasajerick:5sAb73lTrLX0c6Fy@cluster0.khsbida.mongodb.net/comexconnect', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })

mongoose.connect('mongodb://localhost:27017/Studevent', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB: ', err));