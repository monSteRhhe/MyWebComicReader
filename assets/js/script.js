'use strict';

// drop to upload
document.ondragover = function(e) {e.preventDefault();}

document.ondrop = function(e) {e.preventDefault();}

uploadbox.ondragover = function(e) {e.preventDefault();}

uploadbox.ondrop = function(e) {
    var zipfile = e.dataTransfer.files[0];
    OpenZip(zipfile);
}


// click to upload
$('.uploadbox').click(function() {
    $('#upload').trigger('click');
})


// open .zip comic from computer
$('#upload').change(function () {
    var zipfile = $(this)[0].files[0];
    OpenZip(zipfile);

    // clear input
    $('#upload').val('');
});


// close reader
$('.close').click(function() {
    $('.toolbox').css('transform', 'translateY(6rem)');
    $('.titlebox').css('transform', 'translateY(-6rem)');

    $('.uploadbox').fadeIn();
    $('.toolbox, .titlebox, .comicreader, .progressbar').fadeOut();

    $('.toggle').html('<img src="assets/img/fa/toggle-on.svg">');
    $('.totalpage').empty();

    $('.autoscroll').html('<img src="assets/img/fa/play-circle.svg">');
    clearInterval(window.scrollDown);
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
    $('.content').empty();

    // hide upload btn
    $('.uploadbox').hide();

    // init & show loading
    $('.loads').html('0 / 0');
    $('.loading').fadeIn('slow');

    // zipfile name as title
    var fne = file.name;
    var fn = fne.substring(0, fne.lastIndexOf("."));
    $('.title').html(fn)

    var max = 0;
    var entryDict = {};

    var cz = new JSZip();
    // read the blob
    cz.loadAsync(file)
    .then(function(zip) {
        // get max length
        var zdict_values = Object.values(zip.files);
        for(var i = 0; i < zdict_values.length; i++) {
            if(zdict_values[i].dir == false) {
                if(checkExt(zdict_values[i].name)) max += 1;
            }
        }

        zip.forEach(function(relativePath, zipEntry) {
            if(zipEntry.dir == false) {
                if(checkExt(zipEntry.name)) {
                    createBlobs(zipEntry, entryDict, max);
                }
            }
        })
    })
}


// get file's MIME type
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
    if(ext != fn) return ext;
    else return '';
}


function createBlobs(entry, entryDict, max) {
    entry
    .async('arraybuffer')
    .then(function(ab) {
        // get arraybuffer
        var data = ab;

        // convert the data into an object url
        var blob = new Blob([data], {type: getMIME(entry.name)});
        var url = URL.createObjectURL(blob);


        var en = entry.name;
        var fn = en.split('/').pop();
        var key = fn.split('.')[0];

        entryDict[key] = url;

        var keyArr = Object.keys(entryDict);
        var len = keyArr.length;


        $('.totalpage').html(max + 'P');
        $('.loads').html(len  + ' / ' + max);

        if(len == max) {
            var sortedDict = {};

            // sort keyArr
            if(keyArr.length >= 3) {
                for(var i = 0; i < keyArr.length - 1 - 1; i++) {
                    for(var j = 0; j < keyArr.length - 1 - i; j++) {
                        if(/[a-z]/i.test(keyArr[j]) || /[a-z]/i.test(keyArr[j + 1])) {
                            if(keyArr[j] > keyArr[j + 1]) {
                                var tmp = keyArr[j];
                                keyArr[j] = keyArr[j + 1];
                                keyArr[j + 1] = tmp;
                            }
                        }
                        else {
                            if(parseInt(keyArr[j]) > parseInt(keyArr[j + 1])) {
                                var tmp = keyArr[j];
                                keyArr[j] = keyArr[j + 1];
                                keyArr[j + 1] = tmp;
                            }
                        }
                    }
                    if(i == keyArr.length - 3) {
                        for(var i = 0; i < keyArr.length; i++) {
                            var k = keyArr[i];
                            sortedDict[i] = entryDict[k];
                            if(i == keyArr.length - 1) openReader(sortedDict, 0);
                        }
                    }
                }
            }
            else if(keyArr.length == 2) {
                if(/[a-z]/i.test(keyArr[0]) || /[a-z]/i.test(keyArr[1])) {
                    if(keyArr[0] > keyArr[1]) {
                        var tmp = keyArr[0];
                        keyArr[0] = keyArr[1];
                        keyArr[1] = tmp;
                    }
                }
                else {
                    if(parseInt(keyArr[0]) > parseInt(keyArr[1])) {
                        var tmp = keyArr[0];
                        keyArr[0] = keyArr[1];
                        keyArr[1] = tmp;
                    }
                }
                for(var i = 0; i < keyArr.length; i++) {
                    var k = keyArr[i];
                    sortedDict[i] = entryDict[k];
                    if(i == keyArr.length - 1) openReader(sortedDict, 0);
                }
            }
            else {
                openReader(entryDict, 0);
            }
        }
    })
}


function openReader(dict, index) {
    var key = Object.keys(dict);

    $('.content').append('<div class="cp"><div class="ll"></div><div class="lr"></div><span>' + (index + 1) + '</span></div>');
    $('.content').append('<img class="cimg" src="' + dict[key[index]] + '"/>');

    if(index != key.length - 1) {
        openReader(dict, index + 1);
    }
    else {
        $('.loading').hide();
        $('.comicreader, .totalpage').fadeIn();
    }
}


// clear blobs
function clearBlobs() {
    $('.cimg').each(function() {
        URL.revokeObjectURL($(this).attr('src'));
    });
}


// scroll to top
$('.to-top').click(function() {
    $('body,html').animate({
        scrollTop: 0
    }, 300)
})


// progress bar
var sh = $(window).height(); // visible screen height

$(document).scroll(function() {
    var st = $(window).scrollTop(); // scrolltop height
    var to = $(document.body).height(); // body height

    var percent = (st + sh) / to;
    if(percent > 1) {percent = 1;}
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
setInterval(function() {
    //var t = sysTime();
    var t = bjTime();
    $('.time').html(t);
}, 1000)


// click to show widgets
$('.content').click(function() {
    if($('.toolbox').css('display') == 'none') {
        $('.toolbox, .titlebox').fadeIn();
        $('.toolbox, .titlebox').css('transform', 'translateY(0)');
    }
    else {
        $('.toolbox').css('transform', 'translateY(6rem)');
        $('.toolbox').fadeOut();

        $('.titlebox').css('transform', 'translateY(-6rem)');
        $('.titlebox').fadeOut();
    }
})


// toggle hide/show of page number
$('.toggle').click(function() {
    var ct = $('.toggle').html();
    ct = $.trim(ct);
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


// auto scroll down
var scrollDown;
$('.autoscroll').click(function() {
    var ct = $('.autoscroll').html();
    ct = $.trim(ct);
    
    var toff = '<img src="assets/img/fa/play-circle.svg">';
    var ton = '<img src="assets/img/fa/stop-circle.svg">';

    var st = $(window).scrollTop();
    var to = $(document.body).height();

    if(ct == ton) {
        $('.autoscroll').html(toff);
        clearInterval(scrollDown);
    }
    else {
        $('.autoscroll').html(ton);
        if(sh + st < to) {
            scrollDown = setInterval(function() {
                var ch = $(window).scrollTop();
                $(window).scrollTop(ch + 2);

                if(sh + parseInt(ch.toFixed(0)) >= to) {
                    clearInterval(scrollDown);
                    $('.autoscroll').html(toff);
                }
            }, 10)
        }
    }
})

