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
    }
}

let appData = {};

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
        const [a, b, c, d, e] = await Promise.all([
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.menu.gid),
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.sections.gid),
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.services.gid),
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.predators.gid),
            fetchGoogleSheetsCSVAsJson(ds.gid, ds.methodology.gid)
        ]);
        return parseData(a, b, c, d, e);
    } catch (e) {
        console.error("Error cargando base de datos:", e);
    }
}

function parseData(menu, sections, services, predators, methodology) {
    const isEnabled = (dateStr) => {
        if (!dateStr || dateStr == "") return false;
        const activationDate = new Date(dateStr.split('/').reverse().join('-'));
        return activationDate <= new Date();
    };
    appData = {
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
                image: x["Imagen"]
            }))
    };

    return appData;
}

function renderMenu() {
    const container = document.getElementById('menu-container') || document.createElement('div');
    container.id = 'menu';
    container.innerHTML = `
        <div class="logo"><img src="https://insectaria.com/assets/img/logo.png" width="auto" height="35px" alt="Insectaria" title="Insectaria" style="cursor: pointer;display: list-item; text-align: -webkit-match-parent;"></div>
        <ul class="menu-list">
            <div id="hamburger"><span></span><span></span><span></span></div>
            ${appData.menu
                .map(item => item.text.startsWith("icofont") 
                    ? `<li><a href="${item.link}" class="menu-item nolink"><i class="${item.text}"></i></a></li>`
                    : `<li><a href="${item.link}" class="menu-item nolink">${item.text}</a></li>`
                )
                .join('')}
        </ul>
    `;
    if (!document.getElementById('menu-container')) {
        document.body.appendChild(container);
    }
    var hamburguer = document.getElementById('hamburger');
     if (hamburguer) {
        hamburguer.addEventListener('click', function () {
            var menu = document.getElementById('menu');
            if (menu) {
                if (menu.classList.contains('show')) {
                    menu.classList.remove('show');
                } else {
                    menu.classList.add('show');
                }
            }
        });
    }
}

function renderHero(section) {
    const heroSection = document.getElementById('hero') || document.createElement('section');
    heroSection.id = 'hero';
    if (section.background) heroSection.style.backgroundImage = `url(https://insectaria.com/${section.background})`;
    heroSection.innerHTML = `
        <div class="container">
            <a class="nolink" ${section.link ? `href="${section.link}"` : ''}>
                <h1>${section.title}</h1>
                <h2>${section.subtitle}</h2>
                <h3>${section.text}</h3>
            </a>
        </div>
    `;
    if (section.font) {
        heroSection.style.color = section.font;
    }
    if (!document.getElementById('hero')) {
        document.body.append(heroSection);
    }
}

function renderAbout(section) {
    const aboutSection = document.getElementById('about') || document.createElement('section');
    aboutSection.id = 'about';
    if (section.background) aboutSection.style.backgroundColor = section.background;
    if (section.font) aboutSection.style.color = section.font;
    aboutSection.innerHTML = `
        <div class="container">
            <div class="about-content">
                ${section.title ? `<h2>${section.title}</h2>` : ''}
                <div class="description">
                    <h3>${section.text}</h3>
                </div>
            </div>
            ${ appData.methodology && appData.methodology.length > 0 ?
            `<div class="methodology-content">
                ${appData.methodology.map((methodology, index) => `
                <div class="methodology-entry">
                    <i class="${methodology.icon} methodology-icon"></i>
                    <h3>${methodology.text}</h3>
                </div>
                `).join('')}
            </div>`: ``
            }
        </div>
    `;
    if (section.font) {
        aboutSection.style.color = section.font;
    }
    if (!document.getElementById('about')) {
        document.body.append(aboutSection);
    }
}

