module.exports = {
    foods: {
        query: `
        SELECT DISTINCT ?item ?itemLabel (SAMPLE(?img) AS ?image) WHERE {
            ?item wdt:P31/wdt:P279* wd:Q746549.  # Instance/subclass of dish (prepared food)
            ?item wdt:P18 ?img.

            # At least one Wikipedia sitelink ensures popularity and recognition.
            ?item wikibase:sitelinks ?sitelinks.
            FILTER(?sitelinks > 3)

            # Include only items having at least one of these cuisines:
            OPTIONAL { ?item wdt:P2012 ?cuisine. }
            FILTER NOT EXISTS { ?item wdt:P2012 wd:Q81727 } # Exclude explicitly Asian cuisine
            FILTER NOT EXISTS { ?item wdt:P2012 wd:Q1501349 } # Exclude explicitly African cuisine

            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        GROUP BY ?item ?itemLabel
        ORDER BY RAND()
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
        SELECT DISTINCT ?item ?itemLabel (SAMPLE(?img) AS ?image) WHERE {
            ?item wdt:P105 wd:Q7432. # Taxon rank: species
            ?item wdt:P18 ?img.
            ?item wdt:P141 wd:Q211005. # Conservation status: Least Concern
            
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        GROUP BY ?item ?itemLabel
        ORDER BY RAND()
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