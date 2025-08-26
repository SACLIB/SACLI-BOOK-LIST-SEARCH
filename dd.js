let books = [];

const sheetUrl = "https://docs.google.com/spreadsheets/d/1kNUtwm8mg-3VsmqFXeGDmf5tHF-jDmSpnUA3uliRnO8/export?format=csv&gid=0";

// Helper function to parse CSV safely
function parseCSV(text) {
  const rows = [];
  let insideQuotes = false;
  let row = [];
  let cell = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
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

async function loadBooks() {
  try {
    const response = await fetch(sheetUrl);
    const text = await response.text();

    const parsed = parseCSV(text);

    books = parsed
      .slice(1)
      .filter(row => row.length >= 6)
      .map(row => ({
        title: row[0].trim(),
        author: row[1].trim(),
        publisher: row[2].trim(),
        copyright: row[3].trim(),
        edition: row[4].trim(),
        copies: row[5].trim(),
      }));

    document.getElementById("searchBtn").disabled = false;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

loadBooks();

function showLoading(show) {
  const loadingDiv = document.getElementById("loading");
  loadingDiv.style.display = show ? "block" : "none";
}

function searchBooks() {
  const query = document.getElementById("searchBox").value.trim().toLowerCase();
  const tbody = document.querySelector("#resultsTable tbody");

  showLoading(true);
  tbody.innerHTML = "";

  if (!query) {
    showLoading(false);
    tbody.innerHTML = `
      <tr><td colspan="6" class="placeholder">No results yet. Please enter a search query.</td></tr>
    `;
    return;
  }

  setTimeout(() => {
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.publisher.toLowerCase().includes(query) ||
      book.edition.toLowerCase().includes(query) ||
      book.copies.toLowerCase().includes(query)
    );

    showLoading(false);

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="6" class="placeholder">No results found.</td></tr>
      `;
    } else {
      filtered.forEach(book => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.publisher}</td>
          <td>${book.copyright}</td>
          <td>${book.edition}</td>
          <td>${book.copies}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }, 300);
}

// Autocomplete functionality
const searchBox = document.getElementById("searchBox");
const suggestionsBox = document.getElementById("suggestions");

searchBox.addEventListener("input", () => {
  const query = searchBox.value.trim().toLowerCase();
  suggestionsBox.innerHTML = "";
  suggestionsBox.style.display = "none";

  if (!query) return;

  const suggestions = new Set();

  books.forEach(book => {
    if (book.title.toLowerCase().includes(query)) suggestions.add(book.title);
    if (book.author.toLowerCase().includes(query)) suggestions.add(book.author);
    if (book.publisher.toLowerCase().includes(query)) suggestions.add(book.publisher);
  });

  const matches = Array.from(suggestions).slice(0, 10);

  if (matches.length > 0) {
    suggestionsBox.style.display = "block";
    matches.forEach(match => {
      const div = document.createElement("div");
      div.textContent = match;
      div.addEventListener("click", () => {
        searchBox.value = match;
        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "none";
        searchBooks();
      });
      suggestionsBox.appendChild(div);
    });
  }
});

document.addEventListener("click", (e) => {
  if (e.target !== searchBox && e.target.parentNode !== suggestionsBox) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "none";
  }
});

// Search on Enter key press
searchBox.addEventListener("keypress", e => {
  if (e.key === "Enter") searchBooks();
});
