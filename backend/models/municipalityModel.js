import mongoose from "mongoose";

const municipalitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    deliveryFee: { type: Number, required: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const municipalityModel = mongoose.models.Municipality || mongoose.model('Municipality', municipalitySchema);
export default municipalityModel;
