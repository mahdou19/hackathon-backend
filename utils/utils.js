
async function getIdentify(name) {
    const nameSplite = name.split(" ")
    const id1 = nameSplite[0].split("")[0].toLowerCase()
    const id2 = nameSplite[1].toLowerCase()
    return `${id1}${id2}`
}

async function permuteArray(arr) {
  let newArr = arr.slice();

  for (let i = newArr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }

  return newArr;
}

async function generateUniqueCodes(providedCode) {
    const uniqueCodes = new Set();
    uniqueCodes.add(providedCode);
  
    while (uniqueCodes.size < 5) {
      const newCode = Math.floor(10 + Math.random() * 90); 
      uniqueCodes.add(newCode);
    }
    let codesArray = Array.from(uniqueCodes);

    let permutedArray = permuteArray(codesArray);
  
    return permutedArray;
  }

module.exports = { getIdentify, generateUniqueCodes, permuteArray}