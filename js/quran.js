// State Management
let currentPage = 1;
const tafseerNames = ['مشكل', 'نصي', 'الجلالين', 'الميسر', 'ابن كثير'];

/**
 * Fetch and render the list of Suras
 */
async function loadSuras() {
    try {
        const response = await fetch('json/suras.json');
        const data = await response.json();
        
        const html = data.map((sura, i) => `
            <tr id="sura_link_${sura.id}">
                <td>${i + 1}</td>
                <td>
                    <a class="sura_link" href="#" data-page="${sura.page}">${sura.name}</a>
                </td>
                <td>${sura.page}</td>
                <td>${sura.ayas}</td>
            </tr>
        `).join('');

        document.querySelector('#suras tbody').innerHTML = html;
    } catch (err) {
        console.error('Failed to load suras:', err);
    }
}

/**
 * Load a specific page and its interactive segments
 */
async function loadPage(page) {
    // Bounds check
    if (page < 1) page = 1;
    if (page > 604) page = 604;
    currentPage = page;

    // Update UI
    document.querySelector('.control__page-num').textContent = `صفحة : ${currentPage}`;
    
    const pageEl = document.getElementById('page');
    const tafEl = document.getElementById('tafseer');
    pageEl.innerHTML = '';
    tafEl.innerHTML = '';

    // Padding page number (e.g., 1 -> 001)
    const pageStr = String(page).padStart(3, '0');
    pageEl.style.backgroundImage = `url(img/${pageStr}.jpg)`;

    try {
        const response = await fetch(`json/page_${page}.json`);
        if (!response.ok) throw new Error('Failed to load page map');
        const data = await response.json();

        // Clear previous active states
        document.querySelectorAll('#suras tr').forEach(tr => tr.classList.remove('active'));

        const fragment = document.createDocumentFragment();

        data.forEach(aya => {
            // Highlight active Sura in table
            const suraRow = document.getElementById(`sura_link_${aya.sura_id}`);
            if (suraRow) suraRow.classList.add('active');

            // Create Aya Link
            const a = document.createElement('a');
            a.href = `#${aya.aya_id}`;
            a.className = 'aya_link';
            a.dataset.sura = aya.sura_id;
            a.dataset.aya = aya.aya_id;

            // Add segments
            aya.segs.forEach(seg => {
                if (seg.w !== 0 && seg.w < 15) return;
                if (seg.x < 15) {
                    seg.w += seg.x;
                    seg.x = 0;
                }

                const div = document.createElement('div');
                Object.assign(div.style, {
                    top: `${seg.y}px`,
                    left: `${seg.x}px`,
                    width: `${seg.w}px`,
                    height: `${seg.h}px`,
                    position: 'absolute' // Ensure absolute positioning
                });
                a.appendChild(div);
            });
            fragment.appendChild(a);
        });

        pageEl.appendChild(fragment);
    } catch (err) {
        console.error(err.message);
    }
}

/**
 * Load Tafseer for a specific Aya
 */
async function loadAya(sura, aya) {
    const tafEl = document.getElementById('tafseer');
    tafEl.innerHTML = 'Loading...';

    try {
        const response = await fetch(`json/aya_${sura}_${aya}.json`);
        const data = await response.json();

        const html = data.map(taf => `
            <strong>${tafseerNames[taf.type] || 'Tafseer'}</strong><br>
            ${taf.text}
            <hr>
        `).join('');

        tafEl.innerHTML = html;
    } catch (err) {
        console.error('Failed to load Tafseer:', err);
        tafEl.innerHTML = 'Error loading translation.';
    }
}

// --- Event Handlers ---

document.addEventListener('click', (event) => {
    // Sura Link Clicked
    const suraLink = event.target.closest('.sura_link');
    if (suraLink) {
        event.preventDefault();
        loadPage(parseInt(suraLink.dataset.page));
        return;
    }

    // Aya Link Clicked
    const ayaLink = event.target.closest('.aya_link');
    if (ayaLink) {
        event.preventDefault();
        document.querySelectorAll('.aya_link').forEach(el => el.classList.remove('active'));
        ayaLink.classList.add('active');
        loadAya(ayaLink.dataset.sura, ayaLink.dataset.aya);
        return;
    }

    // Page Control Buttons
    const controlBtn = event.target.closest('.control__button');
    if (controlBtn) {
        event.preventDefault();
        const offset = parseInt(controlBtn.dataset.offset) || 0;
        loadPage(parseInt(currentPage) + offset);
    }
});

// Keyboard Navigation
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        loadPage(parseInt(currentPage) - 1);
    } else if (event.key === 'ArrowLeft') {
        loadPage(parseInt(currentPage) + 1);
    }
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Vanilla JS App Started!');
    loadSuras();
    loadPage(1);
});