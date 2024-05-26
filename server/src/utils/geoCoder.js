const nominatimURL = "https://nominatim.openstreetmap.org/search";
const CustomError = require("./customError");

module.exports = async function geoCoder(data) {
  try {
    const params = filterEmptyValues(data);
    const info = {
      street: `${params.streetNumber} ${params.street}`,
      ...Object.fromEntries(Object.entries(params).filter(([key]) => key !== "streetNumber" && key !== "street")),
    };

    const address = `${info.street}${info.district ? `, ${info.district}` : ""}, ${info.settlement}, ${info.municipality}, ${info.region}, Bulgaria`;

    const urlParams = new URLSearchParams({
      q: address,
      format: "json",
      limit: 1,
    });
    const response = await fetch(`${nominatimURL}?${urlParams.toString()}`);

    if (!response.ok) {
      throw new CustomError({ message: `Nominatim API Error: ${response.statusText}`, statusCode: response.status });
    }

    const newData = await response.json();
    console.log(await newData);
    return newData;
  } catch (err) {
    throw new CustomError({ message: "Can not get lat/lon", statusCode: 500 });
  }
};

function filterEmptyValues(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}
