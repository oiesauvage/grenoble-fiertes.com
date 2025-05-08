const fs = require('fs');
const { parse } = require('csv-parse');

function capitalize(s) {
  if (s.length > 1) {
    s = s[0].toUpperCase() + s.slice(1);
  }
  return s;
}

class Event {
  constructor(event_data) {
    this.event = event_data;
    if (event_data['Il s\'agit :'] == 'D\'un événement à date unique') {
      this.type = "single";
    } else if (event_data['Il s\'agit :'] == 'D\'une permanence associative / événement réccurent'){
      this.type = "recurring";
    } else {
      this.type = "multi-date";
    }
    this.title = capitalize(event_data['Intitulé de votre événement']);
    const dateString = event_data['Date'];
    const startHourString = event_data['Horaire de début'];
    const endHourString = event_data['Horaire de fin'];
    this.multiDate = capitalize(event_data['Quels sont les jours, horaires et périodicité de votre événement (e.g. le 1er mardi de chaque mois) ?']);
    this.multiDate += capitalize(event_data['Quelles sont les dates, horaires (et adresse(s) si il y en a plusieurs) de votre événement ?']);
    this.startDate = createDate(dateString, startHourString);
    this.endDate = createDate(dateString, endHourString);
    // fix the day if event goes after midnight
    if (this.endDate < this.startDate) {
      this.endDate.setDate(this.endDate.getDate() + 1);
    }
    this.showEnd = false;
    if (endHourString != "") {
      this.showEnd = true;
    }
    this.showHours = false
    if (startHourString != "") {
      this.showHours = true;
    }
    this.mixity = capitalize(event_data['Si votre événement est en mixité choisie, préciser de quel type :'])
    this.location = capitalize(event_data['Nom du lieu']);
    this.address = capitalize(event_data['Adresse du lieu']);
    this.addressUrl = event_data['URL lieu'];
    this.shortDescription = capitalize(event_data['En quoi consiste votre événement ? Proposez une description détaillée, telle que vous souhaitez la voir apparaître dans nos communications']);
    this.longDescription = capitalize(event_data['Informations diverses que vous souhaitez communiquer aux participant.es']);
    this.orgName = capitalize(event_data['Association(s) / collectif(s) / groupe(s) organisateur.trice']);
    this.accessibility = capitalize(event_data['Accessibilité PMR']);
    this.subscribeUrl = event_data['Lien vers votre formulaire d\'inscription (si vous en avez un) :'];
  }

  toMarkdown() {
    let accessibility = "";
    let mixity = "";
    let organizers = "";
    let subscribe = "";
    let placeName = "";
    if (this.location != "") {
      placeName += "***Lieu :*** ";
      placeName += this.location;
    }
    if (this.accessibility == "Oui") {
      accessibility = "Accessibilité PMR ♿";
    }
    if (this.mixity != "") {
      mixity += "***Mixité choisie :*** ";
      mixity += this.mixity;
    }
    if (this.orgName != "") {
      organizers += "***Organisateur.ices :*** ";
      organizers += this.orgName;
    }
    if (this.subscribeUrl != "") {
      subscribe += `***Inscriptions :*** <${this.subscribeUrl}>`
    }
let markdownContent = `---
title: ${this.title}
type: ${this.type}
multiDate: ${this.multiDate}
startDate: ${this.startDate instanceof Date && !isNaN(this.startDate) ? this.startDate.toISOString() : ''}
endDate: ${this.endDate instanceof Date && !isNaN(this.endDate) ? this.endDate.toISOString() : ''}
showHours: ${this.showHours}
showEnd: ${this.showEnd}
location: ${this.location}
place: ${this.address}
placeUrl: ${this.addressUrl}
---

${this.shortDescription}

${this.longDescription}

${placeName}

${subscribe}

${organizers}

${mixity}

${accessibility}

`;
    return markdownContent;
  }

  filename() {
    const dayStr = String(this.startDate.getDate()).padStart(2, '0');
    const monthStr = String(this.startDate.getMonth() + 1).padStart(2, '0');
    const name = this.title.toLowerCase().replace(/ /g, "-").replace("/", "-");
    if (dayStr & monthStr) {
      return dayStr + "-" + monthStr + "-" + name + ".md"
    } else {
      return name + ".md"
    }
  }

  writeFile() {
    fs.writeFile(this.filename(), this.toMarkdown(), 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file ${this.filename()}:`, err);
        return;
      }
      console.log(`File ${this.filename()} has been created.`);
    });
  }
}

function createDate(dateString, hourString) {
  const dateParts = dateString.split('/');
  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // in Js, months starts at 0
  const year = parseInt(dateParts[2]);
  let hours = 0;
  let minutes = 0;
  const hourParts = hourString.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  // console.log("hour string is ", hourString, "and parsed parts are ", hourParts);
  if (hourParts) {
    hours = parseInt(hourParts[1], 10);
    minutes = hourParts[2] ? parseInt(hourParts[2], 10) : 0;
  }
  hours += 2; // add local timezone offset
  const date = new Date(year, month, day, hours, minutes);
  return date;
}

/// Main script :

// Read the CSV file
fs.readFile('prog-mdf-2025.csv', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Parse CSV data
  parse(data, {
    columns: true,
    trim: true,
    skip_empty_lines: true
  }, (err, events) => {
    if (err) {
      console.error('Error parsing CSV:', err);
      return;
    }

    // Generate markdown files for each event
    events.forEach(event_data => {
      const event = new Event(event_data);
        // console.log(event);
        // console.log("filename is", event.filename())
        // console.log(event.toMarkdown());
        event.writeFile();
        console.log("\n");
    });
  });
});



