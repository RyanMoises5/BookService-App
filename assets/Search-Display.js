var displayContainer = $('#search-container');

var getData = function () {

    var queryString = document.location.search

    var apiURLOpenL = 'https://openlibrary.org/search.json' + queryString;

    fetch(apiURLOpenL)
        .then(function (response) {
            if (response.ok) {
                console.log(response);
                response.json().then( function (data) {
                    console.log(data);

                    displayInfo(data);
                });
            } else {
                alert ('Error: ' + response.statusText);
            }
        })
};

var displayInfo = function (data) {

    var coverURL = data.docs[0].cover_edition_key

    var bookCover = $('<img>');
    bookCover.attr('src', "https://covers.openlibrary.org/b/olid/" + coverURL + "-M.jpg");

    var bookTitle = $('<h1>');
    bookTitle.text(data.docs[0].title);

    var bookAuthor = $('<h3>');
    bookAuthor.text(data.docs[0].author_name);

    var bookYear = $('<p>');
    bookYear.text(data.docs[0].first_publish_year);

    var bookSubject = $('<p>');
    bookSubject.text(data.docs[0].subject_key[0]);

    // var bookISBN = $('<p>');
    // bookISBN.text(data.docs[0].isbn);

    var bookRatings = $('<p>');
    bookRatings.text("Rating: " + data.docs[0].ratings_average + " (" + data.docs[0].ratings_count + ")");

    var bookEbook = $('<p>');
    bookEbook.text("Ebook access: " + data.docs[0].ebook_access);
    
    displayContainer.append(bookCover);
    displayContainer.append(bookTitle);
    displayContainer.append(bookAuthor);
    displayContainer.append(bookYear);
    displayContainer.append(bookSubject);
    displayContainer.append(bookRatings);
    displayContainer.append(bookEbook);
}

getData();