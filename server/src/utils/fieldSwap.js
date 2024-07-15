function fieldSwap(details, mappingType) {
  const data = {};

  const mapToDb = {
    phoneNumber: 'phone_number',
    username: 'username',
    region: 'region',
    municipality: 'municipality',
    settlement: 'settlement',
    workOptions: 'work_options',
    skills: 'skills',
    interestOptions: 'interest_options',
    district: 'district',
    block: 'block',
    street: 'street',
    streetNumber: 'street_number',
    location: 'location',
    firstName: 'first_name',
    lastName: 'last_name',
    gender: 'gender',
    birthDate: 'birth_date',
    imageURL: 'imageURL',
    firebaseImagePath: 'firebase_image_path',
    creationDate: 'creation_date',
    expirationDate: 'expiration_date',
    summary: 'summary',
    category: 'category',
    description: 'description',
    images: 'images',
    adId: 'ad_id',
    approved: 'approved',
    tags: 'tags',
    address: 'address',
    adRegion: 'ad_region',
    adSubregion: 'ad_subregion',
    adTown: 'ad_town',
    status: 'status',
    adminComment: 'admin_comment',
  };

  const mapFromDb = {
    phone_number: 'phoneNumber',
    username: 'username',
    region: 'region',
    municipality: 'municipality',
    settlement: 'settlement',
    work_options: 'workOptions',
    skills: 'skills',
    interest_options: 'interestOptions',
    district: 'district',
    block: 'block',
    street: 'street',
    street_number: 'streetNumber',
    location: 'location',
    first_name: 'firstName',
    last_name: 'lastName',
    gender: 'gender',
    birth_date: 'birthDate',
    imageURL: 'imageURL',
    firebase_image_path: 'firebaseImagePath',
    creation_date: 'creationDate',
    expiration_date: 'expirationDate',
    summary: 'summary',
    category: 'category',
    description: 'description',
    images: 'images',
    ad_id: 'adId',
    approved: 'approved',
    tags: 'tags',
    address: 'address',
    ad_region: 'adRegion',
    ad_subregion: 'adSubregion',
    ad_town: 'adTown',
    status: 'status',
    admin_comment: 'adminComment',
  };

  const fieldMapping = mappingType === 'mapToDb' ? mapToDb : mapFromDb;

  Object.keys(details).forEach((key) => {
    if (fieldMapping[key]) {
      data[fieldMapping[key]] = details[key];
    }
  });

  return data;
}

module.exports = fieldSwap;
