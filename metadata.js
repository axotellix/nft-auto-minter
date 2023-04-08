
// [ IMPORTS ]
const fs = require('fs')
const path = require('path')


// [ PRESETS ]
const start = 1
const total = 3000
let threes = 0

const topics = ['topic-1', 'topic-2', 'topic-3']
const descriptions = [
    "description-1",
    "description-2",
    "description-3"
]


// [ FUNCTIONS ]
const format = ( n ) => {
    if ( n.toString().length == 1 ) {
        n = "000" + n
    } else if ( n.toString().length == 2 ) {
        n = "00" + n
    } else if ( n.toString().length == 3 ) {
        n = "0" + n
    } else {
        n = "" + n
    }
    return n
}


// [ MAIN ]
for ( let i = start; i <= total; i++ ) {

    // read > metadata from template
    const metadata = JSON.parse( fs.readFileSync('./metadata/template.json', 'utf-8') )
    metadata.name += format(i) 
    metadata.description = descriptions[ threes ]
    metadata.props.topic = topics[ threes ]

    // change > three (type of card)
    threes = (threes == 2) ? 0 : (threes + 1)

    // generate > metadata file
    fs.writeFileSync(`./metadata/${i}.json`, JSON.stringify(metadata, null, 4))
    console.log('file created: ' + metadata.name)
}

