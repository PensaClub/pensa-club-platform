module.exports = function ageCalculate(birth_date) {
  let age = new Date().getFullYear() - new Date(birth_date).getFullYear();
  const monthDiff = new Date().getMonth() - new Date(birth_date).getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && new Date().getDate() < new Date(birth_date).getDate())) {
    age--;
  }

  return age;
};
