const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

/**
 * Create a new document in the database.
 * @param {Object} Model - Mongoose model to create the document.
 * @returns {Function} - Express middleware function.
 */
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

/**
 * Get a single document from the database by ID.
 * @param {Object} Model - Mongoose model to query.
 * @param {Object} [populateOptions] - Mongoose populate options.
 * @returns {Function} - Express middleware function.
 */
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) return next(new AppError("No document found with the ID", 404));

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

/**
 * Get all documents from the database.
 * @param {Object} Model - Mongoose model to query.
 * @returns {Function} - Express middleware function.
 */
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.user.role !== "admin") filter = { user: req.user._id };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

/**
 * Update a document in the database by ID.
 * @param {Object} Model - Mongoose model to query.
 * @returns {Function} - Express middleware function.
 */
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError("No document found with the ID", 404));

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

/**
 * Delete a document from the database by ID.
 * @param {Object} Model - Mongoose model to query.
 * @returns {Function} - Express middleware function.
 */
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError("No document found with the ID", 404));

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
