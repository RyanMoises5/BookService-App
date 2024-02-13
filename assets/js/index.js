var googleAPIKey = "AIzaSyApC_HmnBEAvRsbJdOI__0QIfXjbtebdwY";
var searchTerm = $("#search-input");
var submitBtn = $('#submit-button');
var searchResults = $("#search-results");
var searchCategory = $('#books');
var containerNYT = $('#NYT-container');
var loadNYT = $('#NYT-list');
var loadLocalStorage = $('#local-storage');
var eraseLocalStorage = $('#clear-storage');
var modal = $('#modal');

// Note: NYT refers to New York Times

var dataNYTGlobal; // Placeholder for NYT api data to be stored so multiple fetch requests don't have to be made
var saveListItems = []; // Placeholder for local storage handling

// The following functions are used to handle the search bar:

var formSubmission = function (event) { // Confirms if there is a search bar input then calls function to do fetch request
    event.preventDefault();

    var searchInput = searchTerm.val().trim();

    if (searchInput) {
        getData(searchInput);
    } else {
        console.log('Invalid Search');
    }
};

var getData = function (searchInput) { // Uses search input for fetch request from Open Library then calls function to display the results

    var searchInputArray = searchInput.split(" "); // Processes search bar input to something that can be used for fetch request
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

    console.log("Fetch: " + apiURL);

    fetch(apiURL)  // Fetch request to Open Library
        .then(function (response) {
            if (response.ok) {
                console.log(response);
                response.json().then( function (data) {
                    console.log(data);

                    if (searchCategory.val() === "isbn") {  // Displays results or further processes a search using ISBN
                        ISBNToTitleAuthor(data);
                    } else {
                        displayResults(data);
                    }
                });
            } else {
                console.log('Error: ' + response.statusText);
            }
        })
};

var ISBNToTitleAuthor = function(data) {    // Processes a search using ISBN and takes the book title/author for a fetch request instead
        var ISBNTitleArray = data.title.split(" ");
        var ISBNTitle = ISBNTitleArray[0];

        for (let index = 1; index < ISBNTitleArray.length; index++) {
            ISBNTitle = ISBNTitle + "+" + ISBNTitleArray[index];
        }

        var ISBNAuthor = data.authors[0].key.split("/")[2];

        var apiURLI = 'https://openlibrary.org/search.json?q=' + ISBNTitle + '&author=' + ISBNAuthor;

        console.log("Fetch: " + apiURLI);

        fetch(apiURLI)
        .then(function (response) {
            if (response.ok) {
                console.log(response);
                response.json().then( function (data) {
                    console.log(data);

                    displayResults(data);   // Calls function to display results
                });
            } else {
                console.log('Error: ' + response.statusText);
            }
        });
};

