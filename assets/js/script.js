'use strict';

$('.loadbtn').click(function(){
    $('#upload').trigger('click');
})


// open comic from computer
$('#upload').change(function () {
    var file = $(this)[0].files[0];
    OpenZip(file);

    // clear input value
    $('#upload').val('');
});


// close reader
$('.close').click(function(){
    $('.comicreader').fadeOut();
    $('.content').empty();
    $('.loadbtn').fadeIn();
})


// open .zip comic file
function OpenZip(file) {
    // clear previous blobs
    clearBlobs();

    // hide upload btn
    $('.loadbtn').hide();

    // show loading
    $('.loading').fadeIn('slow');

    // background blud
    $(document.body).css('backdrop-filter: blur(5px);');

    var max = 0;
    var entries = new Array();

    var cz = new JSZip();
    // read the blob
    cz.loadAsync(file)
    .then(function(zip) {
        // get max length
        var zdict_values = Object.values(zip.files);
        for(var i = 0; i < zdict_values.length; i++) {
            if(zdict_values[i].dir == false) {
                max += 1;
            }
        }

        zip.forEach(function(relativePath, zipEntry) {
            if(zipEntry.dir == false) {
                var entry = zipEntry;
                entries.push(entry);

                if(entries.length == max) {
                    procEntries(entries, 0, max);
                }
            }
        })
    })
}


function getMIME(fn) {
    var ext = getExt(fn).toLowerCase();

    switch(ext) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'bmp':
            return 'image/bmp';
        case 'webp':
            return 'image/webp';
        default:
            return 'image/jpeg';
    }
}


function getExt(fn) {
    var ext = fn.split('.').pop();
    if(ext == fn) return '';
    else return ext;
}


function procEntries(entries, ei, max) {
    var fn = entries[ei].name;
    if(fn != '') createBlobs(entries, ei, max);
}


function createBlobs(entries, ei, max) {
    var entry = entries[ei];
    entry
    .async('arraybuffer')
    .then(function(ab) {
        // get arraybuffer
        var data = ab;

        // convert the data into an object url
        var blob = new Blob([data], {type: getMIME(entry.name)});
        var url = URL.createObjectURL(blob);

        // output the imgs
        $('.content').append('<img class="cimg" src="' + url + '"/>');

        if(ei == max - 1){
            //$('.loading').fadeOut('slow');
            $('.loading').hide();
            $('.comicreader').fadeIn('slow');
            $('.close').fadeIn('slow');
        }
        else {
            $('.lp').html((ei + 1)  + ' / ' + max);
            procEntries(entries, ei + 1, max)
        }
    })
}


function clearBlobs() {
    $('.cimg').each(function(){
        URL.revokeObjectURL($(this).attr('src'));
    });
}


// scroll to top
$(window).scroll(function(){
    if($(window).scrollTop() > 100) {
        $(".to-top").show();
    }
    else {
        $(".to-top").hide();
    }
})

$('.to-top').click(function(){
    $('body,html').animate({
        scrollTop: 0
    }, 300)
})


// progress bar
var cr = $(window).height();

$(document).scroll(function(){
    var st = $(window).scrollTop();
    var to = $(document.body).height();

    var percent = (st + cr) / to;
    if(percent > 1){percent = 1;}
    percent = (percent * 100) + '%';

    $('.progressbar').attr('style', 'width: ' + percent + ';');
})



