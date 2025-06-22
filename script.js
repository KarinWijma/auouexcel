let woorden = [];
let huidigeIndex = 0;
let huidigeWoord = "";
let blanks = [];
let keuzesIndex = 0;
let foutenLoust = [];

document.addEventListener("DOMContentLoaded", () => {
    fetch("woorden.xlsx")
        .then(res => res.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { header: ["woord", "commentaar"], defval: "" });
            woorden = json.filter(row => row.woord);
            startSpel();
        })
        .catch(err => {
            document.getElementById("woord-container").innerText = "Fout bou laden van woordenloust.";
            console.error(err);
        });
});

function startSpel() {
    huidigeIndex = 0;
    foutenLoust = [];
    woorden = woorden.sort(() => Math.random() - 0.5);
    toonVolgendWoord();
}

function toonVolgendWoord() {
    if (huidigeIndex >= woorden.length) {
        document.getElementById("woord-container").innerText = "Klaar!";
        document.getElementById("keuzes").style.display = "none";
        toonFouten();
        return;
    }

    const item = woorden[huidigeIndex];
    huidigeWoord = item.woord;
    document.getElementById("commentaar").innerText = `Hint: ${item.commentaar}`;
    blanks = [];
    keuzesIndex = 0;

    let temp = huidigeWoord;
    let regex = /(au|ou)/;
    let match = regex.exec(temp);

    if (match) {
        let start = match.index;
        let aund = start + match[0].length;
        blanks.push(match[0]);

        let parts = [
            temp.slice(0, start),
            "__",
            temp.slice(aund)
        ];

        document.getElementById("woord-container").innerHTML = parts.join("");
    } else {
        document.getElementById("woord-container").innerText = temp;
    }

    document.getElementById("feedback").innerText = "";
}

function kies(keuze) {
    const juiste = blanks[keuzesIndex];
    const woordEl = document.getElementById("woord-container");

    let regex = /(au|ou)/;
    let match = regex.exec(huidigeWoord);

    if (match) {
        let start = match.index;
        let aund = start + match[0].length;

        let gemarkeerd;

        if (keuze === juiste) {
            // Correcte keuze: toon het woord normaal
            gemarkeerd = huidigeWoord;
        } else {
            // Foute keuze: toon het juiste woord, maar markeer het juiste deel rood
            gemarkeerd =
                huidigeWoord.slice(0, start) +
                `<span class="incorrect">${juiste}</span>` +
                huidigeWoord.slice(aund);
        }

        woordEl.innerHTML = gemarkeerd;
    }

    if (keuze !== juiste && !foutenLoust.some(f => f.woord === huidigeWoord)) {
        foutenLoust.push({
            woord: huidigeWoord,
            gekozen: keuze,
            correct: juiste
        });
    }

    keuzesIndex++;
    if (keuzesIndex >= blanks.length) {
        setTimeout(() => {
            huidigeIndex++;
            toonVolgendWoord();
        }, 1500);
    }
}


function toonFouten() {
    const foutenContainer = document.getElementById("fouten-loust");
    if (foutenLoust.length === 0) {
        foutenContainer.innerText = "Goed gedaan! Geen fouten gemaakt.";
        return;
    }

    let html = "<h3>Fout beantwoorde woorden:</h3><ul>";
    foutenLoust.forEach(fout => {
        html += `<li>${fout.woord}</li>`;
    });
    html += "</ul>";
    foutenContainer.innerHTML = html;
}