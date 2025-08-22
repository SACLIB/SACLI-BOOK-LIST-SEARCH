let books = [];

const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQU2jtuP__kcX5CGnotJ3s9GX2EQm2Ik11pHRIxFQs5WY_ExeQkDVBNlUP9GN8sGdpSH-ULBU6Zv2U3/pub?output=csv";

async function loadBooks() {
  try {
    const response = await fetch(sheetUrl);
    const data = await response.text();

    const rows = data.split("\n").map(row => row.split(","));

    books = rows.slice(1)
      .filter(row => row.length >= 6)
      .map(row => ({
        title: row[0].trim(),
        author: row[1].trim(),
        publisher: row[2].trim(),
        copyright: row[3].trim(),
        edition: row[4].trim()
      }));

    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) {
      searchBtn.disabled = false;
    }

  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

loadBooks();

function searchBooks() {
  const query = document.getElementById("searchBox").value.trim().toLowerCase();
  const resultsDiv = document.getElementById("results");
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";

  if (query === "") {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; font-style: italic; color: #666;">
          No results yet. Please enter a search query.
        </td>
      </tr>
    `;
    resultsDiv.style.display = "block";
    return;
  }

  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.publisher.toLowerCase().includes(query) ||
    book.copyright.toLowerCase().includes(query) ||
    book.edition.toLowerCase().includes(query)
  );

  if (filtered.length > 0) {
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
  } else {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; font-style: italic; color: #666;">
          No results found.
        </td>
      </tr>
    `;
  }

  resultsDiv.style.display = "block";
}

// Enter key triggers search
document.getElementById("searchBox").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    searchBooks();
  }
});

