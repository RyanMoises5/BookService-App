var googleAPIKey = "AIzaSyApC_HmnBEAvRsbJdOI__0QIfXjbtebdwY";
var displayContainer = $('#search-container');
var bookCover = $('#book-cover');
var bookTitle = $('#book-title');
var bookAuthor = $('#book-author');
var bookPublish = $('#book-publish');
var bookRatings = $('#book-OLratings');
var bookEbook = $('#book-OLebook');
var bookDesc = $('#book-desc');
var bookGoogleRating = $('#book-Googleratings');
var bookGenre = $('#book-genre');
var bookGooglePreview = $('#book-Googlepreview');
var bookGoogleBuy = $('#book-Googlebuy');
var bookNYTReview = $('#book-NYTReview');
var backBtn = $('#back-button');

var queryString = document.location.search.split('&NYTReview=');

var getData = function () {

    var apiURLOpenL = 'https://openlibrary.org/search.json' + queryString[0];

    console.log(apiURLOpenL);

    fetch(apiURLOpenL)
        .then(function (response) {
            if (response.ok) {
                console.log(response);
                response.json().then( function (data) {
                    console.log(data);

                    displayInfo(data);
                });
            } else {
                console.log ('Error: ' + response.statusText);
            }
        })
};

var displayInfo = function (data) {

    var coverURL = data.docs[0].cover_edition_key
    bookCover.attr('src', "https://covers.openlibrary.org/b/olid/" + coverURL + "-M.jpg");
    bookTitle.text(data.docs[0].title);

    var bookAuthorList;
    if (data.docs[0].author_name) {
        bookAuthorList = data.docs[0].author_name[0];
        for (let index = 1; index < data.docs[0].author_name.length; index++) {
            bookAuthorList = bookAuthorList + ", " + data.docs[0].author_name[index];
        }
        bookAuthor.text(bookAuthorList);
    } else {
        bookAuthor.text("Author: Unlisted");
    }

    if (data.docs[0].first_publish_year) {
        bookPublish.text("First published: " + data.docs[0].first_publish_year);   
    } else {
        bookPublish.text("First published: Unavailable");
    }

    if (data.docs[0].ratings_average) {
        bookRatings.text("Open Library Rating: " + data.docs[0].ratings_average.toFixed(2) + " (" + data.docs[0].ratings_count + ")");
    } else {
        bookRatings.text("Open Library Rating: Unavailable")
    }
   
    // var bookISBN = $('<p>');
    // bookISBN.text(data.docs[0].isbn);

    
    if (data.docs[0].ebook_access === "borrowable" || data.docs[0].ebook_access === "public") {
        bookEbook.text("Borrowable on Open Library. Click to search");
    } else {
        bookEbook.text("Unavailable on Open Library.");
    }

    getGoogleData(data);
};

var getGoogleData = function (data) {

    var bookTitlePrevURL = data.docs[0].title;
    var bookTitleArray = bookTitlePrevURL.split(" ");
    var bookTitleURL = bookTitleArray[0];
    for (let index = 1; index < bookTitleArray.length; index++) {
        bookTitleURL = bookTitleURL + "+" + bookTitleArray[index];
    }

    var bookEBookSearch = "https://openlibrary.org/search?title=" + bookTitleURL;
    var apiURLGoogle = 'https://www.googleapis.com/books/v1/volumes?q=' + bookTitleURL;

    if (data.docs[0].author_name) {
        var bookAuthorPrevURL = data.docs[0].author_name[0];
        var bookAuthorArray = bookAuthorPrevURL.split(" ");
        var bookAuthorURL = bookAuthorArray[0];
        for (let index = 1; index < bookAuthorArray.length; index++) {
            bookAuthorURL = bookAuthorURL + "+" + bookAuthorArray[index];
        }
        apiURLGoogle = apiURLGoogle + "+inauthor:" + bookAuthorURL;
        bookEBookSearch = bookEBookSearch + "&author=" + bookAuthorURL
    }

    bookEbook.attr("href", bookEBookSearch);

    apiURLGoogle = apiURLGoogle + "&maxResults=20" + "&orderBy=relevance" + "&key=" + googleAPIKey;

    console.log(apiURLGoogle);

    fetch(apiURLGoogle)
        .then(function (response) {
            if (response.ok) {
                console.log(response);
                response.json().then( function (dataGoogle) {
                    console.log(dataGoogle);

                    displayGoogleInfo(dataGoogle);
                });
            } else {
                console.log('Error: ' + response.statusText);
            }
        })
};

var displayGoogleInfo = function (dataGoogle) {

    var forSale = dataGoogle.items.find(function(book) {
        return book.saleInfo.saleability === 'FOR_SALE';
    });

    if (forSale) {
        bookDesc.text(forSale.volumeInfo.description);

        if (forSale.volumeInfo.averageRating) {
            bookGoogleRating.text("Google Books Rating: " + forSale.volumeInfo.averageRating.toFixed(2) + " (" + forSale.volumeInfo.ratingsCount + ")");
        } else {
            bookGoogleRating.text("Google Books Rating: Unavailable");
        }

        if (forSale.volumeInfo.categories) {
            var genreList = forSale.volumeInfo.categories[0];
            for (let index = 1; index < forSale.volumeInfo.categories.length; index++) {
                genreList = genreList + ", " + forSale.volumeInfo.categories[index];
            }
            bookGenre.text("Genre: " + genreList);
        } else {
            bookGenre.text("Genre: Unlisted");
        }

        if (forSale.volumeInfo.previewLink) {
            bookGooglePreview.attr("href", forSale.volumeInfo.previewLink);
            bookGooglePreview.text("Preview in Google Available. Click to view.");
        }

        if (forSale.saleInfo.buyLink) {
            bookGoogleBuy.attr("href", forSale.saleInfo.buyLink);
            bookGoogleBuy.text("Google EBooks Price: $" + forSale.saleInfo.listPrice.amount.toFixed(2));
        } 

    } else {
        bookGoogleRating.text("Google Books Rating: Unavailable");
        bookGenre.text("Genre: Unlisted");
        bookGooglePreview.text(" ");
        bookGoogleBuy.text(" ");
    }
};

var returnToIndex = function (event) {
    window.location.href = "./index.html";
};

getData();

if (queryString.length > 1 && queryString[1] != "False") {
    bookNYTReview.text("Click here for New York Times Review.")
    bookNYTReview.attr("href", queryString[1]);
};

backBtn.on('click', returnToIndex)