const changeInfoFormat = require('./changeInfoFormat');

const input = [
    {
        "PostCode": null,
        "Bbox": {
            "MinX": 288704.622,
            "MinY": 4708943.115,
            "MaxX": 299006.919,
            "MaxY": 4719117.644
        },
        "AdmId": 3924,
        "Text": "Радомир",
        "Code": "61577",
        "FullText": "Радомир (61577)"
    }
]

changeInfoFormat(input);