var googleAPIKey = "AIzaSyApC_HmnBEAvRsbJdOI__0QIfXjbtebdwY";
var searchTerm = $("#search-input");
var submitBtn = $('#submit-button');
var searchResults = $("#search-results");
var searchCategory = $('#books');
var containerNYT = $('#NYT-container');
var loadNYT = $('#NYT-list');
var dataNYTGlobal;

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
    containerNYT.empty();

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
        bookTitle.text(data.docs[index].title);
        var bookTitleArray = data.docs[index].title.split(" ");
        var bookTitleURL = bookTitleArray[0];
        for (let index = 1; index < bookTitleArray.length; index++) {
            bookTitleURL = bookTitleURL + "+" + bookTitleArray[index];
        };

        var searchDisplayQuery = './Search-Display.html?title=' + bookTitleURL;

        var bookAuthor = $('<h3>');
        var bookAuthorURL;
        if (data.docs[index].author_name) {
            var bookAuthorAll = data.docs[index].author_name[0];
            for (let indexAuthor = 1; indexAuthor < data.docs[index].author_name.length; indexAuthor++) {
                bookAuthorAll = bookAuthorAll + ", " + data.docs[index].author_name[indexAuthor];
            };
            bookAuthor.text("By: " + bookAuthorAll);

            var bookAuthorArray = data.docs[index].author_name[0].split(" ");
            bookAuthorURL = bookAuthorArray[0];
            for (let index = 1; index < bookAuthorArray.length; index++) {
                bookAuthorURL = bookAuthorURL + "+" + bookAuthorArray[index];
            };

            searchDisplayQuery = searchDisplayQuery + '&author=' + bookAuthorURL;

        } else {
            bookAuthor.text("By: Unlisted");
        }

        bookTitle.attr('href', searchDisplayQuery);

        var bookImg = $('<img>');
        var coverURL = data.docs[index].cover_edition_key;
        bookImg.attr('src', "https://covers.openlibrary.org/b/olid/" + coverURL + "-M.jpg");
        bookImg.css({'max-width':'150px','max-height':'150px'});

        var bookBorrow = $('<p>');
        bookBorrow.text(data.docs[index].ebook_access);

        resultsCard.append(bookTitle);
        resultsCard.append(bookAuthor);
        resultsCard.append(bookImg);
        // resultsCard.append(bookBorrow);

        searchResults.append(resultsCard);
    };
};

var loadNYTList = function () {

    var apiNYT = "https://api.nytimes.com/svc/books/v3/lists/full-overview.json?api-key=QufXlA6hoaa3M0mhKCFopThskTA8qxG3"

    fetch(apiNYT)
        .then(function (response) {
            if (response.ok) {
                console.log(response);
                response.json().then( function (dataNYT) {
                    console.log(dataNYT);
                    dataNYTGlobal = dataNYT;
                    
                    loadNYTGenres(dataNYT);
                });
            } else {
                alert ('Error: ' + response.statusText);
            }
        });
}

var loadNYTGenres = function (dataNYT) {

    searchResults.empty();
    containerNYT.empty();

    var bestSellersDate = $('<h3>');
    bestSellersDate.text("Latest Bestseller List Publication Date: " + dataNYT.results.bestsellers_date);
    containerNYT.append(bestSellersDate);

    var NYTGenreList = $('<select>');
    NYTGenreList.attr('id', 'nyt-genre');
    NYTGenreList.addClass('genre');
    containerNYT.append(NYTGenreList);

    for (let index = 0; index < dataNYT.results.lists.length; index++) {
        var NYTEl = $('<option>');
        NYTEl.text(dataNYT.results.lists[index].list_name);
        NYTEl.attr('value', dataNYT.results.lists[index].list_name_encoded);
        NYTGenreList.append(NYTEl);
    }
}

var loadGenreBooks = function (event) {

    searchResults.empty();

    var targetGenre = event.target.value;
    var findGenre = dataNYTGlobal.results.lists.find(function(genre) {
        return genre.list_name_encoded === targetGenre;
    });

    for (let index = 0; index < findGenre.books.length; index++) {
        var resultsCard = $('<div>');
        
        var bookImg = $('<img>');
        bookImg.attr('src', findGenre.books[index].book_image);
        bookImg.css({'max-width':'150px','max-height':'150px'});

        var bookTitle = $('<a>');
        bookTitle.text(findGenre.books[index].title);

        var bookAuthor = $('<h3>');
        bookAuthor.text("By: " + findGenre.books[index].author);

        var bookTitleArray = findGenre.books[index].title.split(" ");
        var bookTitleURL = bookTitleArray[0];
        for (let index = 1; index < bookTitleArray.length; index++) {
            bookTitleURL = bookTitleURL + "+" + bookTitleArray[index];
        };

        var findGenreAuthorFirst;
        if (findGenre.books[index].author.includes('with')) {
            var findGenreAuthorSplit = findGenre.books[index].author.split('with');
            findGenreAuthorFirst = findGenreAuthorSplit[0];
        } else if (findGenre.books[index].author.includes('and')) {
            var findGenreAuthorSplit = findGenre.books[index].author.split('and');
            findGenreAuthorFirst = findGenreAuthorSplit[0];
        } else {
            findGenreAuthorFirst = findGenre.books[index].author;
        }; 
        var findGenreAuthorFirstTrim = findGenreAuthorFirst.trim();
        var findGenreAuthorFirstArray = findGenreAuthorFirstTrim.split(" ");

        var bookAuthorURL = findGenreAuthorFirstArray[0];
        for (let index = 1; index < findGenreAuthorFirstArray.length; index++) {
            bookAuthorURL = bookAuthorURL + "+" + findGenreAuthorFirstArray[index];
        };

        var NYTReview = 'False';
        if (findGenre.books[index].book_review_link) {
            NYTReview = findGenre.books[index].book_review_link;
        } else if (findGenre.books[index].sunday_review_link) {
            NYTReview = findGenre.books[index].sunday_review_link;
        };

        bookTitle.attr('href', './Search-Display.html?title=' + bookTitleURL + '&author=' + bookAuthorURL + '&NYTReview=' + NYTReview);

        var bookDesc = $('<p>');
        bookDesc.text(findGenre.books[index].description);

        var bookWeeks = $('<p>');
        bookWeeks.text("Weeks on list: " + findGenre.books[index].weeks_on_list);

        resultsCard.append(bookTitle);
        resultsCard.append(bookAuthor);
        resultsCard.append(bookImg);
        resultsCard.append(bookDesc);
        resultsCard.append(bookWeeks);

        searchResults.append(resultsCard);
    }
}

loadNYT.on("click", loadNYTList);
containerNYT.on("click", '.genre', loadGenreBooks);

submitBtn.on("click", formSubmission);