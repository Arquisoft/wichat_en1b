const mongoose = require('mongoose');

const wikidataItemSchema = new mongoose.Schema({
    wikidataId: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    isTest: {
        type: Boolean,
        default: false,
    }
});

const WikidataItem = mongoose.model('WikidataItem', wikidataItemSchema);

module.exports = WikidataItem;