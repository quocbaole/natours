const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
// !3 dòng dưới dùng nếu lấy data từ local
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// !cách viết middleware check id
// exports.checkID = (req, res, next, val) => {
//     console.log(`id is ${val}`);
//     if (val > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'invalid ID',
//         });
//     }
//     next();
// };

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price)
//         return res.status(400).json({
//             status: 'fail',
//             massage: 'Missing name or price! 💣',
//         });
//     next();
// };
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};


exports.getAllTours = factory.getAll(Tour)
exports.getOneTour = factory.getOne(Tour, { path: 'reviews' })
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)

exports.getTourStats = catchAsync(async (req, res, next) => {

  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },


    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    result: stats.length,
    data: { stats },
  });

})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    requests: plan.length,
    data: { plan },
  });

})
// 11.939364, 108.425900

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng) return next(new AppError('Please provide latitutr and longitude in the format lat,lng', 400))

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
  const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } })
  console.log(distance, lat, lng)

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  })
})

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001

  if (!lat || !lng) return next(new AppError('Please provide latitutr and longitude in the format lat,lng', 400))

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    }, {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ])
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  })
})