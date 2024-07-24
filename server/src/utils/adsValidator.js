const CustomError = require('./customError');

const categoryList = ['recommend', 'donate', 'sell', 'work', 'courses', 'health', 'initiatives_projects', 'tours', 'games', 'arbitration'];
const requiredFields = ['adRegion', 'adSubregion', 'adTown', 'street', 'adId'];

module.exports = function adsValidator(body, path) {
  let errors = {};
  const { summary, category, description, images, tags } = body;

  if (path === '/ad-create') {
    requiredFields.forEach((fieldName) => {
      if (!body.hasOwnProperty(fieldName) || body[fieldName] === '' || body[fieldName] === null || body[fieldName] === undefined) {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });
  }

  if (Object.keys(errors).length > 0) {
    throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
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

  if (tags) {
    if (!Array.isArray(tags)) {
      errors.tags = 'Tags must be an array.';
    } else if (tags.length > 5) {
      errors.tags = 'Tags array must contain between 0 to 5 elements.';
    } else {
      tags.forEach((tag, index) => {
        if (typeof tag !== 'string' || tag.length > 16) {
          errors[`tags[${index}]`] = 'Each tag must be a string of max length 16.';
        }
      });
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
  }
};
