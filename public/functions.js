var fileUpload = function() {
    function displayError(filename) {
        document.getElementById('messages').innerHTML =
            '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            filename + ' is not a valid SQLite database file.';
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
                    url: "/post_db/",
                    type: "POST",
                    data: data,
                    enctype: 'multipart/form-data',
                    processData: false,
                    contentType: false,
                    success: function(data) {
                        document.getElementById('messages').innerHTML =
                            '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
                            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                            file[0].name + ' successfully uploaded.';
                    },
                    error: function(e) {
                        document.getElementById('messages').innerHTML =
                            '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
                            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                            'An error occurred: ' + e.responseText;
                        console.log(e);
                    }
                });
                // validation check for duplicate file
                /*if(business.getCurrentMenu().name == file[0].name) {
                    this.uploadErrorMessage("There is already a copy of " + file[0].name + " in the database.", location);
                    return false;
                }
                if(business.getAddMenu()) {
                    if(business.getAddMenu().name == file[0].name) {
                        this.uploadErrorMessage("There is already a copy of " + file[0].name + " in the upload queue.", location);
                        return false;
                    }
                    // remove current file in upload queue
                    else
                        document.getElementById(business.getAddMenu().name + 'Div').remove();
                }
                business.setAddMenu(file[0]);
                this.displayMenu(file[0].name, false);
                this.exitPrompt();*/
                $('#dbContentPane').show();
            }
            else {
                displayError(file[0].name);
            }
        }
    };
}();