var googleAPIKey = "AIzaSyApC_HmnBEAvRsbJdOI__0QIfXjbtebdwY";
var searchTerm = $("#search-input");
var submitBtn = $('#submit-button');
var searchResults = $("#search-results");
var searchCategory = $('#books');

function formSubmission (event) {
    event.preventDefault()

    var searchInput = searchTerm.val().trim();

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

    if (searchCategory.val() === "title") {
        apiURL = 'https://openlibrary.org/search.json?title=' + searchInputAPI + '&limit=10';
    } else if (searchCategory.val() === "author") {
        apiURL = 'https://openlibrary.org/search.json?author=' + searchInputAPI + '&limit=10';
    } else if (searchCategory.val() === "isbn") {
        apiURL = 'https://openlibrary.org/isbn/' + searchInputAPI + '.json';
    } else {
        apiURL = 'https://openlibrary.org/search.json?q=' + searchInputAPI + '&limit=10';
    }

    console.log(apiURL);

    fetch(apiURL)
        .then(function (response) {
            if (response.ok) {
                console.log(response);
                response.json().then( function (data) {
                    console.log("Check 1");
                    console.log(data);

                    if (searchCategory.val() === "isbn") {
                        ISBNToTitleAuthor(data);
                    } else {
                        displayResults(data);
                    }

                });
            } else {
                alert ('Error: ' + response.statusText);
            }
        })
};

var ISBNToTitleAuthor = function(data) {                        
        var ISBNTitleArray = data.title.split(" ");
        var ISBNTitle = ISBNTitleArray[0];

        for (let index = 1; index < ISBNTitleArray.length; index++) {
            ISBNTitle = ISBNTitle + "+" + ISBNTitleArray[index];
        }

        var ISBNAuthor = data.authors[0].key.split("/")[2];

        var apiURLI = 'https://openlibrary.org/search.json?q=' + ISBNTitle + '&author=' + ISBNAuthor;

        fetch(apiURLI)
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
        });
}

var displayResults = function(data) {

    for (let index = 0; index < data.docs.length; index++) {

        var resultsCard = $('<div>');

        var bookTitle = $('<a>');
        bookTitle.text("Title: " + data.docs[index].title);

        var bookAuthor = $('<h3>');
        var bookAuthorAll = data.docs[index].author_name[0];
        for (let indexAuthor = 1; indexAuthor < data.docs[index].author_name.length; indexAuthor++) {
            bookAuthorAll = bookAuthorAll + ", " + data.docs[index].author_name[indexAuthor];
        };
        bookAuthor.text("Author: " + bookAuthorAll);

        var bookTitleArray = data.docs[index].title.split(" ");
        var bookTitleURL = bookTitleArray[0];
        for (let index = 1; index < bookTitleArray.length; index++) {
            bookTitleURL = bookTitleURL + "+" + bookTitleArray[index];
        };

        var bookAuthorArray = data.docs[index].author_name[0].split(" ");
        var bookAuthorURL = bookAuthorArray[0];
        for (let index = 1; index < bookAuthorArray.length; index++) {
            bookAuthorURL = bookAuthorURL + "+" + bookAuthorArray[index];
        };

        bookTitle.attr('href', './Search-Display.html?title=' + bookTitleURL + '&author=' + bookAuthorURL);

        var bookBorrow = $('<p>');
        bookBorrow.text(data.docs[index].ebook_access);

        resultsCard.append(bookTitle);
        resultsCard.append(bookAuthor);
        // resultsCard.append(bookBorrow);

        searchResults.append(resultsCard);
    };
};

submitBtn.on("click", formSubmission);