const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/intern_portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

// Referral code generator
function generateReferralCode() {
    return 'REF' + Math.floor(1000 + Math.random() * 9000);
}

// Reward milestones
function checkRewards(donations) {
    let rewards = [];
    if (donations >= 5000) rewards.push("Badge 1");
    if (donations >= 10000) rewards.push("Badge 2");
    if (donations >= 20000) rewards.push("Badge 3");
    return rewards;
}

// LOGIN
app.post('/api/login', async (req, res) => {
    const { name } = req.body;
    const user = await User.findOne({ name });

    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false, message: "User not found!" });
    }
});

// SIGNUP
app.post('/api/signup', async (req, res) => {
    const { name } = req.body;
    let user = await User.findOne({ name });

    if (user) {
        return res.json({ success: false, message: "User already exists!" });
    }

    user = new User({
        name,
        referralCode: generateReferralCode(),
        donations: 0,
        rewards: []
    });

    await user.save();
    res.json({ success: true, user });
});

// DONATE
app.post('/api/donate', async (req, res) => {
    const { name, amount } = req.body;
    let user = await User.findOne({ name });

    if (!user) return res.json({ success: false, message: "User not found!" });

    user.donations += amount;
    user.rewards = checkRewards(user.donations);
    await user.save();

    res.json({ success: true, user });
});

// LEADERBOARD
app.get('/api/leaderboard', async (req, res) => {
    const users = await User.find().sort({ donations: -1 });
    res.json({ success: true, users });
});

// GET user by name (fixed endpoint)
app.get('/api/user/:name', async (req, res) => {
    console.log("Fetching user:", req.params.name);  

    const user = await User.findOne({ name: req.params.name });
    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false, message: "User not found!" });
    }
});

// DELETE user by name
app.delete('/api/user/:name', async (req, res) => {
    try {
        console.log(`Delete request for user: ${req.params.name}`);
        const result = await User.deleteOne({ name: new RegExp(`^${req.params.name}$`, 'i') });

        if (result.deletedCount > 0) {
            res.json({ success: true, message: "User deleted successfully" });
        } else {
            res.json({ success: false, message: "User not found!" });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
