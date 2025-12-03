// utils/addressSearch.js

/**
 * Нормализира текст за търсене - премахва съкращения и специални символи
 */
export const normalizeAddressText = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    let normalized = text.toLowerCase().trim();
    
    // Премахване на съкращения за улица
    normalized = normalized
        .replace(/\bул\.\s*/gi, '')
        .replace(/\bул\s+/gi, '')
        .replace(/\bулица\s*/gi, '')
        .replace(/\bулица$/gi, '');
    
    // Премахване на съкращения за булевард
    normalized = normalized
        .replace(/\bбул\.\s*/gi, '')
        .replace(/\bбул\s+/gi, '')
        .replace(/\bбулевард\s*/gi, '')
        .replace(/\bбулевард$/gi, '');
    
    // Премахване на съкращения за квартал
    normalized = normalized
        .replace(/\bкв\.\s*/gi, '')
        .replace(/\bкв\s+/gi, '')
        .replace(/\bквартал\s*/gi, '')
        .replace(/\bквартал$/gi, '');
    
    // Премахване на съкращения за район
    normalized = normalized
        .replace(/\bр-н\.\s*/gi, '')
        .replace(/\bр-н\s*/gi, '')
        .replace(/\bрайон\s*/gi, '')
        .replace(/\bрайон$/gi, '');
    
    // Премахване на съкращения за област
    normalized = normalized
        .replace(/\bобл\.\s*/gi, '')
        .replace(/\bобл\s+/gi, '')
        .replace(/\bобласт\s*/gi, '')
        .replace(/\bобласт$/gi, '');
    
    // Премахване на съкращения за град
    normalized = normalized
        .replace(/\bгр\.\s*/gi, '')
        .replace(/\bгр\s+/gi, '')
        .replace(/\bград\s*/gi, '');
    
    // Премахване на съкращения за село
    normalized = normalized
        .replace(/\bс\.\s*/gi, '')
        .replace(/\bсело\s*/gi, '');
    
    // Премахване на съкращения за жилищен комплекс
    normalized = normalized
        .replace(/\bж\.к\.\s*/gi, '')
        .replace(/\bж\.к\s*/gi, '')
        .replace(/\bжк\.\s*/gi, '')
        .replace(/\bжк\s+/gi, '')
        .replace(/\bжилищен комплекс\s*/gi, '');
    
    // Премахване на съкращения за площад
    normalized = normalized
        .replace(/\bпл\.\s*/gi, '')
        .replace(/\bпл\s+/gi, '')
        .replace(/\bплощад\s*/gi, '');
    
    // Премахване на множество интервали
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    return normalized;
};

/**
 * Проверява дали има съвпадение между търсения текст и адресните данни на клуба
 */
export const matchesAddressSearch = (club, searchTerm) => {
    if (!searchTerm || !club) return true;
    
    const normalizedSearch = normalizeAddressText(searchTerm);
    if (!normalizedSearch) return true;
    
    // Събираме всички адресни полета от клуба
    const addressFields = [];
    
    // 1. От contacts.address
    if (club.contacts?.address) {
        const { street, city, postalCode, poBox } = club.contacts.address;
        if (street) addressFields.push(street);
        if (city) addressFields.push(city);
        if (postalCode) addressFields.push(postalCode);
        if (poBox) addressFields.push(poBox);
    }
    
    // 2. От location
    if (club.location) {
        const { address, city, municipality, region, postalCode } = club.location;
        if (address) addressFields.push(address);
        if (city) addressFields.push(city);
        if (municipality) addressFields.push(municipality);
        if (region) addressFields.push(region);
        if (postalCode) addressFields.push(postalCode);
    }
    
    // 3. От regionalInfo
    if (club.regionalInfo) {
        const { coverageArea } = club.regionalInfo;
        if (coverageArea) addressFields.push(coverageArea);
    }
    
    // Нормализираме всички полета и търсим съвпадение
    const normalizedFields = addressFields.map(field => normalizeAddressText(field));
    
    // Разделяме търсенето на думи за по-гъвкаво търсене
    const searchWords = normalizedSearch.split(' ').filter(word => word.length > 0);
    
    // Проверяваме дали ВСИЧКИ думи от търсенето се намират в някое от полетата
    return searchWords.every(searchWord => 
        normalizedFields.some(field => field.includes(searchWord))
    );
};

/**
 * Проверява за съвпадение по пощенски код
 */
export const matchesPostalCode = (club, postalCode) => {
    if (!postalCode || !club) return true;
    
    const searchCode = postalCode.trim();
    if (!searchCode) return true;
    
    // Проверяваме в contacts.address
    if (club.contacts?.address?.postalCode?.includes(searchCode)) {
        return true;
    }
    
    // Проверяваме в location
    if (club.location?.postalCode?.includes(searchCode)) {
        return true;
    }
    
    return false;
};