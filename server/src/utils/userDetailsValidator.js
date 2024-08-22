const usernameRegex = /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я0-9_-]{6,16}$/;
const phoneRegex = /^(?:\+\d{7,15}|\d{10})$/;
const nameRegex = /^[a-zA-Zа-яА-Я0-9_]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const notRequiredFields = ['block', 'streetNumber', 'firstName', 'lastName', 'district', 'workOptions', 'gender', 'birthDate', 'phoneNumber'];
const CustomError = require('./customError');

function userDetailsValidator(body, path) {
  let errors = {};

  Object.keys(body).forEach((key) => {
    if (body[key] === '') {
      body[key] = null;
    }
  });

  const { phoneNumber, username, firstName, lastName, gender, birthDate } = body;

  if (path === '/details') {
    Object.entries(body).forEach(([fieldName, value]) => {
      if (value === '' && !notRequiredFields.includes(fieldName)) {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });
  }

  ['workOptions', 'skills', 'interestOptions'].forEach((field) => {
    if (body[field] !== undefined && !Array.isArray(body[field])) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be an array.`;
    }
  });

  if (Object.keys(errors).length > 0) {
    throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
  }

  if (phoneNumber && !phoneRegex.test(phoneNumber)) {
    errors.phoneNumber = 'Invalid phone number.';
  }

  if (username && !usernameRegex.test(username)) {
    errors.username = 'Username must be 6-16 chars, using letters, numbers, or underscores, and include both Cyrillic or Latin alphabets.';
  }

  if (firstName && !nameRegex.test(firstName)) {
    errors.firstName = 'First name must be 3-20 chars, using letters, numbers, or underscores, and include both Cyrillic or Latin alphabets.';
  }

  if (lastName && !nameRegex.test(lastName)) {
    errors.lastName = 'Last name must be 3-20 chars, using letters, numbers, or underscores, and include both Cyrillic or Latin alphabets.';
  }

  if (gender && gender !== 'male' && gender !== 'female' && gender !== 'other') {
    errors.gender = "Gender must be 'male', 'female', or 'other'.";
  }

  if (birthDate && !dateRegex.test(birthDate) && new Date(birthDate) > new Date() && isNaN(new Date(birthDate).getTime())) {
    errors.birthDate = 'Date format must be YYYY-MM-DD and cannot be in the future.';
  }

  if (Object.keys(errors).length > 0) {
    throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
  }
}

module.exports = userDetailsValidator;
