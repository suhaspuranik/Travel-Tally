import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    destination: { type: String, required: true }, // Destination location
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, required: true },
    createdBy: { type: String, required: true },
    tripMates: [{ type: String, required: true }], // Participants in the trip
    itinerary: [
        {
            day: { type: String }, // Day of the trip (e.g., 'Monday, Feb 3, 2025')
            activities: [
                {
                    name: { type: String }, // Type of activity (e.g., 'Sightseeing', 'Dining')
                    description: { type: String }, // Detailed description of the activity
                    time: { type: String }, // Time of the activity (e.g., '10:00 AM')
                }
            ], 
        }
    ],
}, {
    timestamps: true,
    collection: "master_trip"
});

export default mongoose.model('Trip', tripSchema);
