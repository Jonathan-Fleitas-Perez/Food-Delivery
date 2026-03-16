import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'La imagen de la oferta es obligatoria']
  },
  active: {
    type: Boolean,
    default: true
  },
  date: {
    type: Number,
    default: Date.now
  }
}, {
  versionKey: false
});

const offerModel = mongoose.models.offer || mongoose.model('offer', offerSchema);
export default offerModel;
