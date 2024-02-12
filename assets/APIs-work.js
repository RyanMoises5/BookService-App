var googleAPIKey = "AIzaSyApC_HmnBEAvRsbJdOI__0QIfXjbtebdwY";
var searchTerm = $("#search-input");
var submitBtn = $('#submit-button');
var searchResults = $("#search-results");
var searchCategory = $('#books');
var containerNYT = $('#NYT-container');
var loadNYT = $('#NYT-list');
var loadLocalStorage = $('#local-storage');
var eraseLocalStorage = $('#clear-storage');
var saveList = $('#save-list');

var dataNYTGlobal;
var saveListItems = [];

var formSubmission = function (event) {
    event.preventDefault()

    var searchInput = searchTerm.val().trim();

    if (searchInput) {
        getData(searchInput);
    } else {
        alert('Please enter a search term');
    }
};

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
};

var displayResults = function(data) {

    var savedHeader = $('<h2>')
    savedHeader.text('Showing Search Results:')

    searchResults.append(savedHeader);

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

        var bookSave = $('<button>');
        bookSave.text("Save this item");
        bookSave.addClass('save-button');
        bookSave.attr('index', index);
        bookSave.attr('data-title', bookTitle.text());
        bookSave.attr('data-author', bookAuthor.text());
        bookSave.attr('data-search', searchDisplayQuery);
        bookSave.attr('data-img', bookImg.attr('src'));

        resultsCard.append(bookTitle);
        resultsCard.append(bookAuthor);
        resultsCard.append(bookImg);
        resultsCard.append('<br>');
        resultsCard.append(bookSave);

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
};

var loadNYTGenres = function (dataNYT) {

    searchResults.empty();
    containerNYT.empty();

    var bestSellersDate = $('<h4>');
    bestSellersDate.text("Latest Publication Date: " + dataNYT.results.bestsellers_date);
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
};

var loadGenreBooks = function (event) {

    searchResults.empty();

    var savedHeader = $('<h2>')
    savedHeader.text('Showing NYT List:')

    searchResults.append(savedHeader);

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
        var NYTReviewNote = $('<p>');
        if (findGenre.books[index].book_review_link) {
            NYTReview = findGenre.books[index].book_review_link;
            NYTReviewNote.text("NYT Review Available");
        } else if (findGenre.books[index].sunday_review_link) {
            NYTReview = findGenre.books[index].sunday_review_link;
            NYTReviewNote.text("NYT Review Available");
        };

        var searchDisplayQuery = './Search-Display.html?title=' + bookTitleURL + '&author=' + bookAuthorURL + '&NYTReview=' + NYTReview;

        bookTitle.attr('href', searchDisplayQuery);

        var bookDesc = $('<p>');
        bookDesc.text(findGenre.books[index].description);

        var bookWeeks = $('<p>');
        bookWeeks.text("Weeks on list: " + findGenre.books[index].weeks_on_list);

        var bookSave = $('<button>');
        bookSave.text("Save this item");
        bookSave.addClass('save-button');
        bookSave.attr('index', index);
        bookSave.attr('data-title', bookTitle.text());
        bookSave.attr('data-author', bookAuthor.text());
        bookSave.attr('data-search', searchDisplayQuery);
        bookSave.attr('data-img', bookImg.attr('src'));

        resultsCard.append(bookTitle);
        resultsCard.append(bookAuthor);
        resultsCard.append(bookImg);
        resultsCard.append(bookDesc);
        resultsCard.append(bookWeeks);
        resultsCard.append(NYTReviewNote);
        resultsCard.append(bookSave);

        searchResults.append(resultsCard);
    }
};

var loadSaveList = function (event) {
    var saveData = JSON.parse(localStorage.getItem("savedItems"));

    if (saveData !== null) {
        saveListItems = saveData;
    };

    renderSavedEntries(saveListItems);
};

var renderSavedEntries = function (saveListItems) {
    
    searchResults.empty();
    containerNYT.empty();

    var savedHeader = $('<h2>')
    savedHeader.text('Showing User List:')

    searchResults.append(savedHeader);

    for (let index = 0; index < saveListItems.length; index++) {
        var resultsCard = $('<div>');

        var bookImg = $('<img>');
        bookImg.attr('src', saveListItems[index].img);
        bookImg.css({'max-width':'150px','max-height':'150px'});

        var bookTitle = $('<a>');
        bookTitle.text(saveListItems[index].title);
        bookTitle.attr('href', (saveListItems[index].search));

        var bookAuthor = $('<h3>');
        bookAuthor.text(saveListItems[index].author);

        resultsCard.append(bookTitle);
        resultsCard.append(bookAuthor);
        resultsCard.append(bookImg);

        searchResults.append(resultsCard);
        searchResults.append('<br>');
    }
};

var saveEntry = function (event) {

    var saveDetails = {
        title: event.target.dataset.title,
        author: event.target.dataset.author,
        search: event.target.dataset.search,
        img: event.target.dataset.img,
    };

    saveListItems.push(saveDetails);

    localStorage.setItem('savedItems', JSON.stringify(saveListItems));
};

var eraseSaveList = function () {

    saveListItems = [];
    localStorage.setItem("savedItems", JSON.stringify(saveListItems));
};

submitBtn.on("click", formSubmission);

loadNYT.on("click", loadNYTList);
containerNYT.on("click", '.genre', loadGenreBooks);

loadLocalStorage.on("click", loadSaveList);
eraseLocalStorage.on('click', eraseSaveList);
searchResults.on("click", '.save-button', saveEntry);