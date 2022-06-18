gedcom-hero
============

Usage:
------

```
const { readFileSync } = require("fs"),
  { parseGedcom } = require("./gedcom-jones/parser"),
  main = async () => {
    const people = await parseGedcom(readFileSync(`myData.ged`));
    for (const p of people) // also other records, families, sources etc
      console.info(p);
  };

main();
```

Date fields
-----------

Fields which contain a `DATE` label get their value parsed.

The first element returned is the raw string value.
The second element is the year from the date, if possible to extract it.
The third element is a JS Date object for that date, if possible to create one.

If the date string is not easily-parseable then the second and/or third elements are null. The parsing checks for date formats in this order: '22 Mar 1973', '3/22/1973', '22/03/1973'

Calling code should check for index 2 (a full date), index 1 (the year), and the original value is available in index 0.
