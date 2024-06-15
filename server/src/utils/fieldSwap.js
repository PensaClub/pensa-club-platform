function fieldSwap(details, mappingType) {
  const data = {};

  const mapToDb = {
    phoneNumber: "phone_number",
    username: "username",
    region: "region",
    municipality: "municipality",
    settlement: "settlement",
    workOptions: "work_options",
    skills: "skills",
    interestOptions: "interest_options",
    district: "district",
    block: "block",
    street: "street",
    streetNumber: "street_number",
    location: "location",
    firstName: "first_name",
    lastName: "last_name",
    gender: "gender",
    birthDate: "birth_date",
  };

  const mapFromDb = {
    phone_number: "phoneNumber",
    username: "username",
    region: "region",
    municipality: "municipality",
    settlement: "settlement",
    work_options: "workOptions",
    skills: "skills",
    interest_options: "interestOptions",
    district: "district",
    block: "block",
    street: "street",
    street_number: "streetNumber",
    location: "location",
    first_name: "firstName",
    last_name: "lastName",
    gender: "gender",
    birth_date: "birthDate",
  };

  const fieldMapping = mappingType === "mapToDb" ? mapToDb : mapFromDb;

  Object.keys(details).forEach((key) => {
    if (fieldMapping[key]) {
      data[fieldMapping[key]] = details[key];
    }
  });

  return data;
}

module.exports = fieldSwap;
