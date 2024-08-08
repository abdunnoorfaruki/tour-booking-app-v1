const Tour = require("../models/tourModel");
const factory = require("./handlerFactory");

exports.createTour = factory.createOne(Tour);
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.delteTour = factory.deleteOne(Tour);