function renderServices(section) {
    const servicesSection = document.getElementById('services') || document.createElement('section');
    servicesSection.id = 'services';
    if (section.background) servicesSection.style.backgroundImage = `url(https://insectaria.com/${section.background})`;
    servicesSection.innerHTML = `
        <div class="container">
            <div class="grid">
                ${appData.services.map((service, index) => `
                    <div class="service-card">
                        <div 
                            class="card" 
                            data-index="${index}"
                            ${service.image ? `style="--hover-bg: url('https://insectaria.com/${service.image}')"` : ``}
                        >
                            <div class="service-info">
                                <div class="icon">
                                    <i class="${service.icon} service-icon"></i>
                                </div>
                                <h4>${service.title}</h4>
                                <p>${service.text}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${appData.services.length > 4 
                ? `<div id="services-trigger" style="display: none;">
                        <a class="nolink" style="cursor: pointer;">${section.title}</a>
                   </div>` 
                : ``}
        </div> 
    `;

    const cards = servicesSection.querySelectorAll('.service-card');
    if (appData.services.length > 4) {
        const triggerContainer = servicesSection.querySelector('#services-trigger');
        const triggerLink = triggerContainer.querySelector('a');
        const updateVisibility = (showAll) => {
            cards.forEach((card, index) => {
                card.style.display = (showAll || index < 4) ? 'block' : 'none';
            });
            if (showAll) {
                triggerLink.textContent = section.subtitle;
                triggerLink.removeAttribute('href');
            } else {
                triggerLink.textContent = section.title;
                if (section.link) {
                    triggerLink.setAttribute('href', section.link);
                }
            }
        };
        triggerContainer.style.display = 'block';
        updateVisibility(false);
        triggerLink.addEventListener('click', () => {
            const isShowingAll = triggerLink.textContent === section.subtitle;
            updateVisibility(!isShowingAll);
        });
    }
    if (section.font) {
        servicesSection.style.color = section.font;
    }
    if (!document.getElementById('services')) {
        document.body.append(servicesSection);
    }
}

function renderPredators(section) {
    const predatorsSection = document.getElementById('predators') || document.createElement('section');
    predatorsSection.id = 'portfolio';
    predatorsSection.innerHTML = `
        <div class="container">
            <div>
                <h2>${section.title}</h2>
                <p>${section.text}</p>
            </div>
            <div class="grid">
                ${appData.predators.map(predator => `
                    <div class="predator-card">
                        <div class="card">
                            ${predator.image ? `<div class="predator-image"><img src="https://insectaria.com/${predator.image}" alt="${predator.name}"></div>` : ''}
                            <div class="predator-info">
                                <h3><i>${predator.name}</i></h3>
                                <h4>${predator.state}</h4>
                                <p>${predator.description}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    if (section.font) {
        predatorsSection.style.color = section.font;
    }
    if (!document.getElementById('predators')) {
        document.body.append(predatorsSection);
    }
}

function renderContact(section) {
    const contactSection = document.getElementById('contact') || document.createElement('section');
    contactSection.id = 'contact';

    if (section.background) contactSection.style.backgroundImage = `url(https://insectaria.com/${section.background})`;
    if (section.font) contactSection.style.color = section.font;

    contactSection.innerHTML = `
        <div class="container">
            <a class='nolink' ${section.link ? `href='${section.link}'`:''}>
                <div class="icon"><i class="icofont-envelope"></i></div>
                <div class="contact-content">
                    ${section.title ? `<h2>${section.title}</h2>` : ''}
                    ${section.subtitle ? `<h3>${section.subtitle}</h3>`: ''}
                    ${section.text ? `<h3>${section.text}</h3>`: ''}
                </div>
            </a>
            <p>© Copyright <strong>insectaria.com</strong>. All Rights Reserved</p>
        </div>
    `;
    if (section.font) {
        contactSection.style.color = section.font;
    }
    if (!document.getElementById('contact')) {
        document.body.append(contactSection);
    }
}

function renderSections() {
    renderMenu();

    const heroData = appData.sections.find(s => s.id === "#hero");
    if (heroData) renderHero(heroData);

    const aboutData = appData.sections.find(s => s.id === "#about");
    if (aboutData) renderAbout(aboutData);

    const servicesData = appData.sections.find(s => s.id === "#services");
    if (servicesData) renderServices(servicesData);

    const portfolio = appData.sections.find(s => s.id === "#portfolio");
    if (portfolio && appData.predators) {
        renderPredators(portfolio);
    }

    const contactData = appData.sections.find(s => s.id === "#contact");
    if (contactData) renderContact(contactData);
}

function debug(data){
    console.log("APPDATA:", data);
    document.body.innerHTML = `
        <pre id="debug"></pre>
    `;
    document.getElementById("debug").textContent = JSON.stringify(appData, null, 2);
}

function load() {
    loadDataSheet().then((data) => {
        //debug(data);  
        renderSections();
    }).catch(err => {
        console.error(err);
        document.body.innerHTML = `<div style="text-align:center;"><h2>Error al cargar datos, vuelve más tarde.</h2><h3>info@insectaria.com</h3></div>`;
    });
}

load();