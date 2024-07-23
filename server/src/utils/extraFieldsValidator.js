const CustomError = require('./customError');

const allowedExtraFields = ['price', 'eventStartDate', 'eventEndDate'];
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

module.exports = function validateExtraFields(fields) {
  const errors = {};

  let { price, eventStartDate, eventEndDate } = fields;

  Object.entries(fields).forEach(([fieldName, value]) => {
    if (!allowedExtraFields.includes(fieldName)) {
      errors.allowedExtraFields = 'Field must be one of the following: price, eventStartDate or eventEndDate.';
      return;
    }
  });

  if (Object.keys(errors).length > 0) {
    throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
  }

  if (price) {
    if (typeof price === 'string' || typeof price === 'number') {
      if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        errors.price = 'Price needs to be a valid number.';
      }
      price = parseFloat(price);
      if (Number(price) < 0) {
        errors.price = 'Price can not be negative.';
      }
      if (price.toString().length > 10) {
        errors.price = 'Price length should not exceed 10 characters.';
      }
    } else {
      errors.price = 'Price needs to be a valid number.';
    }
  }

  if (eventStartDate || eventEndDate) {
    if (!eventStartDate || !eventEndDate) {
      errors.date = 'Both eventStartDate and eventEndDate are required if one is provided.';
    } else {
      if (!dateRegex.test(eventStartDate) || !dateRegex.test(eventEndDate)) {
        errors.date = 'Date format must be YYYY-MM-DD.';
      } else {
        const startDate = new Date(eventStartDate);
        const endDate = new Date(eventEndDate);
        const currentDate = new Date();

        if (startDate < currentDate || endDate < currentDate) {
          errors.date = 'Dates can not be in the past.';
        }
        if (endDate < startDate) {
          errors.date = 'eventEndDate can not be earlier than eventStartDate.';
        }
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
  }
};
