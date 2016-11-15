function BookLook() {

    var displayBook = function(book) {

        $("#display-book").empty();

        // if book is an object we display it but if it is a number 
        // then nothing was found so we need to display an error!
        if (typeof book === "object") {
            var source = $('#book-template').html();
            var template = Handlebars.compile(source);
            var newHTML = template(book);
            $("#display-book").append(newHTML);

        } else {
            var source = $('#not-found-template').html();
            var template = Handlebars.compile(source);
            var newHTML = template({ isbn: book });
            $("#display-book").append(newHTML);
        }
    }

    var searchBook = function() {

    }

    return {
        displayBook: displayBook,
        searchBook: searchBook
    }
}

var app = BookLook();
var form = $('#book-form').parsley();

$('#book-search').on('click', function(e) {
    if (form.validate()) {
        var mins = $("#minutes-input").val();
        var isbn = $("#isbn").val();
        fetch(isbn, mins);
        //empty form and remove validation css
        $("#book-form").trigger('reset');
        form.reset();
    }
});

var fetch = function(isbn, mins) {
    $.ajax({
        method: "GET",
        url: 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn,
        dataType: "json",
        beforeSend: function() {
            $('#loading-image').show();
        },
        complete: function() {
            $('#loading-image').hide();
        },
        success: function(data) {
            if (data.totalItems > 0) {
                var newBook = {};
                newBook.title = data.items[0].volumeInfo.title;
                newBook.author = data.items[0].volumeInfo.authors[0];
                newBook.description = data.items[0].volumeInfo.description;
                newBook.image = data.items[0].volumeInfo.imageLinks.thumbnail;
                newBook.pages = data.items[0].volumeInfo.pageCount;
                newBook.minutes = mins;
                app.displayBook(newBook);
            } else {
                app.displayBook(isbn);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error(textStatus);
        }
    });
};

Handlebars.registerHelper("days", function(pages, minutes) {
    var days = pages / minutes;
    return days;
});
