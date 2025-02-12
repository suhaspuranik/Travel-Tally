import mongoose from 'mongoose';

const expenseShareSchema = new mongoose.Schema({
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true }, // Links to the trip
    payer: { type: String, required: true },  // The person who paid
    payee: { type: String, required: true },  // The person who owes
    share: { type: Number, required: true }   // Amount the payee owes
}, {
    timestamps: true,
    collection: "expense_shares"
});

export default mongoose.model('ExpenseShare', expenseShareSchema);
