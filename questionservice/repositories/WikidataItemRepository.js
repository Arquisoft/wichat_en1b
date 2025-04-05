const WikidataItem = require('../models/wikidata-item-model');

class WikidataItemRepository {

    async getRandomByType(type, limit = 4) {
        return WikidataItem.aggregate([
            { $match: { type } },
            { $sample: { size: limit } }
        ]);
    }

    async bulkWrite(questionDocs) {
        const bulkOps = questionDocs.map(result => ({
            updateOne: {
                filter: { wikidataId: result.wikidataId }, // Extract QID from full URI
                update: {
                    $set: {
                        label: result.label,
                        image: result.image,
                        type: result.type
                    }
                },
                upsert: true // Create if doesn't exist
            }
        }));

        return WikidataItem.bulkWrite(bulkOps);
    }
}

module.exports = WikidataItemRepository;