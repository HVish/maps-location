$(document).ready(function() {
    var cityData;
    var currentCity = 0,
        cities = [];

    var table = $('#data').DataTable({
        dom: '<"clearfix"<"float-left"B><"float-right"f>>rt<"clearfix"<"float-left"i><"float-right"p>>',
        lengthChange: false,
        buttons: ['copy', 'excel', {
            text: 'Submit Data',
            action: function(e, dt, node, config) {
                var data = [];
                table.rows().every(function(rowIdx, tableLoop, rowLoop) {
                    data.push(this.data());
                });
                $.post('/cities', {
                    data: JSON.stringify(data)
                }, function(result) {
                    if (result == 'success') {
                        table.clear().draw();
                        alert('Successfully submitted!');
                    } else {
                        alert('Error occured!');
                    }
                });
            }
        }],
        drawCallback: function(settings) {
            $('#data_wrapper').removeClass('form-inline');
        }
    });
    $('.cityid-form').submit(function(e) {
        var form = $(this);
        var start = $('#start').val();
        var end = $('#end').val();
        e.preventDefault();
        if (start && end) {
            $.get('/cities?start=' + start + '&end=' + end, function(result) {
                cities = result;
                currentCity = 0;
                form.append('<span style="color: #5cb85c;"><b>&nbsp;Cities loaded</b></div>');
            });
        } else {
            alert('invalid input');
        }
    });
    $('.search-form').submit(function(e) {
        var input = $('#inputCity').val();
        e.preventDefault();
        $.get('http://maps.google.com/maps/api/geocode/json?language=en&address=' + encodeURI(input), function(result_en) {
            $.get('http://maps.google.com/maps/api/geocode/json?language=hi&address=' + encodeURI(input), function(result_hi) {
                var obj_en = result_en.results;
                var obj_hi = result_hi.results;
                cityData = [];
                var list = $('.details .list-group');
                list.empty();
                for (var i = 0; i < obj_en.length; i++) {
                    cityData[obj_en[i].place_id] = [];
                    cityData[obj_en[i].place_id].en = obj_en[i];
                    cityData[obj_en[i].place_id].hi = obj_hi[i];
                    parseAddress(cityData[obj_en[i].place_id].en, obj_en[i].address_components);
                    parseAddress(cityData[obj_en[i].place_id].hi, obj_hi[i].address_components);
                    list.append('<button type="button" class="list-group-item list-group-item-action" data-id="' + obj_en[i].place_id + '">' + obj_en[i].formatted_address + '</button>');
                }
            });
        });
    });
    $('.details .list-group').on('click', 'button', function() {
        var id = $(this).attr('data-id');
        $(this).remove();
        table.row.add([
            (cities[currentCity] ? cities[currentCity].cityId : 'NULL'),
            cityData[id].en.name,
            cityData[id].hi.name,
            cityData[id].en.state,
            cityData[id].hi.state,
            cityData[id].en.geometry.location.lat,
            cityData[id].en.geometry.location.lng,
        ]).draw(false);
        currentCity++;
        // console.log(table.rows().data());
    });
    $('#next').click(function() {
        if (cities.length) {
            if (currentCity < cities.length) {
                $('#inputCity').val(cities[currentCity].city + ' ' + cities[currentCity].state);
                $('.search-form').submit();
            } else {
                alert('Well done! Mission accomplished ;)');
            }
        } else {
            alert('Cities not loaded!');
        }
    });
});

function parseAddress(result, components) {
    result.name = components[0].long_name;
    for (var i = 0; i < components.length; i++) {
        if (components[i].types.indexOf('administrative_area_level_1') !== -1) {
            result.state = components[i].long_name;
        }
    }
}
