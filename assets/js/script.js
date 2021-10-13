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
    $('.pnum').fadeOut();

    $('.toolbox').css('transform', 'translateY(6rem)');
    $('.toolbox').fadeOut();
    $('.toggle').html('<img src="assets/img/fa/toggle-on.svg">');

    $('.header').css('transform', 'translateY(-6rem)');
    $('.header').fadeOut();
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
    $('.ld').html('0 / 0');
    $('.loading').fadeIn('slow');

    // background blur
    $('.filter-blur').show();

    // title
    var fne = file.name;
    var fn = fne.substring(0, fne.lastIndexOf("."));
    $('.title').html(fn)

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
    $('.content').append('<div class="cp"><div class="ll"></div><div class="lr"></div><span>' + (ei + 1) + '</span></div>');
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

        // show comic loading status in bottom right
        $('.status').fadeIn();

        // show reader when 10 pics are loaded
        if(max >= 10 && ei == 10){
            $('.loading').hide();
            $('.comicreader').fadeIn();
            $('.close').fadeIn();
        }


        if(ei == max - 1){
            $('.loading').hide();
            $('.filter-blur').hide();
            $('.loading').hide();
            $('.comicreader').fadeIn();
            $('.close').fadeIn();

            $('.ld').html((ei + 1)  + ' / ' + max);
            $('.load').html((ei + 1)  + ' / ' + max);

            $('.status').fadeOut();

            $('.pnum').html(max + 'P');
            $('.pnum').fadeIn();
        }
        else {
            $('.ld').html((ei + 1)  + ' / ' + max);
            $('.load').html((ei + 1)  + ' / ' + max);
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

    if(st == 0) $('.progressbar').hide();
})


// get system time
function sysTime() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();

    if(m <= 9) return h + ': 0' + m;
    else return h + ': ' + m;
}


// get Beijing time
function bjTime() {
    var d = new Date(new Date().getTime()+(parseInt(new Date().getTimezoneOffset() / 60) + 8) * 3600 * 1000);
    var h = d.getHours();
    var m = d.getMinutes();

    if(m <= 9) return h + ': 0' + m;
    else return h + ': ' + m;
}


// display time
setInterval(function(){
    //var t = sysTime();
    var t = bjTime();
    $('.time').html(t);
}, 1000)


// click to show widgets
$('.content').click(function(){
    if($('.toolbox').css('display') == 'none'){
        $('.toolbox').fadeIn();
        $('.toolbox').css('transform', 'translateY(0)');

        $('.header').fadeIn();
        $('.header').css('transform', 'translateY(0)');
    }
    else {
        $('.toolbox').css('transform', 'translateY(6rem)');
        $('.toolbox').fadeOut();

        $('.header').css('transform', 'translateY(-6rem)');
        $('.header').fadeOut();
    }
})


// toggle hide/show of page number
$('.toggle').click(function(){
    var ct = $('.toggle').html();
    var ct = $.trim(ct);
    var ton = '<img src="assets/img/fa/toggle-on.svg">';
    var toff = '<img src="assets/img/fa/toggle-off.svg">';
    if(ct == ton) {
        $('.toggle').html(toff);
        $('.cp').hide();
    }
    else {
        $('.toggle').html(ton);
        $('.cp').show();
    }
})

