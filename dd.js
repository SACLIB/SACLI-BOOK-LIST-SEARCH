// ===================== GLOBAL VARIABLES =====================
let currentSection = 'home'; // 'home', 'journal', 'ebook', 'thesis', 'openAccess'
let books = [];
let journals = [];
let ebooks = [];
let theses = [];
let openAccessLinks = [];

// ===================== CSV PARSER =====================
function parseCSV(text) {
    const rows = [];
    let insideQuotes = false;
    let row = [];
    let cell = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') insideQuotes = !insideQuotes;
        else if (char === ',' && !insideQuotes) {
            row.push(cell);
            cell = '';
        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += char;
        }
    }
    if (cell !== '' || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }
    return rows;
}

// ===================== CSV URLs =====================
const bookSheetUrl = "https://docs.google.com/spreadsheets/d/1kNUtwm8mg-3VsmqFXeGDmf5tHF-jDmSpnUA3uliRnO8/export?format=csv&gid=0";
const journalSheetUrl = "https://docs.google.com/spreadsheets/d/1kNUtwm8mg-3VsmqFXeGDmf5tHF-jDmSpnUA3uliRnO8/export?format=csv&gid=771760540";
const ebookSheetUrl = "https://docs.google.com/spreadsheets/d/1kNUtwm8mg-3VsmqFXeGDmf5tHF-jDmSpnUA3uliRnO8/export?format=csv&gid=1401514084";
const thesisSheetUrl = "https://docs.google.com/spreadsheets/d/1kNUtwm8mg-3VsmqFXeGDmf5tHF-jDmSpnUA3uliRnO8/export?format=csv&gid=900816633"; // Replace with your Thesis CSV link

// ===================== LOAD DATA =====================
async function loadBooks() {
    try {
        const res = await fetch(bookSheetUrl);
        const text = await res.text();
        const parsed = parseCSV(text);
        books = [];
        openAccessLinks = [];
        parsed.slice(1).forEach(row => {
            if (row.length >= 6) books.push({
                title: row[0].trim(),
                author: row[1].trim(),
                publisher: row[2].trim(),
                copyright: row[3].trim(),
                edition: row[4].trim(),
                copies: row[5].trim()
            });
            if (row.length >= 8 && row[6].trim() && row[7].trim()) openAccessLinks.push({
                name: row[6].trim(),
                url: row[7].trim()
            });
        });
    } catch (err) {
        console.error("Error loading books:", err);
    }
}

async function loadJournals() {
    try {
        const res = await fetch(journalSheetUrl);
        const text = await res.text();
        const parsed = parseCSV(text);
        journals = [];
        parsed.slice(1).forEach(row => {
            if (row.length >= 6) journals.push({
                title: row[0].trim(),
                author: row[1].trim(),
                frequency: row[2].trim(),
                copyright: row[3].trim(),
                volume: row[4].trim(),
                issue: row[5].trim()
            });
        });
    } catch (err) {
        console.error("Error loading journals:", err);
    }
}

async function loadEbooks() {
    try {
        const res = await fetch(ebookSheetUrl);
        const text = await res.text();
        const parsed = parseCSV(text);
        ebooks = [];
        parsed.slice(1).forEach(row => {
            if (row.length >= 3) ebooks.push({
                title: row[0].trim(),
                author: row[1].trim(),
                copyright: row[2].trim()
            });
        });
    } catch (err) {
        console.error("Error loading e-books:", err);
    }
}

async function loadTheses() {
    try {
        const res = await fetch(thesisSheetUrl);
        const text = await res.text();
        const parsed = parseCSV(text);
        theses = [];
        parsed.slice(1).forEach(row => {
            if (row.length >= 4) theses.push({
                title: row[0].trim(),
                author: row[1].trim(),
                number: row[2].trim(),
                copyright: row[3].trim()
            });
        });
    } catch (err) {
        console.error("Error loading theses:", err);
    }
}

// Load all data
loadBooks();
loadJournals();
loadEbooks();
loadTheses();

// ===================== SECTION DISPLAY =====================
function hideAllSections() {
    const sections = ['results', 'journalResults', 'ebooksResults', 'thesisResults', 'openAccessSection'];
    sections.forEach(id => document.getElementById(id).style.display = 'none');
}

function showSection(section) {
    hideAllSections();
    currentSection = section;
    const searchDisabled = (section === 'openAccess');
    document.getElementById('searchBox').disabled = searchDisabled;
    document.getElementById('searchBtn').disabled = searchDisabled;

    switch(section) {
        case 'home': document.getElementById('results').style.display = 'block'; break;
        case 'journal': document.getElementById('journalResults').style.display = 'block'; break;
        case 'ebook': document.getElementById('ebooksResults').style.display = 'block'; break;
        case 'thesis': document.getElementById('thesisResults').style.display = 'block'; break;
        case 'openAccess': document.getElementById('openAccessSection').style.display = 'block'; break;
    }
}

