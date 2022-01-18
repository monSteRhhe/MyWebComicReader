'use strict';

/* 拖放上传 */
document.ondragover = function(e) {e.preventDefault();}

document.ondrop = function(e) {e.preventDefault();}

uploadbox.ondragover = function(e) {e.preventDefault();}

uploadbox.ondrop = function(e) {
    var zipfile = e.dataTransfer.files[0];
    OpenZip(zipfile);
}


/* 点击选择文件上传 */
$('.uploadbox').click(function() {
    $('#upload').trigger('click');
})


/* 打开zip压缩包 */
$('#upload').change(function () {
    var zipfile = $(this)[0].files[0];
    OpenZip(zipfile);

    $(this).val(''); // 清空input
});


/* 关闭阅读器 */
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


/* 打开zip压缩包的图片 */
function OpenZip(file) {
    // 清除之前的 blob
    clearBlobs();
    $('.container').empty();

    // 隐藏上传
    $('.uploadbox').hide();

    // 显示加载进度
    $('.loads').html('0 / 0');
    $('.loading').fadeIn('slow');

    // zip压缩包名作为标题
    var fne = file.name;
    var fn = fne.substring(0, fne.lastIndexOf("."));
    $('.title').html(fn);

    var max = 0;
    var entryDict = {};

    var cz = new JSZip();
    // 读取 blob
    cz.loadAsync(file)
    .then(function(zip) {
        // 获取总页数
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


/* 获取文件的 MIME type */
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
    var ext = fn.split('.').pop().toLowerCase();
    if(ext != fn) return ext;
    else return '';
}


function createBlobs(entry, entryDict, max) {
    entry
    .async('arraybuffer')
    .then(function(ab) {
        // 获取ArrayBuffer
        var data = ab;

        // data转换ObjectURL
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

            // 排序 keyArr
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

    $('.container').append('<div class="cp"><div class="ll"></div><div class="lr"></div><span>' + (index + 1) + '</span></div>'); // 页间
    // 加载图片
    //$('.container').append('<img class="cimg" src="' + dict[key[index]] + '"/>');
    $('.container').append('<img class="cimg lazy" data-src="' + dict[key[index]] + '" />');

    if(index != key.length - 1) {
        openReader(dict, index + 1);
    }
    else {
        $('.loading').hide();
        $('.comicreader, .totalpage').fadeIn();
        Lazy();
    }
}


/* 清空blob */
function clearBlobs() {
    $('.cimg').each(function() {
        URL.revokeObjectURL($(this).attr('src'));
    });
}


/* 回顶部 */
$('.to-top').click(function() {
    $('body,html').animate({
        scrollTop: 0
    }, 300)
})


/* 进度条 */
var sh = $(window).height(); // 窗口可见高度

$(document).scroll(function() {
    var st = $(window).scrollTop(); // scrolltop高度
    var to = $('.comicreader').height(); // reader高度

    var percent = (st + sh) / to;
    if(percent > 1) {
        percent = 1;
    }
    percent = (percent * 100) + '%';

    $('.processbar').attr('style', 'width: ' + percent + ';');

    if(st == 0) $('.processbar').hide();
})


/* 获取系统时间 */
function sysTime() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();

    if(m <= 9) return h + ': 0' + m;
    else return h + ': ' + m;
}


/* 获取北京时间 */
function bjTime() {
    var d = new Date(new Date().getTime()+(parseInt(new Date().getTimezoneOffset() / 60) + 8) * 3600 * 1000);
    var h = d.getHours();
    var m = d.getMinutes();

    if(m <= 9) return h + ': 0' + m;
    else return h + ': ' + m;
}


/* 点击显示时间 */
setInterval(function() {
    //var t = sysTime();
    var t = bjTime();
    $('.time').html(t);
}, 1000)


/* 点击显示工具栏 */
$('.container').click(function() {
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


/* 页间页数显示/隐藏切换 */
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


/* 自动滚动 */
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

/* jquery.lazy */
function Lazy() {
    $('img.lazy').Lazy({
        bind: 'event',
        scrollDirection: 'vertical',
        effect: 'fadeIn',
        visibleOnly: true
    });
}
