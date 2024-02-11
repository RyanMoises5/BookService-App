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

    
    if (data.docs[0].ebook_access == "borrowable") {
        bookEbook.text("Borrowable on Open Library. Click to search");
    } else {
        bookEbook.text("Unavailable on Open Library.");
    }

    getGoogleData(data);
}

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

        // For API rationing, use this:

    // displayGoogleInfo({
    //     "kind": "books#volumes",
    //     "totalItems": 233,
    //     "items": [
    //         {
    //             "kind": "books#volume",
    //             "id": "yl4dILkcqm4C",
    //             "etag": "ibvwuW4IxnU",
    //             "selfLink": "https://www.googleapis.com/books/v1/volumes/yl4dILkcqm4C",
    //             "volumeInfo": {
    //                 "title": "The Lord Of The Rings",
    //                 "subtitle": "One Volume",
    //                 "authors": [
    //                     "J.R.R. Tolkien"
    //                 ],
    //                 "publisher": "HarperCollins",
    //                 "publishedDate": "2012-02-15",
    //                 "description": "Immerse yourself in Middle-earth with J.R.R. Tolkien’s classic masterpieces behind the films... This special 50th anniversary edition includes three volumes of The Lord of the Rings (The Fellowship of the Ring, The Two Towers, and The Return of the King), along with an extensive new index—a must-own tome for old and new Tolkien readers alike. One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them. In ancient times the Rings of Power were crafted by the Elven-smiths, and Sauron, the Dark Lord, forged the One Ring, filling it with his own power so that he could rule all others. But the One Ring was taken from him, and though he sought it throughout Middle-earth, it remained lost to him. After many ages it fell by chance into the hands of the hobbit Bilbo Baggins. From Sauron's fastness in the Dark Tower of Mordor, his power spread far and wide. Sauron gathered all the Great Rings to him, but always he searched for the One Ring that would complete his dominion. When Bilbo reached his eleventy-first birthday he disappeared, bequeathing to his young cousin Frodo the Ruling Ring and a perilous quest: to journey across Middle-earth, deep into the shadow of the Dark Lord, and destroy the Ring by casting it into the Cracks of Doom. The Lord of the Rings tells of the great quest undertaken by Frodo and the Fellowship of the Ring: Gandalf the Wizard; the hobbits Merry, Pippin, and Sam; Gimli the Dwarf; Legolas the Elf; Boromir of Gondor; and a tall, mysterious stranger called Strider. J.R.R. Tolkien (1892-1973), beloved throughout the world as the creator of The Hobbit, The Lord of the Rings, and The Silmarillion, was a professor of Anglo-Saxon at Oxford, a fellow of Pembroke College, and a fellow of Merton College until his retirement in 1959. His chief interest was the linguistic aspects of the early English written tradition, but while he studied classic works of the past, he was creating a set of his own.",
    //                 "industryIdentifiers": [
    //                     {
    //                         "type": "ISBN_13",
    //                         "identifier": "9780547951942"
    //                     },
    //                     {
    //                         "type": "ISBN_10",
    //                         "identifier": "0547951949"
    //                     }
    //                 ],
    //                 "readingModes": {
    //                     "text": true,
    //                     "image": false
    //                 },
    //                 "pageCount": 1267,
    //                 "printType": "BOOK",
    //                 "categories": [
    //                     "Fiction"
    //                 ],
    //                 "averageRating": 4.5,
    //                 "ratingsCount": 59,
    //                 "maturityRating": "NOT_MATURE",
    //                 "allowAnonLogging": true,
    //                 "contentVersion": "2.23.23.0.preview.2",
    //                 "panelizationSummary": {
    //                     "containsEpubBubbles": false,
    //                     "containsImageBubbles": false
    //                 },
    //                 "imageLinks": {
    //                     "smallThumbnail": "http://books.google.com/books/content?id=yl4dILkcqm4C&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    //                     "thumbnail": "http://books.google.com/books/content?id=yl4dILkcqm4C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    //                 },
    //                 "language": "en",
    //                 "previewLink": "http://books.google.com/books?id=yl4dILkcqm4C&printsec=frontcover&dq=The+Lord+of+the+Rings+inauthor:J.R.R.+Tolkien&hl=&cd=1&source=gbs_api",
    //                 "infoLink": "https://play.google.com/store/books/details?id=yl4dILkcqm4C&source=gbs_api",
    //                 "canonicalVolumeLink": "https://play.google.com/store/books/details?id=yl4dILkcqm4C"
    //             },
    //             "saleInfo": {
    //                 "country": "US",
    //                 "saleability": "FOR_SALE",
    //                 "isEbook": true,
    //                 "listPrice": {
    //                     "amount": 15.99,
    //                     "currencyCode": "USD"
    //                 },
    //                 "retailPrice": {
    //                     "amount": 15.99,
    //                     "currencyCode": "USD"
    //                 },
    //                 "buyLink": "https://play.google.com/store/books/details?id=yl4dILkcqm4C&rdid=book-yl4dILkcqm4C&rdot=1&source=gbs_api",
    //                 "offers": [
    //                     {
    //                         "finskyOfferType": 1,
    //                         "listPrice": {
    //                             "amountInMicros": 15990000,
    //                             "currencyCode": "USD"
    //                         },
    //                         "retailPrice": {
    //                             "amountInMicros": 15990000,
    //                             "currencyCode": "USD"
    //                         },
    //                         "giftable": true
    //                     }
    //                 ]
    //             },
    //             "accessInfo": {
    //                 "country": "US",
    //                 "viewability": "PARTIAL",
    //                 "embeddable": true,
    //                 "publicDomain": false,
    //                 "textToSpeechPermission": "ALLOWED",
    //                 "epub": {
    //                     "isAvailable": true,
    //                     "acsTokenLink": "http://books.google.com/books/download/The_Lord_Of_The_Rings-sample-epub.acsm?id=yl4dILkcqm4C&format=epub&output=acs4_fulfillment_token&dl_type=sample&source=gbs_api"
    //                 },
    //                 "pdf": {
    //                     "isAvailable": false
    //                 },
    //                 "webReaderLink": "http://play.google.com/books/reader?id=yl4dILkcqm4C&hl=&source=gbs_api",
    //                 "accessViewStatus": "SAMPLE",
    //                 "quoteSharingAllowed": false
    //             },
    //             "searchInfo": {
    //                 "textSnippet": "J.R.R. Tolkien (1892-1973), beloved throughout the world as the creator of The Hobbit, The Lord of the Rings, and The Silmarillion, was a professor of Anglo-Saxon at Oxford, a fellow of Pembroke College, and a fellow of Merton College until ..."
    //             }
    //         },
    //     ]
    // })
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
            bookGoogleBuy.text("Google Books Price: $" + forSale.saleInfo.listPrice.amount.toFixed(2));
        } 

    } else {
        bookGoogleRating.text("Google Books Rating: Unavailable");
        bookGenre.text("Genre: Unlisted");
        bookGooglePreview.text(" ");
        bookGoogleBuy.text(" ");
    }};

if (queryString.length > 1 && queryString[1] != "False") {
    bookNYTReview.text("Click here for New York Times Review.")
    bookNYTReview.attr("href", queryString[1]);
}

getData();