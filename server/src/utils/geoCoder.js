const nominatimURL = "https://nominatim.openstreetmap.org/search";
// region, municipality, settlement, district, block, street, streetNumber
module.exports = async function geoCoder(data) {
  try {
    // const params = {
    //   street: `${data.streetNumber} ${data.street}`,
    //   city: data.settlement,
    //   county: data.municipality,
    //   state: data.region,
    //   suburb: data.district,
    //   country: "bulgaria",
    //   countrycodes: "bg",
    //   format: "json",
    // };
    const params = filterEmptyValues(data);

    const address = `${params.streetNumber} ${params.street}, ${params.district}, ${params.settlement}, ${params.municipality}, ${params.region}, 'Bulgaria'`;

    const urlParams = new URLSearchParams({
      q: address,
      format: "json",
    });
    const newData = await fetch(`${nominatimURL}?${urlParams.toString()}`);
    console.log(`${nominatimURL}?${urlParams.toString()}`);
    return newData.json();
  } catch (err) {
    console.log(err);
  }
};

function filterEmptyValues(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== null));
}
