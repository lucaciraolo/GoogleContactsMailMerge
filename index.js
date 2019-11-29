const parse = require("csv-parse/lib/sync");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const csvString = fs.readFileSync("contacts.csv");

const countryCodes = {
  FR: "France",
  USA: "United States",
  US: "United States",
  MC: "Monaco",
  GB: "United Kingdom",
  UK: "United Kingdom",
  CH: "Switzerland",
  PT: "Portugal",
  BE: "Belgium",
  BR: "Brazil"
};

const records = parse(csvString, {
  columns: true, // converts each line into object
  on_record: record => {
    const person = {};

    // Find the custom field index for Mail Title
    for (let i = 1; i <= 3; i++) {
      if (record[`Custom Field ${i} - Type`].toLowerCase() === "mail title") {
        person.mailTitle = record[`Custom Field ${i} - Value`];
        break;
      }
    }

    // Find the address index of the "Home" address
    for (let i = 1; i <= 3; i++) {
      if (record[`Address ${i} - Type`] === "Home") {
        person.address = record[`Address ${i} - Formatted`];

        // Annoyingly, google contacts shortens countries to a 2 letter country
        // code which is not valid for a mail address. We therefore will have to
        // change this.
        const countryCode = record[`Address ${i} - Country`];

        if (countryCode.length <= 3 && countryCode.length > 0) {
          const correctedCountry = countryCodes[countryCode];

          if (!correctedCountry) {
            console.error(`Country code '${countryCode}' not in lookup table.`);
          } else {
            person.address = person.address.replace(
              countryCode,
              correctedCountry
            );

            // console.debug(`changed ${countryCode} to ${correctedCountry}`);
          }
        }

        break;
      }
    }

    // Catch any missing information
    if (!person.mailTitle) {
      console.error(`${record.name} is missing a mail title!`);
    }
    if (!person.address) {
      console.error(`${record.name} is missing a home address!`);
    }

    return person;
  }
});

// Create the doc
const doc = new PDFDocument({
  size: "C5",
  autoFirstPage: false,
  layout: "landscape",
  margins: {
    top: 200,
    bottom: 50,
    left: 200,
    right: 72
  }
});

doc.fontSize(14);

doc.pipe(fs.createWriteStream("output.pdf"));

records.forEach(({ mailTitle, address }) => {
  doc.addPage();
  doc.text(mailTitle);
  doc.text(address);
});

doc.end();
