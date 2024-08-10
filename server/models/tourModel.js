const mongoose = require("mongoose");
const { Schema } = mongoose;

const tourSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    type: {
      type: String,
      enum: ["adventure", "leisure"],
      required: [true, "Type is required"],
    },
    itinerary: {
      type: String,
      required: [true, "Itinerary is required"],
    },
    availableSeats: {
      type: Number,
      required: [true, "Available seats are required"],
      min: [0, "Available seats cannot be negative"],
    },
    coverImage: {
      url: {
        type: String,
        required: [true, "Cover image URL is required"],
      },
      public_id: {
        type: String,
        required: [true, "Cover image public_id is required"],
      },
    },
    tourOwner:{
      type:Schema.Types.ObjectId,
      ref:"User",
      required:[true,"Tour owner ID is crquired to create new tour"]
    }
  },
  { timestamps: true }
);

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
