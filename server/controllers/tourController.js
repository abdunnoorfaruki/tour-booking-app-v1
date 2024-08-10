const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.createTour = catchAsync(async (req, res, next) => {

 const payload = {...req.body, tourOwner:req.user._id}
  const newTour = await Tour.create(payload);
  if (!newTour)
    return next(
      new AppError(
        "Wr are not able to create new tour, please try again later",
        500
      )
    );

  res.status(201).json({
    status: "success",
    data:{
        data:newTour
    }
  });
});
exports.updateTour = catchAsync(async (req, res, next) =>{

    const tour = await Tour.findById(req.params.id)
    if(!tour) return next(new AppError("No tour round wiht thsi ID", 404))
    
    if(req.user._id.toString() !== tour.tourOwner.toString()) return next(new AppError("You don't have permission to update other user's tour details", 401))
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body,{new:true})

    res.status(200).json({
        status:"success",
        data:{
            data:updatedTour
        }
    })
});
exports.delteTour = catchAsync(async (req, res, next) =>{
    const tour = await Tour.findById(req.params.id)
    if(!tour) return next(new AppError("No tour round wiht thsi ID", 404))
    
    if(req.user._id.toString() !== tour.tourOwner.toString()) return next(new AppError("You don't have permission to delete other user's tour", 401))

    await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
        status:"success", 
        data:null
    })
});
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour);
