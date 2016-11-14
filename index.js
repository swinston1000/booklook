function BookLook() {

    var displayBook = {}

    var displayBook = function(book) {
        displayBook = book;
        $("#display-book").empty();
        var source = $('#book-template').html();
        var template = Handlebars.compile(source);
        var newHTML = template(displayBook);
        $("#display-book").append(newHTML);

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
        var newBook = {};
        newBook.title = $("#title-input").val();
        newBook.author = $("#author-input").val();
        newBook.description = $("#description-input").val();
        newBook.image = $("#image-input").val();

        newBook.pages = $("#pages-input").val();
        newBook.minutes = $("#minutes-input").val();
        app.displayBook(newBook);
    }
});

Handlebars.registerHelper("days", function(pages, minutes) {
    var days = pages / minutes;
    return days;
});
