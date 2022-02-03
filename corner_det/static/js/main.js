$(document).ready(() => {
    $("#addNewImgBtn").click(() => {
        // var csrftoken = document.cookie.match("csrftoken").input.replace('csrftoken=', '');
        var imagesCount = $('div[id^="photoDiv"]').length + 1;
        
        $("#prependDiv").append(`
            <div id="photoDiv` + imagesCount + `" class="col-12 mt-2">
                <div class="card shadow-lg rounded">
                    <div class="card-body text-center">
                        <form id="form` + imagesCount + `" method="post" action="" enctype="multipart/form-data" id="myform">
                            <div class="mt-4 col-sm-12">
                                <!-- <input type="file" id="file" class="form-control m-2" name="file" /> -->
                                <div class="uploader">
                                    <img class="img-fluid rounded" id="newImg` + imagesCount + `" src="">
                                    <input type="file" name="file" class="filePhotoClass" id="filePhoto` + imagesCount + `"/>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="card shadow-lg rounded">
                    <div class="card-body text-center">
                        <input type="text" id="threshold` + imagesCount + `" class="form-control m-2" placeholder="Введите порог" name="threshold" />
                        <select id="angleSelect` + imagesCount + `" name="angle" class="form-control m-2">
                            <option disabled selected>Выберите угол</option>
                            <option value="45">45</option>
                            <option value="90">90</option>
                        </select>

                        <select id="scaleSelect` + imagesCount + `"  name="zoom" class="form-control m-2">
                            <option disabled selected>Выберите масштаб</option>
                            <option value="3">3x3</option>
                            <option value="5">5x5</option>
                            <option value="7">7x7</option>
                            <option value="9">9x9</option>
                        </select>
                    </div>
                </div>
                <div class="card shadow-lg rounded">
                    <div class="card-body text-center">
                        <input type="button" class="btn btn-primary" value="Calculate" id="uploadBtn` + imagesCount + `">
                        <input type="button" class="btn btn-danger" value="Remove" id="removeBtn` + imagesCount + `">
                    </div>
                </div>
            </div>`
        );
    });

    $('#loadingDiv')
        .hide()  // Hide it initially
        .ajaxStart(function() {
            $(this).show();
        })
        .ajaxStop(function() {
            $(this).hide();
        })
    ;

    $(document).on("change", "input[id^='filePhoto']", (event) => {
        var id = event.target.id.replace('filePhoto', '');
        var reader = new FileReader();
        reader.onload = (event) => {
            $('#newImg' + id).attr('src', event.target.result);
        }
        reader.readAsDataURL(event.target.files[0]);
    });

    $(document).on("click", "input[id^='removeBtn']", (event) => {
        var id = event.target.id.replace('removeBtn', '');
        
        $("#photoDiv" + id).remove();
        if ($("#detectedPhotoDiv" + id).length)
            $("#detectedPhotoDiv" + id).remove();
    });

    $(document).on("click", "input[id^='uploadBtn']", (event) => {
        var id = event.target.id.replace('uploadBtn', '');

        var fdata = new FormData($('#form' + id).get(0));

        var files = $('#filePhoto' + id)[0].files;
        var angleSelected = $('#angleSelect' + id).val();
        var scaleSelected = $('#scaleSelect' + id).val();
        
        if ((files.length > 0 ) && ($("#threshold" + id).val() && angleSelected && scaleSelected)) {
            fdata.append('threshold', $("#threshold" + id).val());
            fdata.append('angle', $("#angleSelect" + id).val());
            fdata.append('scale', $("#scaleSelect" + id).val());
            fdata.append('filename', files[0].name)
            $body = $("body");

            $.ajax({
                url: 'upload_image',
                type: 'POST',
                beforeSend: function() { $body.addClass("loading"); },
                complete: function() { $body.removeClass("loading"); },
                data: fdata,
                contentType: false,
                // mimeType: "multipart/form-data",
                processData: false,
                success: (response) => {
                    if (response.error != 'err') {
                        localStorage.setItem('imageID', response.imageID);
                        localStorage.setItem(response.imageID, response.destination + ' ' + response.blurred + ' ' + response.withEdges + ' ' + response.detected);
                        
                        $("#detectedDiv" + id).remove();
                        $("#photoDiv" + id).append(`
                            <div class="card shadow-lg rounded" id="detectedDiv` + id + `">
                                <img class="img-fluid rounded" id="` + id + `" src="">
                                <img src="` + response.detected + `" alt="Изображение с углами" id="imgCorners` + id + `" width="300" height="300">
                                <img src="` + response.blurred + `" alt="Изображение с примененным случайным шумом" id="imgFiltered` + id + `" width="300" height="300">
                                <img src="` + response.withEdges + `" alt="Изображение с краями" id="imgWithEdges` + id + `" width="300" height="300">
                            </div>
                        `)
                    }
                    else {
                        alert(response.message);
                    }
                },
            });
        }
        else {
            alert("Пожалуйста, заполните необходимые поля");
        }
    });
});