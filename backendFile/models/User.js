const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    referralCode: { type: String, required: true, unique: true },
    donations: { type: Number, default: 0 },
    rewards: { type: [String], default: [] }
});

// Generate referral code before saving
userSchema.pre('save', function (next) {
    if (!this.referralCode) {
        this.referralCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