var displayResults = function(data) { // Displays the results by appending a card to a container for each index from fetch request. Provides a save button as well as a functional link for each entry

    var savedHeader = $('<h2>')
    savedHeader.text('Showing Search Results:')

    searchResults.append(savedHeader);

    for (let index = 0; index < data.docs.length; index++) {

        var resultsCard = $('<div>'); // Creates new card for each new index

        var bookTitle = $('<a>');
        bookTitle.text(data.docs[index].title);
        var bookTitleArray = data.docs[index].title.split(" ");
        var bookTitleURL = bookTitleArray[0];
        for (let index = 1; index < bookTitleArray.length; index++) {
            bookTitleURL = bookTitleURL + "+" + bookTitleArray[index];
        };

        var searchDisplayQuery = './Search-Display.html?title=' + bookTitleURL; // Starts construction of URL for link to second page

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

            searchDisplayQuery = searchDisplayQuery + '&author=' + bookAuthorURL;  // If applicable, refines URL for second page

        } else {
            bookAuthor.text("By: Unlisted");
        }

        bookTitle.attr('href', searchDisplayQuery); // Implements constructed link as an attribute of the book title

        var bookImg = $('<img>');
        var coverURL = data.docs[index].cover_edition_key;
        bookImg.attr('src', "https://covers.openlibrary.org/b/olid/" + coverURL + "-M.jpg");
        bookImg.css({'max-width':'150px','max-height':'150px'});

        var bookSave = $('<button>');   // Save button tied to click event to save to local storage
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

// The following functions are used to handle the NYT API:

var loadNYTList = function () {  // Fetch request to NYT API

    var apiNYT = "https://api.nytimes.com/svc/books/v3/lists/full-overview.json?api-key=QufXlA6hoaa3M0mhKCFopThskTA8qxG3";

    console.log("Fetch: " + apiNYT);

    fetch(apiNYT)
        .then(function (response) {
            if (response.ok) {
                console.log(response);
                response.json().then( function (dataNYT) {
                    console.log(dataNYT);
                    dataNYTGlobal = dataNYT; // Stores data as global variable
                    
                    loadNYTGenres(dataNYT);  // Function to display received data
                });
            } else {
                console.log('Error: ' + response.statusText);
            }
        });
};

var loadNYTGenres = function (dataNYT) {  // Allows user to choose lists from different genres using the fetch request from NYT

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

var loadGenreBooks = function (event) { // After clicking a genre, the results for each index in that genre will append into a container

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

        var NYTReview = 'False';  // Indicates if a review from NYT is available to view
        var NYTReviewNote = $('<p>');
        if (findGenre.books[index].book_review_link) {
            NYTReview = findGenre.books[index].book_review_link;
            NYTReviewNote.text("NYT Review Available");
        } else if (findGenre.books[index].sunday_review_link) {
            NYTReview = findGenre.books[index].sunday_review_link;
            NYTReviewNote.text("NYT Review Available");
        };

        var searchDisplayQuery = './Search-Display.html?title=' + bookTitleURL + '&author=' + bookAuthorURL + '&NYTReview=' + NYTReview; // Constructs function URL for second page

        bookTitle.attr('href', searchDisplayQuery);

        var bookDesc = $('<p>');
        bookDesc.text(findGenre.books[index].description);

        var bookWeeks = $('<p>');
        bookWeeks.text("Weeks on list: " + findGenre.books[index].weeks_on_list);

        var bookSave = $('<button>');  // Save button to store information into local storage
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

// The following functions are used to handle the user save list:

var loadSaveList = function (event) {  // Loads book data from local storage and calls function to fill a container with saved books
    var saveData = JSON.parse(localStorage.getItem("savedItems"));

    if (saveData !== null) {
        saveListItems = saveData;
    };

    renderSavedEntries(saveListItems);
};

var renderSavedEntries = function (saveListItems) { // Appends a card to container for each saved item
    
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

var saveEntry = function (event) {  // Saves title, author, URL for second page, and cover image URL as JS object and pushes information into local storage

    var saveDetails = {
        title: event.target.dataset.title,
        author: event.target.dataset.author,
        search: event.target.dataset.search,
        img: event.target.dataset.img,
    };

    saveListItems.push(saveDetails);

    localStorage.setItem('savedItems', JSON.stringify(saveListItems));
};

// The following functions handles the modal responses, which is used to ask the user if he wants to clear the saved book info in local storage

var eraseSaveList = function () {  // If answer no to modal, local storage will remain
    var x = document.getElementById("modal");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

var eraseListSafe = function () { // If answer yes to modal, local storage will be cleared
    saveListItems = [];
    localStorage.setItem("savedItems", JSON.stringify(saveListItems));

        var x = document.getElementById("modal");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

submitBtn.on("click", formSubmission); // Submit a search based on input

loadNYT.on("click", loadNYTList);   // Fetch request to New York Times
containerNYT.on("click", '.genre', loadGenreBooks); // Display books from New York Times lists

loadLocalStorage.on("click", loadSaveList); // Display user's saved books from local storage
eraseLocalStorage.on('click', eraseSaveList); // Deletes saved information from local storage

searchResults.on("click", '.save-button', saveEntry); // Saves a book's title, author, and image URL to local storage