const asyncHandler = require('express-async-handler');
const ApiError = require('../../utils/apiError');
const ApiFeatures = require('../../utils/apiFeatures');

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    document.remove();
    res.status(204).send();
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model, bodyData) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(bodyData);
    req.document = newDoc;
    // res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // 1) Build query
    let query = Model.findById(id);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    // 2) Execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    req.documents = document;

    // res.status(200).json({ data: document });
  });

// exports.getAll = (Model, modelName = '') =>
//   asyncHandler(async (req, res) => {
//     // console.log("modelName:", modelName)

//     let filter = {};
//     if (req.filterObj) {
//       filter = req.filterObj;
//       // console.log("req.filterObj :", req.filterObj);

//     }
//     // console.log("filter:", filter);
//     // Build query
//     const documentsCounts = await Model.countDocuments();
//     const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
//       .paginate(documentsCounts)
//       .filter()
//       .search(modelName)
//       .limitFields()
//       .sort();

//     // Execute query
//     const { mongooseQuery, paginationResult } = apiFeatures;
//     const documents = await mongooseQuery;
//     // Attach data to the req object
//     req.documents = documents;
//     req.paginationResult = paginationResult;

//     // res
//     //   .status(200)
//     //   .json({ results: documents.length, paginationResult, data: documents });
//   });


exports.getAll = (Model, modelName = '', populateOptions = null) =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    // Build query
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .populate(populateOptions)
      .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    req.documents = documents;
    req.paginationResult = paginationResult;

    // Response
    // res.status(200).json({
    //   status: "success",
    //   results: documents.length,
    //   paginationResult,
    //   data: documents,
    // });
  });