var googleAPIKey = "AIzaSyApC_HmnBEAvRsbJdOI__0QIfXjbtebdwY";
var searchTerm = $("#search-input");
var submitBtn = $('#submit-button');
var searchResults = $("#search-results");

function formSubmission (event) {
    event.preventDefault()

    var searchInput = searchTerm.val().trim();
    console.log(searchInput);
    if (searchInput) {
        getData(searchInput);
    } else {
        alert('Please enter a search term');
    }
}

var getData = function (searchInput) {

    var searchInputArray = searchInput.split(" ");
    var searchInputAPI = searchInputArray[0];

    searchResults.empty();

    for (let index = 1; index < searchInputArray.length; index++) {
        searchInputAPI = searchInputAPI + "+" + searchInputArray[index];
    }

    var apiURL = 'https://openlibrary.org/search.json?q=' + searchInputAPI + '&limit=10';

    fetch(apiURL)
        .then(function (response) {
            if (response.ok) {
                console.log(response);
                response.json().then( function (data) {
                    console.log(data);

                    displayResults(data);
                });
            } else {
                alert ('Error: ' + response.statusText);
            }
        })
};

var displayResults = function(data) {

    for (let index = 0; index < 10; index++) {

        var resultsCard = $('<div>');

        var bookTitle = $('<a>');
        bookTitle.text("Title: " + data.docs[index].title);

        var bookTitleArray = data.docs[index].title.split(" ");
        var bookTitleURL = bookTitleArray[0];

        for (let index = 1; index < bookTitleArray.length; index++) {
            bookTitleURL = bookTitleURL + "+" + bookTitleArray[index];
        }

        bookTitle.attr('href', './Search-Display.html?title=' + bookTitleURL);

        var bookAuthor = $('<h3>');
        bookAuthor.text("Author: " + data.docs[index].author_name);

        var bookBorrow = $('<p>');
        bookBorrow.text(data.docs[index].ebook_access);

        resultsCard.append(bookTitle);
        resultsCard.append(bookAuthor);
        resultsCard.append(bookBorrow);

        searchResults.append(resultsCard);
    }
};

submitBtn.on("click", formSubmission);