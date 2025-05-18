export const loadAddressData = async (
  regionName,
  municipalityName,
  settlementName
) => {
    let regionId;
    let municipalityId;
    let settlementId;
    let regionEn;
    let municipalityEn;
    let settlementEn;

  try {
    const response = await fetch('/regions.json');
    const data = await response.json();
    const region = data.filter((region) => region.bg === regionName).shift();
    if (region) {
        regionId = region.id;
        regionEn = region.en;
    }
  } catch (error) {
    console.error('Failed to load regions data', error);
  }

  if (regionId && municipalityName) {
    try {
      const response = await fetch(
        `/regions-data/region-${regionId}/subregions-${regionId}.json`
      );
      const data = await response.json();
      const municipality = await data
        // eslint-disable-next-line eqeqeq
        .filter((municipality) => municipality.bg === municipalityName)
        .shift();
      if (municipality) {
        municipalityId = municipality.id;
        municipalityEn = municipality.en;
      }
    } catch (error) {
      console.error('Failed to load municipalities data', error);
    }
  }

  if (municipalityId && settlementName) {
    try {
      const response = await fetch(
        `/regions-data/region-${regionId}/towns/towns-${municipalityId}.json`
      );
      const data = await response.json();
      const settlement = await data
        // eslint-disable-next-line eqeqeq
        .filter((settlement) => settlement.bg === settlementName)
        .shift();
      if (settlement) {
        settlementId = settlement.id;
        settlementEn = settlement.en;
      }
    } catch (error) {
      console.error('Failed to load settlements data', error);
    }
  }

  return { regionId, municipalityId, settlementId, regionEn, municipalityEn, settlementEn };
};
