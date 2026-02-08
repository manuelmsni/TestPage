

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
                menu.classList.toggle('show');
            }
        });
    }

    const menuItems = container.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const menu = document.getElementById('menu');
            if (menu) {
                menu.classList.remove('show');
            }
        });
    });
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
                ${appData.predators.map((predator, index) => `
                    <div class="predator-card">
                        <div class="card ${(predator.sheet || predator.price) ? 'clickable-card' : ''}" data-index="${index}">                            ${predator.image ? `<div class="predator-image"><img src="https://insectaria.com/${predator.image}" alt="${predator.name}"></div>` : ''}
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

    if (section.font) predatorsSection.style.color = section.font;
    if (!document.getElementById('predators')) document.body.append(predatorsSection);
    const cards = predatorsSection.querySelectorAll('.card.clickable-card');
    cards.forEach(card => {
        const index = card.getAttribute('data-index');
        const predator = appData.predators[index];

        if(predator.price || predator.sheet){
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                
                let priceTable = '';
                if (predator.price) {
                    const rows = predator.price.trim().split('\n');
                    const tableRows = rows.map(row => {
                        const cells = row.split('|').map(cell => `<td>${cell.trim()}</td>`).join('');
                        return `<tr>${cells}</tr>`;
                    }).join('');
                    priceTable = `
                        <table class="price-table">
                            <tbody class="price-table-body">
                                ${tableRows}
                            </tbody>
                        </table>`;
                }
                const modalContent = `
                    <div>
                        <div class="predator-graphic-info">
                            <img src="https://insectaria.com/${predator.image}">
                            ${priceTable}
                        </div>
                        ${predator.sheet ? predator.sheet.split('\n').map(line => `<p>${line.trim()}</p>`).join(''): ''}
                    </div>
                `;
                modal(predator.name, modalContent);
            });
        }
    });
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

function renderProjects(section){
    const projectsSection = document.getElementById('projects') || document.createElement('section');
    projectsSection.id = 'projects';
    if (section.background) projectsSection.style.backgroundImage = `url(https://insectaria.com/${section.background})`;
    if (section.font) projectsSection.style.color = section.font;
    projectsSection.innerHTML = `
            <div class="container">
                <div class="grid">
                    ${appData.projects.map(project => `
                        <div class="project-card">
                            <div class="card">
                                <div class="project-info">
                                    <h3>${project.title}</h3>
                                    <p>${project.description}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    if (!document.getElementById('projects')) {
        document.body.append(projectsSection);
    }
}

function renderCollaborations(section){
    const idiSection = document.getElementById('idi') || document.createElement('section');
    idiSection.id = 'idi';
    idiSection.innerHTML = `
            <div class="container">
                <div>
                    <h2>${section.title}</h2>
                    <p>${section.text}</p>
                </div>
                <div class="grid">
                    ${appData.idi.map(idi => `
                        <div class="idi-card">
                            <div class="card">
                                <div class="idi-info">
                                    <h3>${idi.title}</h3>
                                    <p>${idi.description}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}  
                </div>
            </div>
        `;
    if (!document.getElementById('idi')) {
        document.body.append(idiSection);
    }
}

function renderModal() {
    if (document.getElementById('modal')) return;
    const modal = document.createElement('div');
    modal.id = 'modal';
    modal.classList.add('hidden');
    modal.innerHTML = `
        <div class="modal-window">
            <button class="modal-close">✖</button>
            <h2 id="modal-title"></h2>
            <div class="modal-content" id="modal-content"></div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
}
function modal(title, htmlContent) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = htmlContent;

    modal.classList.remove('hidden');
}
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
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
    if (portfolio && appData.predators) renderPredators(portfolio);

    const projects = appData.sections.find(s => s.id === "#projects");
    if (projects) renderProjects(projects);

    const idi = appData.sections.find(s => s.id === "#i+d+i");
    if (idi) renderCollaborations(idi);

    const contactData = appData.sections.find(s => s.id === "#contact");
    if (contactData) renderContact(contactData);

    renderModal();
}

function debug(data){
    console.log("APPDATA:", data);
    document.body.innerHTML = `
        <pre id="debug"></pre>
    `;
    document.getElementById("debug").textContent = JSON.stringify(appData, null, 2);
}

function waitForAppDataAndDOM({ timeout = 10000, interval = 20 } = {}) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        function check() {
            if (document.body && window.appData !== undefined && window.appData !== null) {
                return resolve(window.appData);
            }

            if (Date.now() - start > timeout) {
                return reject(new Error("Timeout esperando DOM o appData"));
            }

            setTimeout(check, interval);
        }
        check();
    });
}

async function load() {
    try{
        const params = new URLSearchParams(window.location.search);
        const gid = params.get("gid");
        const script = document.createElement("script");
        if (gid) {
            window.APP_GID = gid;
            script.src = "./prototype.js";
        } else {
            script.src = "./bd.js";
        }
        document.head.appendChild(script);
        await waitForAppDataAndDOM();
        renderSections();
    }catch(err){
        console.error(err);
        document.body.innerHTML = `<div style="text-align:center;"><h2>Error al cargar datos, vuelve más tarde.</h2><h3>info@insectaria.com</h3></div>`;
    }
}

load();