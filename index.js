const user = require("../model/user");
const User = require("../model/user")


const loginUsers = async (req,res) => {

    const { username, password, email, role} = req.body;

    const user = await User.exists({ username })

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = user.matchPassword(password);
    if(isMatch) {
        res.json({
            message: 'Login successful',
            roken: 'token',
        });
    }

}

module.exports = loginUsers;