// Assign to global scope for HTML onclick
window.showHome = () => showSection('home');
window.showJournalResults = () => showSection('journal');
window.showEbooks = () => showSection('ebook');
window.showTheses = () => showSection('thesis');
window.toggleOpenAccess = () => showSection('openAccess');

// ===================== SEARCH FUNCTIONS =====================
function searchBooks() {
    const query = document.getElementById('searchBox').value.trim().toLowerCase();
    const tbody = document.querySelector('#resultsTable tbody');
    tbody.innerHTML = `<tr><td colspan="6" class="spinner-cell"><div class="spinner"></div></td></tr>`;

    setTimeout(() => {
        if(!query) tbody.innerHTML = `<tr><td colspan="6" class="placeholder">Please enter a search query.</td></tr>`;
        else {
            const results = books.filter(b => 
                b.title.toLowerCase().includes(query) ||
                b.author.toLowerCase().includes(query) ||
                b.publisher.toLowerCase().includes(query) ||
                b.edition.toLowerCase().includes(query) ||
                b.copies.toLowerCase().includes(query)
            );
            tbody.innerHTML = results.length === 0
                ? `<tr><td colspan="6" class="placeholder">No results found for "${query}".</td></tr>`
                : results.map(b => `<tr>
                    <td>${b.title}</td><td>${b.author}</td><td>${b.publisher}</td>
                    <td>${b.copyright}</td><td>${b.edition}</td><td>${b.copies}</td>
                </tr>`).join('');
        }
    }, 300);
}

function searchJournals() {
    const query = document.getElementById('searchBox').value.trim().toLowerCase();
    const tbody = document.querySelector('#journalTable tbody');
    tbody.innerHTML = `<tr><td colspan="6" class="spinner-cell"><div class="spinner"></div></td></tr>`;

    setTimeout(() => {
        if(!query) tbody.innerHTML = `<tr><td colspan="6" class="placeholder">Please enter a search query.</td></tr>`;
        else {
            const results = journals.filter(j => 
                j.title.toLowerCase().includes(query) ||
                j.author.toLowerCase().includes(query) ||
                j.frequency.toLowerCase().includes(query) ||
                j.volume.toLowerCase().includes(query) ||
                j.issue.toLowerCase().includes(query)
            );
            tbody.innerHTML = results.length === 0
                ? `<tr><td colspan="6" class="placeholder">No journal results found for "${query}".</td></tr>`
                : results.map(j => `<tr>
                    <td>${j.title}</td><td>${j.author}</td><td>${j.frequency}</td>
                    <td>${j.copyright}</td><td>${j.volume}</td><td>${j.issue}</td>
                </tr>`).join('');
        }
    }, 300);
}

function searchEbooks() {
    const query = document.getElementById('searchBox').value.trim().toLowerCase();
    const tbody = document.querySelector('#ebooksTable tbody');
    tbody.innerHTML = `<tr><td colspan="3" class="spinner-cell"><div class="spinner"></div></td></tr>`;

    setTimeout(() => {
        if(!query) tbody.innerHTML = `<tr><td colspan="3" class="placeholder">Please enter a search query.</td></tr>`;
        else {
            const results = ebooks.filter(e => 
                e.title.toLowerCase().includes(query) ||
                e.author.toLowerCase().includes(query)
            );
            tbody.innerHTML = results.length === 0
                ? `<tr><td colspan="3" class="placeholder">No e-book results found for "${query}".</td></tr>`
                : results.map(e => `<tr>
                    <td>${e.title}</td><td>${e.author}</td><td>${e.copyright}</td>
                </tr>`).join('');
        }
    }, 300);
}

function searchTheses() {
    const query = document.getElementById('searchBox').value.trim().toLowerCase();
    const tbody = document.querySelector('#thesisTable tbody');
    tbody.innerHTML = `<tr><td colspan="4" class="spinner-cell"><div class="spinner"></div></td></tr>`;

    setTimeout(() => {
        if(!query) tbody.innerHTML = `<tr><td colspan="4" class="placeholder">Please enter a search query.</td></tr>`;
        else {
            const results = theses.filter(t => 
                t.title.toLowerCase().includes(query) ||
                t.author.toLowerCase().includes(query) ||
                t.number.toLowerCase().includes(query)
            );
            tbody.innerHTML = results.length === 0
                ? `<tr><td colspan="4" class="placeholder">No thesis results found for "${query}".</td></tr>`
                : results.map(t => `<tr>
                    <td>${t.title}</td><td>${t.author}</td><td>${t.number}</td><td>${t.copyright}</td>
                </tr>`).join('');
        }
    }, 300);
}

// ===================== SEARCH DISPATCHER =====================
function dispatchSearch() {
    switch(currentSection) {
        case 'home': searchBooks(); break;
        case 'journal': searchJournals(); break;
        case 'ebook': searchEbooks(); break;
        case 'thesis': searchTheses(); break;
        case 'openAccess': break; // search disabled
    }
}

// ===================== EVENT LISTENERS =====================
document.getElementById('searchBtn').addEventListener('click', dispatchSearch);
document.getElementById('searchBox').addEventListener('keypress', e => {
    if(e.key === 'Enter') dispatchSearch();
});
