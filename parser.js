
const parseGedcom = async (gedcomData) => {
  const blocks = `${gedcomData}`.split(/[\r\n]+(?=0 )/s);
  let people = [];

  for (const b of blocks) {

    if (b.match(/^0 HEAD/s)) continue;

    const id = b.replace(/[\r\n]+.+$/s).split(" ")[1];
    const facts = b.split(/[\r\n]+(?=1 )/s).slice(1);

    let person = {
      id,
    }, dataFacts = [];

    for (const fact of facts) {
      const lines = fact.split(/[\r\n]+/s);
      dataFacts.push(lines)
    }
    for (const dataFact of dataFacts) {
      const [level, label, ...extraInfo] = dataFact[0].split(" ");

      if (parseInt(level) !== 1) continue;

      const val = extraInfo.join(" ").replace(/^\s+|\s+$/g, "");

      if (["SEX", "TITL", "PUBL"].includes(label)) {
        person[label.toLocaleLowerCase()] = val;
        continue;
      }
      if (label === "NAME") {
        const firstNames = val.replace(/\s+\/.+\/$/, ""),
          lastName = val.replace(/^.+\/(.+)\/$/, "$1");
        person.name = [firstNames, lastName];
        continue;
      }
      if (["HUSB", "WIFE"].includes(label)) {
        person[label.toLocaleLowerCase()] = val;
        continue;
      }
      if (["FAMC", "FAMS", "AUTH",
        "REPO", "SOUR"].includes(label)) {
        const key = label.toLocaleLowerCase();

        if (!person[key]) person[key] = [];
        person[key].push(val);
        continue;
      }
      const listFact = (dataFact) => {
        const rv = dataFact
          .filter(e => !`${e}`.match(/ DATE /))
          .filter(e => `${e}`.match(/^[234] /))
          .map(e => `${e}`.substring(7).replace(/^\s+|\s+$/g, ""))
          .filter(e => `${e}` !== "");

        return rv;
      };

      if (["CHIL", "OBJE", "BURI"].includes(label)) {
        const key = label.toLocaleLowerCase();

        let me = { key, val };
        const fact = listFact(dataFact);
        me["details"] = fact;

        if (!person[key]) person[key] = [];
        person[key].push(me);
        continue;
      }
      const dateLines = dataFact.filter(e => `${e}`.match(/^\d+ DATE /));
      if (dateLines.length === 0) {
        console.warn(`Nothing for ${label}`, extraInfo);
        continue;
      }

      // something with a date in it
      const origVal = dateLines[0].replace(/.+?DATE /, ""),
        dString = origVal.replace(/(?:abt|about) */i, ""),
        bits = dString.split(" "),
        bitsSlash = dString.split("/"),
        likelyYear = (!!dString.match(/^.*?(\d\d\d+)$/)) ?
          parseInt(dString.replace(/^.*?(\d\d\d+)$/, "$1")) : null;

      let jsDate = null;

      if ((!jsDate) && bits && bits.length === 3) { // '22 Mar 1973'
        // console.info(bits);
        try {
          jsDate = new Date(Date.UTC(parseInt(bits[2]),
            ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
              .findIndex(v => v.toLocaleLowerCase() === bits[1].toLocaleLowerCase().substring(0, 3)),
            parseInt(bits[0])));
        } catch (e) { console.warn(e) }
      }
      if ((!jsDate) && bits && bits.length === 2 && bits[0].toLocaleLowerCase() !== "after") { // 'Mar 1973'
        // console.info(bits);
        try {
          jsDate = new Date(Date.UTC(parseInt(bits[1]),
            ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
              .findIndex(v => v.toLocaleLowerCase() === bits[0].toLocaleLowerCase())));
        } catch (e) { console.warn(e) }
      }
      if ((!jsDate) && bitsSlash && bitsSlash.length === 3 && bitsSlash[2].length === 4) { // 3/22/1973
        try {
          jsDate = new Date(Date.UTC(parseInt(bitsSlash[2]),
            parseInt(bitsSlash[0]) - 1, parseInt(bitsSlash[1])));
        } catch (e) { console.warn(e) }
      }
      if ((!jsDate) && bitsSlash && bitsSlash.length === 3 && bitsSlash[2].length === 4) { // 22/03/1973
        try {
          jsDate = new Date(Date.UTC(parseInt(bitsSlash[2]),
            parseInt(bitsSlash[1]) - 1, parseInt(bitsSlash[0])));
        } catch (e) { console.warn(e) }
      }
      // if ((!jsDate) && dString.match(/^\d\d\d\d$/))
      //   try { jsDate = new Date(Date.UTC(parseInt(dString), 5, 1)) } catch (e) { console.warn(e) }

      const key = label.toLocaleLowerCase();
      if (!person[key]) person[key] = [];
      const existing = person[key],
        facts = listFact(dataFact);
      person[key] = [
        ...existing,
        [origVal, likelyYear, jsDate,
          ...facts
          // spreadFacts(dataFacts)
        ]
      ].sort((a, b) => (a[1] - b[1]) ||
        (parseInt(a[0]) - parseInt(b[0])) ||
        (a[0] - b[0]));
      // .push([dString, jsDate,
      //   ...dataFact
      //     .filter(e => !`${e}`.match(/ DATE /))
      //     .filter(e => `${e}`.match(/^[234] /))
      //     .map(e => `${e}`.substring(7).replace(/^\s+|\s+$/g, ""))
      //     .filter(e => `${e}` !== "")]);
      // n        val ? `"${val}"`.replace(/(Age(?: in \d\d\d\d)?:\s+\d+)(?=[A-Za-z])/, "$1 ") : val])
      //         .filter(f => f !=));

      // person.data = dataFacts;
    }
    people.push(person);
  }
  return people;
};
// ,
// marriagesData = JSON.parse(fs.readFileSync("bigMarriages1.json"), (key, value) => {
//   // console.info(`Saw key ${key} and value ${value}`);
//   if (["marriageDate"].includes(key) && value) {
//     const dString = value,
//       bits = dString.split(" ");

//     value = [value]
//     if (bits && bits.length === 3) {
//       // console.info(bits);
//       try {
//         jsDate = new Date(Date.UTC(parseInt(bits[2]),
//           ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
//             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].findIndex(v => v === bits[1]),
//           parseInt(bits[0])));
//       } catch (e) { console.warn(e) }

//       if (jsDate) value.push(jsDate);
//     }
//   }
//   return (key, value);
// });


module.exports = { parseGedcom };
