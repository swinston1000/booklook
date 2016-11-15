function BookLook() {

    //after every search we must
    //clear the fields
    //reset the validation
    //enable all inputs
    function _cleanUpForm() {
        $("#book-form").trigger('reset');
        form.reset();
        $('.conditional-fields').each(function(index, field) {
            field.removeAttribute("disabled");
        })
    }

    //based on the data that was fetched we need to render a suitable template
    function _render(data, mins) {

        $("#display-book").empty();

        // if, data is an object with one book we display it
        // else if, it is an object and has more than one book we display a list
        // else, data is a string so nothing was found so we need to display an error!
        if (typeof data === "object" && data.length === 1) {
            var source = $('#book-template').html();
            var template = Handlebars.compile(source);
            //build our object for handlebars
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
            var newHTML = template(book);

            $("#display-book").append(newHTML);
        } else if (typeof data === "object" && data.length > 1) {
            var source = $('#book-list-template').html();
            var template = Handlebars.compile(source);
            //for each book found we output a line of html
            data.forEach(function(book) {
                //for this book we build an object for handlebars and append it
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
            // the data is not an object then the fetch failed - ie there were no results!
            // it data does exist then it is a string and it will hold the ISBN the user searched for
            var source = $('#not-found-template').html();
            var template = Handlebars.compile(source);
            var newHTML = template({ isbn: data });
            $("#display-book").append(newHTML);
        }
        //tidy up
        _cleanUpForm()
    }

    //setup our form for validation using parsleyjs
    var form = $('#book-form').parsley({
        excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], :disabled'
    });

    //cool function to disable the other field if input field is not empty, and to enable it if it is empty
    //when an input is disabled it also does not go through validation so 'required' is ignored
    var toggleFields = function($input) {
        $('.conditional-fields').each(function(index, field) {
            if (field != $input[0] && $input.val() != "") {
                field.setAttribute("disabled", true);
            } else if (field != $input[0] && $input.val() == "") {
                field.removeAttribute("disabled");
            }
        })
    }

    //fetch the data based on what the user has input
    var fetch = function(isbn, mins, title, id) {
        //the query string depends on the users input
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
                    //the search failed so we send back the isbn so the user knows there were no results
                    _render(isbn);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error(textStatus);
            }
        });
    };

    //exposer the functionality our user needs
    return {
        form: form,
        toggleFields: toggleFields,
        fetch: fetch
    }
}

var app = BookLook();

//when the user clicks 'search' we first validate the form, if all is OK we can proceed to fetch data
$('#book-search').on('click', function() {
    if (app.form.validate()) {
        var mins = $("#minutes").val();
        var isbn = $("#isbn").val();
        var title = $("#title").val();
        app.fetch(isbn, mins, title);
    }
});

//when the user enters data we want to make sure they only enter a title or an ISBN
$(".conditional-fields").on('keyup', function(e) {
    app.toggleFields($(this))
})

//when the user clicks on a book we need to fetch all of its info
$("#display-book").on('click', 'a', function(event) {
    var data = $(this).data();
    app.fetch(null, data.mins, null, data.id);
});

//nice helper that calculates days
Handlebars.registerHelper("days", function(pages, minutes) {
    var days = pages / minutes;
    if (isNaN(days)) {
        return ""
    } else {
        return "- will take " + days.toFixed(2) + " days to read!";
    }
});
