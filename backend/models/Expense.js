import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    category: { 
        type: String, 
        enum: ['Food', 'Transport', 'Lodging', 'Entry Fee', 'Health', 'Shopping', 'Tips & Donations', 'Other'], 
        required: true 
    },
    description: { type: String },
    payer: { type: String, required: true }, // Email or ID of the payer
    sharedType: { 
        type: String, 
        enum: ['equally', 'unequally'], 
        required: true 
    },
    sharedAmong: { 
        type: [String], // Array of emails or IDs of the trip mates involved in the split
        default: [] 
    },
   
}, {
    timestamps: true,
    collection: "expenses"
});

export default mongoose.model('Expense', expenseSchema);