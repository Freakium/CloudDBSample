// displays error message to page
var displayMessage = function(message, err) {
    var mode;
    if(err)
        mode = 'alert-danger';
    else
        mode = 'alert-success';

    console.log(message);

    document.getElementById('messages').innerHTML =
        '<div class="alert ' + mode + ' alert-dismissible fade show" role="alert">' +
        '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + message;
}

// Uploads SQL .db file and integrates its data
var fileUpload = function() {
    function uploadFile(filename, data) {
        $('#waiting').show();
        $.ajax({
            url: "/",
            type: "POST",
            data: data,
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            success: function() {
                displayMessage(filename + ' successfully integrated.', false);
                $('#waiting').hide();
            },
            error: function(e) {
                displayMessage('An error occurred: ' + e.responseText, true);
                console.error(e);
                $('#waiting').hide();
            }
        });
    }
    return {
        dbUploadHandler: function(file) {
            // validation
            document.getElementById('uploadFilename').innerHTML = file[0].name;
            document.getElementById('messages').innerHTML = "";

            // Make sure uploaded file has .db extension
            if(file[0].name.split('.').pop() == "db") {
                var data = new FormData();
                data.append('file', file[0]);
                uploadFile(file[0].name, data);
            }
            else {
                displayMessage(file[0].name + ' is not a valid (.db) file.', true);
            }
        },
    };
}();

// Queries the database
var dbQuery = function() {
    // displays query results
    function displayQuery(data) {
        var queryContent = '<h4>Query Result</h4><table class="dbQuery"><tr>';
        
        if(data !== null) {
            var keys = Object.keys(data[0]);
            for(var i=0; i < keys.length; i++) {
                queryContent += '<th class="dbQuery-header">' + keys[i] + '</th>';
            }
            queryContent += '</tr>';
            for(var i=0; i < data.length; i++) {
                queryContent += '<tr>';
                for(var j=0; j < keys.length; j++) {
                    queryContent += '<td class="dbQuery-data">' + data[i][keys[j]] + '</td>';
                } 
                queryContent += '</tr>';
            }
            queryContent += '</table>';
        }
        document.getElementById('dbContentPane').innerHTML = queryContent;
    }
    function queryDatabase(data) {
        var query = {query: data};
        $.ajax({
            url: "/queries",
            type: "POST",
            data: JSON.stringify(query),
            contentType: 'application/json',
            success: function(data) {
                displayQuery(data);
            },
            error: function(e) {
                displayMessage('An error occurred: ' + e.responseText, true);
                console.error(e);
            }
        });
    }
    return {
        submitQuery: function(data) {
            var query;
            if(data == 'sqlQuery') {
                query = document.getElementById('sqlQuery').value;
            }
            else {
                query = 'SELECT * FROM ' + data;
            }
            queryDatabase(query);
        }
    }
}();