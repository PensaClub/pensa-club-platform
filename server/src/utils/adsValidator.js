const CustomError = require('./customError');

const notRequiredFields = ['adAddress', 'images'];
const categoryList = ['Donation', 'Sale', 'Service', 'Entertainment', 'Training', 'Event'];

module.exports = function adsValidator(body) {
  let errors = {};
  const { summary, category, description, adTown, adAddress, images } = body;

  Object.entries(body).forEach(([fieldName, value]) => {
    if (value === '' && !notRequiredFields.includes(fieldName)) {
      let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      errors[fieldName] = `${error} is required.`;
    }
  });

  if (Object.keys(errors).length > 0) {
    throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
  }

  if (summary.length < 4 || summary.length > 32) {
    errors.summary = 'Summary must be between 4 and 32 characters.';
  }

  if (!categoryList.includes(category)) {
    errors.category = 'Category must be one of the following: Donation, Sale, Service, Entertainment, Training, or Event.';
  }

  if (description.length < 10) {
    errors.description = 'Description must be at least 10 characters long.';
  } else if (description.length > 1000) {
    errors.description = 'Maximum description length limit of 1000 characters is reached.';
  }

  // if (!Array.isArray(images)) {
  //   errors.images = 'Images must be an array.';
  // } else {
  //   if (images.length > 5) {
  //     errors.images = 'Cannot have more than 5 images per ad.';
  //   }
  //   if (images.length <= 0) {
  //     errors.images = 'Each ad should contain at least 1 image.';
  //   }
  //   images.forEach((image, index) => {
  //     if (!image.imageURL || !image.firebaseImagePath) {
  //       errors[`images[${index}]`] = 'Each image must have a URL and a path.';
  //     }
  //   });
  // }

  if (Object.keys(errors).length > 0) {
    throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
  }
};
