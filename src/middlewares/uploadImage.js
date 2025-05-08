const multer = require('multer');
const sharp = require('sharp');
const { v2: cloudinary } = require('cloudinary');
const ApiError = require('../../utils/apiError');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError('Only images are allowed', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadSingleImage = (fieldName) => upload.single(fieldName);

exports.resizeImage = (type) => async (req, res, next) => {
  if (!req.file) {
    console.log('No file received in resizeImage middleware');
    return next();
  }

  try {
    let dimensions;
    if (type === 'profile') {
      dimensions = { width: 150, height: 150 };
    } else if (type === 'cover') {
      dimensions = { width: 1200, height: 400 };
    } else if (type === 'post') {
      dimensions = { width: 800, height: 600 };
    } else {
      return next(new ApiError('Invalid image type', 400));
    }

    const metadata = await sharp(req.file.buffer).metadata();
    console.log('Processing image:', {
      type,
      originalSize: req.file.size,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
      originalDimensions: `${metadata.width}x${metadata.height}`,
    });

    const buffer = await sharp(req.file.buffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        withoutEnlargement: true,
      })
      .toFormat('jpeg')
      .jpeg({ quality: 60 })
      .toBuffer();

    console.log('Image processed, buffer size:', buffer.length, 'bytes');

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `SocialAppProject/${type}`,
        resource_type: 'image',
        timeout: 60000,
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary Upload Error:', error || 'No result received');
          req.file.uploadFailed = true;
          return next();
        }

        req.file.filename = result.public_id;
        req.file.url = result.secure_url;
        console.log(`Image uploaded to Cloudinary (${type}):`, {
          public_id: result.public_id,
          url: result.secure_url,
        });

        next();
      }
    );

    uploadStream.end(buffer);
  } catch (error) {
    console.error('Image processing error:', error);
    next(new ApiError(`Failed to process image: ${error.message}`, 500));
  }
};
