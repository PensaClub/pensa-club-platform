function changeInfoFormat(input) {

    const newArray = [];
    let id = 1;

    input.forEach(
        function (value) {
            newArray.push({
                id,
                bg: value.Text.trim(),
                en: translateToEnglish(value.Text).trim()
            });
            id++;
        }
    );

    console.log(JSON.stringify(newArray));

}

function translateToEnglish(bulgarianString) {
    const bulgarianLetters = {
        "А": "A",
        "Б": "B",
        "В": "V",
        "Г": "G",
        "Д": "D",
        "Е": "E",
        "Ж": "ZH",
        "З": "Z",
        "И": "I",
        "Й": "Y",
        "К": "K",
        "Л": "L",
        "М": "M",
        "Н": "N",
        "О": "O",
        "П": "P",
        "Р": "R",
        "С": "S",
        "Т": "T",
        "У": "U",
        "Ф": "F",
        "Х": "H",
        "Ц": "Ts",
        "Ч": "Ch",
        "Ш": "Sh",
        "Щ": "Sht",
        "Ъ": "A",
        "Ь": "Y",
        "Ю": "Yu",
        "Я": "Ya",
        "а": "a",
        "б": "b",
        "в": "v",
        "г": "g",
        "д": "d",
        "е": "e",
        "ж": "zh",
        "з": "z",
        "и": "i",
        "й": "y",
        "к": "k",
        "л": "l",
        "м": "m",
        "н": "n",
        "о": "o",
        "п": "p",
        "р": "r",
        "с": "s",
        "т": "t",
        "у": "u",
        "ф": "f",
        "х": "h",
        "ц": "ts",
        "ч": "ch",
        "ш": "sh",
        "щ": "sht",
        "ъ": "a",
        "ь": "y",
        "ю": "yu",
        "я": "ya"
    };

    let englishString = "";
    for (let i = 0; i < bulgarianString.length; i++) {
        const char = bulgarianString[i];
        if (bulgarianLetters[char]) {
            englishString += bulgarianLetters[char];
        } else {
            englishString += char; // Keep the character unchanged if not found in mapping
        }
    }
    return englishString;
}

module.exports = changeInfoFormat;