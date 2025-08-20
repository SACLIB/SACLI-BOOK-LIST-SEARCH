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
        edition: row[4].trim(),
        isbn: row[5].trim()
      }));

    // Enable search button kapag tapos na mag-load
    document.getElementById("searchBtn").disabled = false;

  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

loadBooks();

function searchBooks() {
  const query = document.getElementById("searchBox").value.trim().toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (query === "") {
    resultsDiv.classList.add("hidden");
    return;
  }

  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.publisher.toLowerCase().includes(query) ||
    book.copyright.toLowerCase().includes(query) ||
    book.edition.toLowerCase().includes(query) ||
    book.isbn.toLowerCase().includes(query)
  );

  resultsDiv.classList.remove("hidden");

  if (filtered.length > 0) {
    filtered.forEach(book => {
      const div = document.createElement("div");
      div.classList.add("book");
      div.textContent = `${book.title} by ${book.author} | Publisher: ${book.publisher} | Copyright: ${book.copyright} | Edition: ${book.edition} | ISBN: ${book.isbn}`;
      resultsDiv.appendChild(div);
    });
  } else {
    resultsDiv.textContent = "No results found.";
  }
}

// 🔑 Search when Enter is pressed in the search box
document.getElementById("searchBox").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    searchBooks();
  }
});


