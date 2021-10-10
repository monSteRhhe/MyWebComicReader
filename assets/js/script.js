'use strict';

// drop to upload zip file
document.ondragover = function(e) {e.preventDefault();}

document.ondrop = function(e) {e.preventDefault();}

uploadbox.ondragover = function(e) {e.preventDefault();}

uploadbox.ondrop = function(e) {
    var zipfile = e.dataTransfer.files[0];
    OpenZip(zipfile);
}

// click to upload zip file
$('.uploadbox').click(function(){
    $('#upload').trigger('click');
})

// open .zip comic from computer
$('#upload').change(function () {
    var zipfile = $(this)[0].files[0];
    OpenZip(zipfile);

    // clear input value
    $('#upload').val('');
});

// close reader
$('.close').click(function(){
    $('.comicreader').fadeOut();
    $('.progressbar').fadeOut();
    $('.content').empty();
    $('.uploadbox').fadeIn();
})

function checkExt(fn) {
    var ext = getExt(fn);
    if(ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'gif' || ext == 'bmp' || ext == 'webp') return true;
    else return false;
}

// open .zip comic file
function OpenZip(file) {
    // clear previous blobs
    clearBlobs();

    // hide upload btn
    $('.uploadbox').hide();

    // init & show loading
    $('.ldpage').html('0 / 0');
    $('.loading').fadeIn('slow');

    // background blur
    $('.filter-blur').show();

    var max = 0;
    var entries = new Array();

    var cz = new JSZip();
    // read the blob
    cz.loadAsync(file)
    .then(function(zip) {
        // get max length
        var zdict_keys = Object.keys(zip.files);
        var zdict_values = Object.values(zip.files);
        for(var i = 0; i < zdict_values.length; i++) {
            if(zdict_values[i].dir == false) {
                if(checkExt(zdict_keys[i])) max += 1;
            }
        }

        zip.forEach(function(relativePath, zipEntry) {
            if(zipEntry.dir == false) {
                if(checkExt(zipEntry.name)) {
                    var entry = zipEntry;
                    entries.push(entry);

                    if(entries.length == max) {
                        entriesSort(entries);
                    }
                }
            }
        })
    })
}


// sort entries by number
function entriesSort(entries) {
    if(entries.length > 2) {
        for(var i = 0; i < entries.length - 1 - 1; i++) {
            for(var j = 0; j < entries.length - 1 - i; j++) {
                if(parseInt(entryNum(entries, j)) > parseInt(entryNum(entries, j + 1))) {
                    var tmp = entries[j];
                    entries[j] = entries[j + 1];
                    entries[j + 1] = tmp;
                }
            }
            if(i == entries.length - 3) procEntries(entries, 0, entries.length);
        }
    }
    else if(entries.length == 2) {
        if(parseInt(entryNum(entries, 0)) > parseInt(entryNum(entries, 1))) {
            var tmp = entries[0];
            entries[0] = entries[1];
            entries[1] = tmp;
        }
        procEntries(entries, 0, 2);
    }
    else procEntries(entries, 0, 1);
}


function entryNum(entries, i) {
    var fn = entries[i].name.split('/').pop();
    var fn_num = fn.split('.')[0];
    return fn_num;
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
    $('.content').append('<div class="pagenum"><div class="ll"></div><div class="lr"></div><span>' + (ei + 1) + '</span></div>');
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
            $('.filter-blur').hide();
            $('.loading').hide();
            $('.comicreader').fadeIn('slow');
            $('.close').fadeIn('slow');
        }
        else {
            $('.ldpage').html((ei + 1)  + ' / ' + max);
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



