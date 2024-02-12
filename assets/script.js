var searchInput = document.getElementById("search-input");
var searchResults = document.getElementById("books");
localStorage.setItem('user', 'books');


function addBooks() {
    var userInput = document.getElementById('books').value;
    if (userInput) {
    var books = JSON.parse(localStorage.getItem('books')) || [];
    books.push(userInput);
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
  } 
}

function displayBooks() {
    var books = JSON.parse(localStorage.getItem('books'));
    var booksElement = document.getElementById('localStorage');
    
}

displayBooks();

searchInput.addEventListener("input", handleSearch);

function handleSearch() {
    var searchTerm = searchInput.value.toLowerCase();
    var filteredBooks = books.filter(book => book.toLowerCase().includes(searchTerm));
    searchResults.innerHTML = "";
    filteredBooks.forEach(book => {
        var li = document.createElement("li");
        li.textContent = book;
        searchResults.appendChild(li);
    });
}