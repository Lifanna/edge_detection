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
                        <input type="button" class="btn btn-info" value="Analyse" id="analyseBtn` + imagesCount + `">
                        <input type="button" class="btn btn-danger" value="Remove" id="removeBtn` + imagesCount + `">
                    </div>
                </div>
            </div>`
        );
    });

    $("#addNewImgHarrisBtn").click(() => {
        // var csrftoken = document.cookie.match("csrftoken").input.replace('csrftoken=', '');
        var imagesCount = $('div[id^="photoDivHarris"]').length + 1;
        
        $("#prependDiv").append(`
            <div id="photoDivHarris` + imagesCount + `" class="col-12 mt-2">
                <div class="card shadow-lg rounded">
                    <div class="card-body text-center">
                        <form id="formHarris` + imagesCount + `" method="post" action="" enctype="multipart/form-data" id="myform">
                            <div class="mt-4 col-sm-12">
                                <div class="uploader">
                                    <img class="img-fluid rounded" id="newImgHarris` + imagesCount + `" src="">
                                    <input type="file" name="file" class="filePhotoClass" id="filePhotoHarris` + imagesCount + `"/>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="card shadow-lg rounded">
                    <div class="card-body text-center">
                        <input type="text" id="blockSize` + imagesCount + `" class="form-control m-2" placeholder="Введите block size" value="2" name="threshold" />
                        <input type="text" id="ksize` + imagesCount + `" class="form-control m-2" placeholder="Введите ksize" value="3" name="threshold" />
                        <input type="text" id="k` + imagesCount + `" class="form-control m-2" placeholder="Введите k" value="0.04" name="threshold" />
                    </div>
                </div>
                <div class="card shadow-lg rounded">
                    <div class="card-body text-center">
                        <input type="button" class="btn btn-primary" value="Calculate Harris" id="uploadHarrisBtn` + imagesCount + `">
                        <input type="button" class="btn btn-danger" value="Remove" id="removeHarrisBtn` + imagesCount + `">
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

    $(document).on("click", "input[id^='removeHarrisBtn']", (event) => {
        var id = event.target.id.replace('removeHarrisBtn', '');
        
        $("#photoDivHarris" + id).remove();
        if ($("#detectedPhotoDivHarris" + id).length)
            $("#detectedPhotoDivHarris" + id).remove();
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

    $(document).on("click", "input[id^='uploadHarrisBtn']", (event) => {
        var id = event.target.id.replace('uploadHarrisBtn', '');

        var fdata = new FormData($('#formHarris' + id).get(0));

        var files = $('#filePhotoHarris' + id)[0].files;
        
        if ((files.length > 0 ) && ($("#blockSize" + id).val() && $("#ksize" + id).val() && $("#k" + id).val())) {
            fdata.append('blockSize', $("#blockSize" + id).val());
            fdata.append('ksize', $("#ksize" + id).val());
            fdata.append('k', $("#k" + id).val());
            fdata.append('filename', files[0].name);
            $body = $("body");

            $.ajax({
                url: 'upload_image_harris',
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

                        $("#detectedDivHarris" + id).remove();
                        $("#photoDivHarris" + id).append(`
                            <div class="card shadow-lg rounded" id="detectedDivHarris` + id + `">
                                <img class="img-fluid rounded" id="` + id + `" src="">
                                <!-- <img src="` + response.destination + `" alt="Изображение с углами" id="imgCornersHarris` + id + `" width="300" height="300"> -->
                                <img src="` + response.detected + `" alt="Изображение с углами" id="imgCornersHarris` + id + `" width="300" height="300">
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

    $(document).on("click", "input[id^='analyseBtn']", (event) => {
        imageID = localStorage.getItem('imageID');
        paths = localStorage.getItem(imageID).split(' ');
        destinationPath = paths[0];
        blurredPath = paths[1];
        withEdgesPath = paths[2];
        detectedPath = paths[3];
        $body = $("body");

        var fdata = new FormData();
        fdata.append('destination', detectedPath);
        fdata.append('blurred', blurredPath);
        fdata.append('with_edges', withEdgesPath);
        fdata.append('detected', detectedPath);

        var destination = [], blurred = [], withEdges = [], detected = [];

        $.ajax({
            url: 'analyse',
            type: 'POST',
            beforeSend: function() { $body.addClass("loading"); },
            complete: function() { $body.removeClass("loading"); },
            data: fdata,
            contentType: false,
            // mimeType: "multipart/form-data",
            processData: false,
            success: (response) => {
                blurred = response.blurred;
                destination = response.destination;
                detected = response.detected;
                withEdges = response.withEdges;

                var blurredStruct = [], destinationStruct = [], withEdgesStruct = [], detectedStruct = [];
                
                blurred.forEach((element) => {
                    element.forEach((eachElem) => {
                        blurredStruct.push({y: eachElem});
                    });
                });

                destination.forEach((element) => {
                    element.forEach((eachElem) => {
                        destinationStruct.push({y: eachElem});
                    });
                });
                
                withEdges.forEach((element) => {
                    element.forEach((eachElem) => {
                        withEdgesStruct.push({y: eachElem});
                    });
                });
                
                detected.forEach((element) => {
                    element.forEach((eachElem) => {
                        detectedStruct.push({y: eachElem});
                    });
                });

                $("#chartContainer1").css("height", "400px");
                $("#chartContainer2").css("height", "400px");
                $("#chartContainer3").css("height", "400px");
                $("#chartContainer4").css("height", "400px");

                var chart1 = new CanvasJS.Chart("chartContainer1", {
                    animationEnabled: true,
                    theme: "light2",
                    title:{
                        text: "Значения пикселей исходного изображения"
                    },
                    axisX: {
                        title: "порядковый номер пикселя",
                    },
                    axisY: {
                        title: "значение пикселя",
                    },
                    data: [{        
                        type: "line",
                        indexLabelFontSize: 16,
                        dataPoints: destinationStruct
                    }]
                });
                
                chart1.render();
                
                var chart2 = new CanvasJS.Chart("chartContainer2", {
                    animationEnabled: true,
                    theme: "light2",
                    title:{
                        text: "Значения пикселей изображения с шумом"
                    },
                    axisX: {
                        title: "порядковый номер пикселя",
                    },
                    axisY: {
                        title: "значение пикселя",
                    },
                    data: [{        
                        type: "line",
                        indexLabelFontSize: 16,
                        dataPoints: blurredStruct
                    }]
                });

                chart2.render();
                
                var chart3 = new CanvasJS.Chart("chartContainer3", {
                    animationEnabled: true,
                    theme: "light2",
                    title:{
                        text: "Значения пикселей изображения с краями"
                    },
                    axisX: {
                        title: "порядковый номер пикселя",
                    },
                    axisY: {
                        title: "значение пикселя",
                    },
                    // axisY: {
                    //     prefix: "",
                    //     interval : 0.1,
                    //     maximum: 1,
                    // },
                    data: [{        
                        type: "line",
                        indexLabelFontSize: 16,
                        dataPoints: withEdgesStruct
                    }]
                });

                chart3.render();

                var chart4 = new CanvasJS.Chart("chartContainer4", {
                    animationEnabled: true,
                    theme: "light2",
                    title:{
                        text: "Значения пикселей изображения с найденными угловыми структурами"
                    },
                    axisX: {
                        title: "порядковый номер пикселя",
                    },
                    axisY: {
                        title: "значение пикселя",
                    },
                    data: [{        
                        type: "line",
                        indexLabelFontSize: 16,
                        dataPoints: detectedStruct
                    }]
                });

                chart4.render();
            },
        });

        $("#clearAllBtn").click(() => {
            $("#chartContainer1").empty();
            $("#chartContainer1").css("height", "0px");
            $("#chartContainer2").empty();
            $("#chartContainer2").css("height", "0px");
            $("#chartContainer3").empty();
            $("#chartContainer3").css("height", "0px");
            $("#chartContainer4").empty();
            $("#chartContainer4").css("height", "0px");
        });
    });
});