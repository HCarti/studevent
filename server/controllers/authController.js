  const User = require('../models/User');
  // const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');

  const login = async (req, res) => {
    const { email, password } = req.body;
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Check if JWT_SECRET is accessible

    try {
      const user = await User.findOne({ email: email });
      console.log(user)
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      if (password == user.password) {
        res.status(200).json({ data: user, success: true, loginStatus: "success" })
      } else {
        res.status(404).json({ success: false, loginStatus: "failed" })

      }

      // const isMatch = await bcrypt.compare(password, user.password);
      // if (!isMatch) {
      //   return res.status(401).json({ message: 'Invalid email or password.' });
      // }

      // const token = jwt.sign({ userId: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

      // res.status(200).json({ token, user: { email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } });
      // res.status(200).json(user)
    } catch (error) {
      res.status(500).json({ message: 'Error logging in' });
    }
  };

  module.exports = { login };