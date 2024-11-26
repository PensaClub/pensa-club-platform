const CustomError = require("./customError");

const key = process.env.TOMTOM_API_KEY;

const address = {
  baseURL: "https://api.tomtom.com",
  versionNumber: 2,
  endPoint: "structuredGeocode",
  ext: "json",
};

const url = `${address.baseURL}/search/${address.versionNumber}/${address.endPoint}.${address.ext}`;

function filterEmptyValues(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

const errorMessage = {
  400: "One or more parameters were incorrectly specified.",
  403: "Possible causes include - Service requires SSL, Not authorized, Rate or volume limit exceeded, Unknown referer",
  404: "The HTTP request method (GET, POST, etc.) or path is incorrect.",
  596: "The HTTP request method (GET, POST, etc.) or path is incorrect.",
  429: "The API Key is over QPS (Queries per second).",
  "5xx": "The service was unable to process your request. Contact support to resolve the issue.",
};

module.exports = async function geoCoder(data) {
  try {
    // const filteredData = filterEmptyValues({
    //   streetNumber: data.streetNumber,
    //   streetName: data.street,
    //   municipality: data.municipality,
    //   countrySubdivision: data.region,
    //   countryTertiarySubdivision: data.settlement,
    //   CountrySecondarySubdivision: data.district,
    // });

    const queryParams = new URLSearchParams({
      key,
      countryCode: "BG"
      // ...filteredData,
    }).toString();

    const response = await fetch(`${url}?${queryParams}`);

    if (!response.ok) {
      throw new CustomError({ message: `API Error: ${response.statusText} - ${errorMessage[response.status]}`, statusCode: response.status });
    }

    const newData = await response.json();

    if (newData.results.length == 0) {
      throw new CustomError({ message: `No such address was found!`, statusCode: response.status });
    }

    return {
      lat: newData.results[0].position.lat,
      lon: newData.results[0].position.lon,
    };
  } catch (err) {
    throw err;
  }
};
