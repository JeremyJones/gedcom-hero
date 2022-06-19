gedcom-hero
============

Description
-----------

Utilities in Javascript for parsing Gedcom files and working with their data.

Usage
-----

```
const myGedcomFilename = `myData.ged`; // set as appropriate

const { readFileSync } = require("fs"),
  { parseGedcom } = require("./gedcom-jones/parser"),
  main = async () => {
    const people = await parseGedcom(readFileSync());
    for (const p of people) // also other records, families, sources etc
      console.info(p);
  };

main();
```

The parser returns a promise. Usage in a non-asynchronous environment (currently) would be:

```
const myGedcomFilename = `myData.ged`; // set as appropriate

const { readFileSync } = require("fs"),
  { parseGedcom } = require("./gedcom-jones/parser"),
  main = () => {
    parseGedcom(readFileSync()).then(people => {
      for (const p of people) // also other records, families, sources etc
        console.info(p);
      })
  };

main();
```

People, Families, Sources
-------------------------

The parser collects all "Level 0" records from the incoming Gedcom data and processes each one before returning the full list of parsed records. This means that along with records indicating people ("individual" records always begin with id "P") there are also records which detail family structures (beginning with id "F"; family records link parents to children) and details for the sources referenced by other records (beginning with an "S"). Most features, such as date parsing and detail collection, exist for non-individual records too.

The parser does not set a 'type' for each record; the type of structure is self-evident in the id. As a result, the default list returned by the parser is a list of people, families and sources, if present in the Gedcom data. To see ONLY people for example filter the list for "@P" in the object's id field:

```
    const allData = await parseGedcom(readFileSync(`myData.ged`)),
      peopleOnly = allData.filter(
        data => !!`${data["id"]}`.substring(0,2) === "@P");
```

Dates
-----

Fields which contain a `DATE` label get their value parsed.

The first element returned is the raw string value.
The second element is the year from the date, if possible to extract it.
The third element is a JS Date object for that date, if possible to create one.

If the date string is not easily-parseable then the second and/or third elements are null. The parsing checks for date formats in this order: '22 Mar 1973', '3/22/1973', '22/03/1973'

Calling code should check for index 2 (a full date), index 1 (the year), and the original value is available in index 0.

All dates are assumed to be UTC and there is no timezone conversion.

Example:
```
  resi: [ // record of a person being resident in a place at a certain time
    [
      '1 Dec 1983',
      1983,
      1983-12-01T00:00:00.000Z,
      'Falls Church, Fairfax, Virginia, USA'
    ]
  ]
```

Status
------

The parser is the only thing in this repository just now, to convert Gedcom text data into a list of Javscript objects. Converting from Javascript into valid Gedcom is to do. Pull requests, contributions and collaborations welcome.

Bugs
----

The following fields are not yet fully-handled properly:

- Age at death (exists as a note in death records)
- APID & SOUR are not 100%
