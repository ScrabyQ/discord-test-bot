

module.exports.rp = function randomPhrase ([phrases]){
    let random = Math.floor(Math.random() * phrases.length)

    if (typeof(phrases[random]) == 'string'){
        return phrases[random]
    }
}