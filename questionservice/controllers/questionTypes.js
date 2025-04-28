module.exports = {
    foods: {
        query: `
        SELECT ?item ?itemLabel ?image WHERE {
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        
        ?item wdt:P31 ?foodType;  # The entity must be a type of food
                wdt:P18 ?image.     # Ensure the entity has an image

        # Include common food-related categories
        VALUES ?foodType { wd:Q2095 wd:Q746549 wd:Q1778821 wd:Q980394 wd:Q185578 }
        }
        ORDER BY RAND()  # Randomize results
        LIMIT 200
        `,
        imgTypeName: "game.imageTypes.image",
        relation: "game.relations.correspondsTo"
    },
    monuments: {
        query: `
        SELECT ?item ?itemLabel ?image WHERE {
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        
        ?item wdt:P31 wd:Q4989906;  # Only select items that are classified as monuments
                wdt:P18 ?image.       # Ensure the entity has an image
        }
        ORDER BY RAND()  # Randomize results
        LIMIT 200
        `,
        imgTypeName: "game.imageTypes.image",
        relation: "game.relations.correspondsToThe"
    },
    animals: {
        query: `
        SELECT ?item ?itemLabel ?image WHERE {
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            ?item wdt:P31 wd:Q16521;  # The entity must be a taxon (biological classification)
                    wdt:P18 ?image.     # Ensure the entity has an image

            # Include only major animal groups
            VALUES ?parentTaxon { wd:Q7377 wd:Q5113 wd:Q10803 wd:Q209242 wd:Q230316 }
            ?item wdt:P171 ?parentTaxon.
        }
        ORDER BY RAND()  # Randomize the order of results
        LIMIT 200
        `,
        imgTypeName: "game.imageTypes.image",
        relation: "game.relations.isA"
    },
    flags: {
        query: `
        SELECT ?item ?itemLabel ?image WHERE { 
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } 
            ?item wdt:P31 wd:Q6256; 
            wdt:P41 ?image. 
        } LIMIT 200
        `,
        imgTypeName: "game.imageTypes.flag",
        relation: "game.relations.belongsTo"
    }

}