const CustomError = require('./customError');

const notRequiredFields = ['adAddress'];
const categoryList = ['recommend', 'donate', 'sell', 'work', 'courses', 'health', 'initiatives_projects', 'tours', 'games', 'arbitration'];

module.exports = function adsValidator(body, path) {
  let errors = {};
  const { summary, category, description, images, adId } = body;

  if (path === '/ad-create') {
    Object.entries(body).forEach(([fieldName, value]) => {
      if ((value === '' || value === null) && !notRequiredFields.includes(fieldName)) {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });
  }

  if (Object.keys(errors).length > 0) {
    throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
  }

  if (!adId) {
    errors.adId = 'Ad id is required!';
  }

  if (summary && (summary.length < 4 || summary.length > 32)) {
    errors.summary = 'Summary must be between 4 and 32 characters.';
  }

  if (category && !categoryList.includes(category)) {
    errors.category =
      'Category must be one of the following: recommend, donate, sell, work, courses, health, initiatives_projects, tours, games or arbitration.';
  }

  if (description && description.length < 10) {
    errors.description = 'Description must be at least 10 characters long.';
  } else if (description && description.length > 1000) {
    errors.description = 'Maximum description length limit of 1000 characters is reached.';
  }

  if (images) {
    if (!Array.isArray(images)) {
      errors.images = 'Images must be an array.';
    } else {
      if (images.length > 4) {
        errors.images = 'Cannot have more than 4 images per ad.';
      } else if (images.length === 0) {
        errors.images = 'Each ad should contain at least 1 image.';
      } else {
        images.forEach((image, index) => {
          if (!image.imageURL || !image.firebaseImagePath) {
            errors[`images[${index}]`] = 'Each image must have a URL and a path.';
          }
        });
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
  }
};
