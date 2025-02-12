import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    profilePic_url: { type: String },
    auth_provider: { type: String, enum: ['Google', 'Email'] },
    resetToken: { type: String },
    resetTokenExpiration: { type: Date },
    trips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
    friends: [{ type: String }],
}, {
    timestamps: true,  // Automatically manages createdAt and updatedAt fields
    collection: 'master_user'  // Custom collection name
});

export default mongoose.model('User', userSchema); // Creating the model
