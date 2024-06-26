import { useState } from 'react';

export const loadAddressData = async (
  regionName,
  municipalityName,
  settlementName
) => {
    let regionId;
    let municipalityId;
    let settlementId;

  try {
    const response = await fetch('/regions.json');
    const data = await response.json();
    const region = data.filter((region) => region.bg == regionName).shift();
    if (region) {
        regionId = region.id;
    }
  } catch (error) {
    console.error('Failed to load regions data', error);
  }

  try {
    if (regionId) {
      const response = await fetch(
        `/regions-data/region-${regionId}/subregions-${regionId}.json`
      );
      const data = await response.json();
      const municipality = await data
        .filter((municipality) => municipality.bg == municipalityName)
        .shift();
        municipalityId = municipality.id;
    } else {
      console.log('No regionId');
    }
  } catch (error) {
    console.error('Failed to load municipalities data', error);
  }

  try {
    if (municipalityId) {
      const response = await fetch(
        `/regions-data/region-${regionId}/towns/towns-${municipalityId}.json`
      );
      const data = await response.json();
      const settlement = await data
        .filter((settlement) => settlement.bg == settlementName)
        .shift();
        settlementId = settlement.id;
    } else {
      console.log('No municipalityId');
    }
  } catch (error) {
    console.error('Failed to load settlements data', error);
  }

  return { regionId, municipalityId, settlementId };
};
