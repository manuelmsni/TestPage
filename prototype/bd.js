const dataStructure = {
    gid : "16AXBAYLMkiX4kEuk9BvF9e0tZz-GJhWc_IJ3dhD8gJA",
    menu : {
        gid : "0"
    },
    sections : {
        gid : "1555798405"
    },
    methodology: {
        gid : "1717048576"
    },
    services : {
        gid : "1534265705"
    },
    predators : {
        gid: "961193381"
    },
    projects : {
        gid: "1299205135"
    },
    collaborations : {
        gid: "921134955"
    }
}

async function fetchFileContent(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

function parseCSV(csv) {
    const rows = [];
    let row = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        const nextChar = csv[i + 1];
        if (char === '"' && inQuotes && nextChar === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            row.push(current);
            current = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && csv[i + 1] === '\n') i++;
            row.push(current);
            rows.push(row);
            row = [];
            current = '';
        } else {
            current += char;
        }
    }
    if (current !== '' || row.length > 0) {
        row.push(current);
        rows.push(row);
    }
    return rows.map(r => r.map(c => c.trim()));
}

async function fetchGoogleSheetsCSV(sheetId, sheetGID, localPath) {
    const targetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheetGID}`;
    const csv = await fetchFileContent(targetUrl);
    console.log(`Datos cargados desde la nube (GID: ${sheetGID})`);
    return parseCSV(csv);
}

async function fetchGoogleSheetsCSVAsJson(sheetId, sheetGID = 0, localPath = null) {
    const array2D = await fetchGoogleSheetsCSV(sheetId, sheetGID, localPath);
    if (!array2D || array2D.length < 2) {
        return [];
    }
    const [headers, ...rows] = array2D;
    return rows.map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] ?? "";
        });
        return obj;
    });
}

async function loadDataSheet() {
    const ds = dataStructure;
    try {
        const [a, b, c, d, e, f, g] = await Promise.all([
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.menu.gid),
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.sections.gid),
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.services.gid),
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.predators.gid),
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.methodology.gid),
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.projects.gid),
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.collaborations.gid)
        ]);
        parseData(a, b, c, d, e, f, g);
    } catch (e) {
        console.error("Error cargando base de datos:", e);
    }
}

function parseData(menu, sections, services, predators, methodology, projects, collaborations) {
    const isEnabled = (dateStr) => {
        if (!dateStr || dateStr == "") return false;
        const activationDate = new Date(dateStr.split('/').reverse().join('-'));
        return activationDate <= new Date();
    };
    window.appData = {
        menu: menu
            .filter(x => isEnabled(x["Habilitado"]))
            .map(x => ({
                enabled: x["Habilitado"],
                text: x["Texto"],
                link: x["Enlace"],
            })),
        sections: sections
            .filter(x => isEnabled(x["Habilitado"]))
            .map(x => ({
                enabled: x["Habilitado"],
                internal: x["Descripción interna"],
                title: x["Título"],
                subtitle: x["Subtítulo"],
                text: x["Texto"],
                background: x["Fondo"],
                font: x["Fuente"],
                link: x["Enlace"],
                id: x["Clave"]
            })),
        methodology: methodology
            .filter(x => isEnabled(x["Habilitado"]))
            .map(x => ({
                enabled: x["Habilitado"],
                icon: x["Icono"],
                text: x["Texto"]
            })),
        services: services
            .filter(x => isEnabled(x["Habilitado"]))
            .map(x => ({
                enabled: x["Habilitado"],
                title: x["Título"],
                text: x["Texto"],
                image: x["Imagen"],
                icon: x["Icono"]
            })),
        predators: predators
            .filter(x => isEnabled(x["Habilitado"]))
            .map(x => ({
                enabled: x["Habilitado"],
                name: x["Nombre"],
                state: x["Estadio"],
                description: x["Descripción"],
                image: x["Imagen"],
                price: x["Precio"],
                sheet: x["Ficha"],
            })),
        projects : projects
            .filter(x => isEnabled(x["Habilitado"]))
            .map(x => ({
                enabled: x["Habilitado"],
                title: x["Título"],
                description: x["Descripción"]
            })),
        collaborations : collaborations
            .filter(x => isEnabled(x["Habilitado"]))
            .map(x => ({
                enabled: x["Habilitado"],
                title: x["Título"],
                description: x["Descripción"]
            })),
    };
    document.dispatchEvent(new Event("appDataReady"));
}

loadDataSheet();