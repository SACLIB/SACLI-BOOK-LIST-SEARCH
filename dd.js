let books = [];

const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQU2jtuP__kcX5CGnotJ3s9GX2EQm2Ik11pHRIxFQs5WY_ExeQkDVBNlUP9GN8sGdpSH-ULBU6Zv2U3/pub?output=csv";

async function loadBooks() {
  try {
    const response = await fetch(sheetUrl);
    const text = await response.text();

    books = text
      .split("\n")
      .slice(1)
      .map(row => row.split(","))
      .filter(row => row.length >= 5)
      .map(row => ({
        title: row[0].trim(),
        author: row[1].trim(),
        publisher: row[2].trim(),
        copyright: row[3].trim(),
        edition: row[4].trim()
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
  
  // Show loading spinner
  showLoading(true);

  // Clear previous results immediately
  tbody.innerHTML = "";

  if (!query) {
    showLoading(false);
    tbody.innerHTML = `
      <tr><td colspan="5" class="placeholder">No results yet. Please enter a search query.</td></tr>
    `;
    return;
  }

  // Delay para makita ang spinner kahit mabilis ang filter
  setTimeout(() => {
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.publisher.toLowerCase().includes(query) ||
      book.edition.toLowerCase().includes(query)
    );

    showLoading(false);

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="5" class="placeholder">No results found.</td></tr>
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
        `;
        tbody.appendChild(tr);
      });
    }
  }, 300); // 300ms delay para may loading effect
}

// Search on Enter key press
document.getElementById("searchBox").addEventListener("keypress", e => {
  if (e.key === "Enter") searchBooks();
});

// Search on button click
document.getElementById("searchBtn").addEventListener("click", searchBooks);

// Optional: Search while typing (comment out kung ayaw mo ng auto search habang nagta-type)
// document.getElementById("searchBox").addEventListener("input", searchBooks);
