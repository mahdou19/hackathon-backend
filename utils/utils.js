
async function getIdentify(name) {
    const nameSplite = name.split(" ")
    const id1 = nameSplite[0].split("")[0].toLowerCase()
    const id2 = nameSplite[1].toLowerCase()
    return `${id1}${id2}`
}

module.exports = {getIdentify}