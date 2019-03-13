var fileUpload = function() {
    // displays error message to page
    function displayMessage(message, err) {
        var mode;
        if(err)
            mode = 'alert-danger';
        else
            mode = 'alert-success';

        document.getElementById('messages').innerHTML =
            '<div class="alert ' + mode + ' alert-dismissible fade show" role="alert">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + message;
    }
    function displayQuery(data) {
        var queryContent = '<h4>SQL Query Preview</h4><table class="dbQuery"><tr>';
        
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
    return {
        dbUploadHandler: function(file) {
            // validation
            document.getElementById('uploadFilename').innerHTML = file[0].name;
            document.getElementById('messages').innerHTML = "";

            // Make sure uploaded file has .db extension
            if(file[0].name.split('.').pop() == "db") {
                var data = new FormData();
                data.append('file', file[0]);

                $.ajax({
                    url: "/",
                    type: "POST",
                    data: data,
                    enctype: 'multipart/form-data',
                    processData: false,
                    contentType: false,
                    success: function(data) {
                        displayMessage(file[0].name + ' successfully uploaded.', false);
                        displayQuery(data);
                    },
                    error: function(e) {
                        displayMessage('An error occurred: ' + e.responseText, true);
                        console.log(e);
                    }
                });
                //$('#dbContentPane').show();
            }
            else {
                displayMessage(file[0].name, true);
            }
        }
    };
}();