function BookLook() {


    function _cleanUpForm() {
        $("#book-form").trigger('reset');
        form.reset();
        $('.conditional-fields').each(function(index, field) {
            field.removeAttribute("disabled");
        })
    }

    function _render(data, mins) {

        $("#display-book").empty();

        // if, data is an object with one book we display it
        // else if, it is an object and has more than one book we display a list
        // else, data is a string so nothing was found so we need to display an error!
        if (typeof data === "object" && data.length === 1) {
            var book = {}
            book.title = data[0].volumeInfo.title;
            if (data[0].volumeInfo.authors) {
                book.author = data[0].volumeInfo.authors[0];
            }
            book.description = data[0].volumeInfo.description;
            if (data[0].volumeInfo.imageLinks) {
                book.image = data[0].volumeInfo.imageLinks.thumbnail;
            }
            book.pages = data[0].volumeInfo.pageCount;
            book.minutes = mins;
            var source = $('#book-template').html();
            var template = Handlebars.compile(source);
            var newHTML = template(book);
            $("#display-book").append(newHTML);
        } else if (typeof data === "object" && data.length > 1) {
            var source = $('#book-list-template').html();
            var template = Handlebars.compile(source);
            data.forEach(function(book) {
                var listbook = {}
                listbook.minutes = mins;
                listbook.title = book.volumeInfo.title;
                listbook.pages = book.volumeInfo.pageCount;
                if (book.volumeInfo.authors) {
                    listbook.author = book.volumeInfo.authors[0];
                }
                listbook.id = book.id;
                var newHTML = template(listbook);
                $("#display-book").append(newHTML);
            })
        } else {
            var source = $('#not-found-template').html();
            var template = Handlebars.compile(source);
            var newHTML = template({ isbn: data });
            $("#display-book").append(newHTML);
        }
        _cleanUpForm()
    }

    var form = $('#book-form').parsley({
        excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], :disabled'
    });

    var toggleFields = function($input) {
        //disable the other field if not empty, enable it if empty
        $('.conditional-fields').each(function(index, field) {
            if (field != $input[0] && $input.val() != "") {
                field.setAttribute("disabled", true);
            } else if (field != $input[0] && $input.val() == "") {
                field.removeAttribute("disabled");
            }
        })
    }

    var fetch = function(isbn, mins, title, id) {

        var queryString;
        if (isbn) {
            queryString = "isbn:" + isbn
        } else if (title) {
            queryString = "intitle:" + title + "&maxResults=10"
        } else if (id) {
            queryString = id
        }

        $.ajax({
            method: "GET",
            url: 'https://www.googleapis.com/books/v1/volumes?q=' + queryString,
            dataType: "json",
            beforeSend: function() {
                $('#loading-image').show();
            },
            complete: function() {
                $('#loading-image').hide();
            },
            success: function(data) {
                if (data.totalItems > 0) {
                    _render(data.items, mins);
                } else {
                    _render(isbn, mins);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error(textStatus);
            }
        });
    };

    return {
        form: form,
        toggleFields: toggleFields,
        fetch: fetch
    }
}

var app = BookLook();

$('#book-search').on('click', function() {

    if (app.form.validate()) {
        var mins = $("#minutes").val();
        var isbn = $("#isbn").val();
        var title = $("#title").val();
        app.fetch(isbn, mins, title);
        //empty form and remove validation css
    }
});

$(".conditional-fields").on('keyup', function(e) {
    app.toggleFields($(this))
})


$("#display-book").on('click', 'a', function(event) {
    var data = $(this).data();
    app.fetch(null, data.mins, null, data.id);
});

Handlebars.registerHelper("days", function(pages, minutes) {
    var days = pages / minutes;
    return days.toFixed(2);;
});
