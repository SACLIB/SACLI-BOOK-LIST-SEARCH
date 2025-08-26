let books = [];

const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQU2jtuP__kcX5CGnotJ3s9GX2EQm2Ik11pHRIxFQs5WY_ExeQkDVBNlUP9GN8sGdpSH-ULBU6Zv2U3/pub?output=csv";

// Helper function to parse CSV safely (handles commas inside quotes)
function parseCSV(text) {
  const rows = [];
  let insideQuotes = false;
  let row = [];
  let cell = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i+1];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++; // skip CRLF
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  // Push last cell/row if exists
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
      .slice(1) // skip header row
      .filter(row => row.length >= 6) // at least 6 columns now
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

// Search on Enter key press
document.getElementById("searchBox").addEventListener("keypress", e => {
  if (e.key === "Enter") searchBooks();
});

// Search on button click
document.getElementById("searchBtn").addEventListener("click", searchBooks);



