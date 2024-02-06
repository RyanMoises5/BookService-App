const bookNames = [
    "The Art Of War",
    "48 Laws of Power",
    "The Great Gatsby",
   
];

const searchInput = document.getElementById("#search-input");
const searchResults = document.getElementById("#search-results");
localStorage.setItem("myBooks", "")

searchInput.addEventListener("input", handleSearch);

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredBooks = bookNames.filter(book => book.toLowerCase().includes(searchTerm));

    
    searchResults.innerHTML = "";

  
    filteredBooks.forEach(book => {
        const li = document.createElement("li");
        li.textContent = book;
        searchResults.appendChild(li);
    });
}