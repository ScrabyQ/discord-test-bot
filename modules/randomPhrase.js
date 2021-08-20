

module.exports.rp = function randomPhrase (phrases){
    let random = Math.floor(Math.random() * phrases.length)
        return phrases[random]
}