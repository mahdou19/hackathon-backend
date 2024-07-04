
async function getIdentify(name) {
    const nameSplite = name.split(" ")
    const id1 = nameSplite[0].split("")[0].toLowerCase()
    const id2 = nameSplite[1].toLowerCase()
    return `${id1}${id2}`
}

async function generateUniqueCodes(providedCode) {
    const uniqueCodes = new Set();
    uniqueCodes.add(providedCode);
  
    while (uniqueCodes.size < 5) {
      const newCode = Math.floor(10 + Math.random() * 90); 
      uniqueCodes.add(newCode);
    }
  
    return Array.from(uniqueCodes);
  }
  

module.exports = { getIdentify, generateUniqueCodes}