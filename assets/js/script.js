'use strict';

/* 拖放上传 */
document.ondragover = function(e) {
    e.preventDefault();
    $('div.dragbox').show();
    $('div.info').hide();
    $('div.uploadbox').hide();
}
document.ondrop = function(e) {e.preventDefault();}

drag.ondragover = function(e) {
    e.preventDefault();
}
drag.ondragleave = function() {
    $('div.dragbox').hide();
    $('div.info').show();
    $('div.uploadbox').show();
}
drag.ondrop = function(e) {
    var zipfile = e.dataTransfer.files[0];
    OpenZip(zipfile);
    $('div.dragbox').hide();
    $('div.info').show();
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

            var sort_keyArr = sort(keyArr); // 排序keyArr

            for(var i = 0; i < len; i++) {
                var k = sort_keyArr[i];
                sortedDict[i] = entryDict[k];
                if(i == len - 1) openReader(sortedDict, 0);
            }
        }
    })
}


/* 排序 */
// 先默认sort排序后按名称字符串中的数字大小再排序。
function sort(list) {
    var sortList = list.sort(); // sort
    // 按数字大小排序
    for(var i = 0; i < sortList.length - 1; i++) {
        for(var j = 0; j < sortList.length - 2; j++) {
            // 提取图片名字符串中的数字
            var numlist1 = sortList[j].match(/\d+(.\d+)?/g);
            var numlist2 = sortList[j + 1].match(/\d+(.\d+)?/g);

            for(var sp = 0; sp < numlist1.length; sp++) {
                var num1 = parseInt(numlist1[sp]);
                var num2 = parseInt(numlist2[sp]);

                if(sp == 0 && num1 > num2) {
                    var tmp = sortList[j];
                    sortList[j] = sortList[j + 1];
                    sortList[j + 1] = tmp;
                }

                if(numlist1[0] == numlist2[0] && sp > 0 && num1 > num2) {
                    var tmp = sortList[j];
                    sortList[j] = sortList[j + 1];
                    sortList[j + 1] = tmp;
                }
            }
        }
    }
    return sortList;
}


function openReader(dict, index) {
    var key = Object.keys(dict);

    $('.container').append('<div class="cp"><div class="ll"></div><div class="lr"></div><span>' + (index + 1) + '</span></div>'); // 页间
    // 加载图片
    //$('.container').append('<img class="cimg" src="' + dict[key[index]] + '"/>');
    $('.container').append('<img class="cimg" src="data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=" data-src="' + dict[key[index]] + '">');

    if(index != key.length - 1) {
        openReader(dict, index + 1);
    }
    else {
        $('.loading').hide();
        $('.comicreader, .totalpage').fadeIn();

        /* lazyload */
        let images = document.querySelectorAll('.cimg');
        lazyload(images);
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
