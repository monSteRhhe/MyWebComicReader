'use strict';

import {Archive} from '/assets/js/libarchive.js/main.js';

Archive.init({
    workerUrl: '/assets/js/libarchive.js/dist/worker-bundle.js'
});

/**
 * 监听 input 的变化
 */
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
    const file = e.currentTarget.files[0];
    extractFile(file);
    fileInput.value = ''; // 清空 input 的内容
})

/**
 * 点击选择文件上传 
 */
uploadbox.addEventListener('click', () => {
    fileInput.click();
})

/**
 * 拖放上传文件
 */
document.ondragover = (e) => {
    e.preventDefault();
    document.querySelector('#dragbox').style.display = 'block';
    document.querySelector('.info').style.display = 'none';
    document.querySelector('#uploadbox').style.display = 'none';
}
document.ondrop = (e) => {
    e.preventDefault();
}

dragbox.ondragover = (e) => {
    e.preventDefault();
}
dragbox.ondragleave = () => {
    document.querySelector('#dragbox').style.display = 'none';
    document.querySelector('.info').style.display = 'block';
    document.querySelector('#uploadbox').style.display = 'block';
}
dragbox.ondrop = (e) => {
    document.querySelector('#dragbox').style.display = 'none';
    document.querySelector('.info').style.display = 'block';

    const file = e.dataTransfer.files[0];
    extractFile(file);
}

/**
 * 解压文件
 * @param {object} file 上传文件的信息
 */
async function extractFile(file) {
    const archive = await Archive.open(file);

    // 最大图像文件数
    let files_array = await archive.getFilesArray(),
        max_count = 0,
        count = 0,
        entry_dict = {};

    for (let i = 0; i < files_array.length; i++) {
        if (checkExt(files_array[i]['file']['_name'])) {
            max_count += 1;
        }
    }

    // 压缩包名称作为标题
    document.querySelector('.title').innerHTML = archive._file.name.split('.').slice(0, -1).join('.');

    // 隐藏上传
    document.querySelector('#uploadbox').style.display = 'none';

    // 显示加载进度
    document.querySelector('.loads').innerHTML = '0 / 0';
    document.querySelector('.loading').style.display = 'block';

    await archive.extractFiles((entry) => {
        count += 1;
        if (checkExt(entry.file.name)) {
            createBlobs(entry, entry_dict, count, max_count);
        }
    });
}

/**
 * 获取 entry 的 Blob 链接加入字典
 * @param {object} entry 单个文件条目
 * @param {object} entry_dict 图像文件条目对应 Blob 信息的字典
 * @param {number} count 当前加载的页数
 * @param {number} max_page 总页数
 */
function createBlobs(entry, entry_dict, count, max_page) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(entry.file);
    reader.onload = () => {
        let blob = new Blob([reader.result], {type: getMIME(entry.file.name)}),
        url = URL.createObjectURL(blob);

        entry_dict[entry.path] = url;

        document.querySelector('.totalpage').innerHTML = max_page + 'P';
        document.querySelector('.loads').innerHTML = count + ' / ' + max_page;

        if (count == max_page) {
            let sorted_dict = {},
            sort_keyArr = sortArray(Object.keys(entry_dict)); // 排序 entry_dict 的键值

            for(let i = 0; i < count; i++) {
                sorted_dict[i] = entry_dict[sort_keyArr[i]];
                if (i == count - 1) {
                    openReader(sorted_dict, max_page);
                }
            }
        }
    };
}

/** 关闭阅读器 */
let close_btn = document.querySelector('#close');
close_btn.addEventListener('click', () => {
    document.querySelector('#progressbar').style.display = 'none';
    clearBlobs();

    let toolbox_element = document.querySelector('.toolbox'),
        titlebox_element = document.querySelector('.titlebox');
    
    toolbox_element.style.transform = 'translateY(6rem)';
    titlebox_element.style.transform = 'translateY(-6rem)'

    uploadbox.style.display = 'block';

    toolbox_element.classList.add('hidden');
    titlebox_element.classList.add('hidden');

    document.querySelector('.image-viewer').style.display = 'none';
    document.querySelector('#progressbar').style.display = 'none';

    let t_on = '<img src="assets/img/fa/toggle-on.svg">';
    document.querySelector('#toggle').innerHTML = t_on;

    let autoplay_img = '<img src="assets/img/fa/play-circle.svg">';
    document.querySelector('#autoscroll').innerHTML = autoplay_img;

    document.querySelector('.totalpage').innerHTML = '';
    document.querySelector('.container').innerHTML = '';

    clearInterval(scrollDown);
})

/**
 * 获取文件的 MIME-Type
 * @param {string} fn 文件名 
 * @returns MIME-Type
 */
function getMIME(fn) {
    let ext = getExt(fn).toLowerCase();
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

/**
 * 获取文件扩展名
 * @param {string} fn 文件名
 * @returns 扩展名
 */
function getExt(fn) {
    let ext = fn.split('.').pop().toLowerCase();
    if (ext != fn) {
        return ext;
    } else {
        return '';
    }
}

/**
 * 扩展名匹配
 * @param {string} fn 文件名
 * @returns boolean
 */
function checkExt(fn) {
    var ext = getExt(fn);
    if (ext == 'jpg' 
        || ext == 'jpeg' 
        || ext == 'png' 
        || ext == 'gif' 
        || ext == 'bmp' 
        || ext == 'webp') {
            return true;
        } else {
            return false;
        }
}

/**
 * 按名称以及数字大小顺序排序
 * @param {object} arr 未排序的键值数组
 * @returns 排序后的键值数组
 */
function sortArray(arr) {
    let sorted_arr = arr.sort(); // sort排序
    // 按数字大小排序
    for (let i = 0; i < sorted_arr.length; i++) {
        for (let j = 0; j < sorted_arr.length - 1; j++) {
            // 提取图片名字符串中的数字 (多个则分割为数组)
            let num_arr1 = sorted_arr[j].match(/\d+/g),
                num_arr2 = sorted_arr[j + 1].match(/\d+/g);

            if( num_arr1 != null && num_arr2 != null) { // 筛除不包含数字的字符串
                for (let sp = 0; sp < num_arr1.length; sp++) {
                    let num1 = parseInt(num_arr1[sp]),
                        num2 = parseInt(num_arr2[sp]),
                        _ = sorted_arr[j];

                    // 第一段数字比较
                    if(sp == 0 && num1 > num2) {
                        sorted_arr[j] = sorted_arr[j + 1];
                        sorted_arr[j + 1] = _;
                    }

                    // 第一段数字大小相同则比较其他段
                    if(num_arr1[0] == num_arr2[0] && sp > 0 && num1 > num2) {
                        sorted_arr[j] = sorted_arr[j + 1];
                        sorted_arr[j + 1] = _;
                    }
                }
            }
        }
    }
    return sorted_arr;
}

/**
 * 打开阅读器
 * @param {object} dict 排序后的字典
 * @param {number} max_page 图像总数
 */
function openReader(dict, max_page) {
    for (let i = 0; i < max_page; i++) {
        let container_element = document.querySelector('.container');
        // 添加页间
        let page_spacing = document.createElement('div'),
        ps_ll = document.createElement('ll'),
        ps_lr = document.createElement('lr'),
        ps_span = document.createElement('span');
        page_spacing.className = 'page-spacing';
        ps_ll.className = 'll';
        ps_lr.className = 'lr';
        ps_span.innerHTML = i + 1;
        page_spacing.appendChild(ps_ll);
        page_spacing.appendChild(ps_lr);
        page_spacing.appendChild(ps_span);
        container_element.appendChild(page_spacing);
        // 加载图片
        let img_node = document.createElement('img');
        img_node.className = 'content-img';
        img_node.src = 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=';
        img_node.setAttribute('data-src', dict[Object.keys(dict)[i]]);
        container_element.appendChild(img_node);
    }

    document.querySelector('.loading').style.display = 'none';
    document.querySelector('.image-viewer').style.display = 'block';
    document.querySelector('.totalpage').style.display = 'inline';

    // 图片懒加载
    lazyload(document.querySelectorAll('.content-img'));
}

/**
 * 清空 Blob 内容
 */
function clearBlobs() {
    let content_img_element = document.getElementsByClassName('content-img');
    for (let i = 0; i < content_img_element.length; i++) {
        URL.revokeObjectURL(content_img_element[i].getAttribute('src'));
    }
}

/** 
 * 回顶部
 */
let to_top = document.querySelector('#to-top');
to_top.onclick = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * 顶部进度条
 */
let flag = true;
window.addEventListener('scroll', () => {
    if (flag) {
        flag = false;
        window.requestAnimationFrame( scrollProgress );
        setTimeout(() => {flag = true}, 40);
    }
})

function scrollProgress() {
    let pageHeight = document.body.scrollHeight || document.documentElement.scrollHeight,
    screenHeight = document.documentElement.clientHeight,
    scrollHeight = pageHeight - screenHeight,
    scrollTop = document.documentElement.scrollTop,
    progress = document.querySelector('#progressbar');
    progress.style.width = (scrollTop / scrollHeight) * 100 + '%';
}

/**
 * 获取 hh: mm 格式的时间
 * @returns 返回时间
 */
function getTime() {
    let d = new Date(new Date().getTime() + (parseInt(new Date().getTimezoneOffset() / 60) + 8) * 3600 * 1000), // 北京时间
    // d = new Date() 系统时间
    h = d.getHours(),
    m = d.getMinutes(),
    time = (h < 10 ? '0' + h : h) + ': ' + (m < 10 ? '0' + m : m);
    return time;
}

/**
 * 更新显示时间
 */
setInterval(() => {
    document.querySelector('.time').innerHTML = getTime();
}, 1000)


/**
 * 点击切换工具栏显示状态
 */
document.querySelector('.container').addEventListener('click', () => {
    let toolbox_element = document.querySelector('.toolbox'),
        titlebox_element = document.querySelector('.titlebox');

    if (toolbox_element.classList.contains('hidden')) {
        toolbox_element.classList.remove('hidden');
        titlebox_element.classList.remove('hidden');
        toolbox_element.style = 'transform: translateY(0)';
        titlebox_element.style = 'transform: translateY(0)';
    } else {
        toolbox_element.classList.add('hidden');
        titlebox_element.classList.add('hidden');
        toolbox_element.style = 'transform: translateY(6rem)';
        titlebox_element.style = 'transform: translateY(-6rem)';
    }
})


/**
 * 页面间距的显示切换
 */
toggle.onclick = () => {
    let toggle_btn = document.getElementById('toggle'),
    current_toggle = toggle_btn.innerHTML.replace(/^\s+|\s+$/g, ''),
    t_on = '<img src="assets/img/fa/toggle-on.svg">',
    t_off = '<img src="assets/img/fa/toggle-off.svg">',
    spacing = document.querySelectorAll('.page-spacing');

    if(current_toggle == t_on) {
        toggle_btn.innerHTML = t_off;
        for (let i = 0; i < spacing.length; i++) {
            spacing[i].classList.add('hidden');
        }
    } else {
        toggle_btn.innerHTML = t_on;
        for (let i = 0; i < spacing.length; i++) {
            spacing[i].classList.remove('hidden');
        }
    }
}


/**
 * 自动滚动
 */
let scrollDown,
    scroll_btn = document.querySelector('#autoscroll');
scroll_btn.addEventListener('click', () => {
    let current_scroll = scroll_btn.innerHTML;
    
    let s_off = '<img src="assets/img/fa/play-circle.svg">',
        s_on = '<img src="assets/img/fa/stop-circle.svg">',
        sth = document.documentElement.scrollTop, // 滚动高度
        ph = document.body.scrollHeight || document.documentElement.scrollHeight, // 页面高度
        sch = document.documentElement.clientHeight, //窗口高度
        sh = ph - sch; // 页面高度 - 窗口高度

    if (current_scroll == s_on) {
        scroll_btn.innerHTML = s_off;
        clearInterval(scrollDown);
    } else {
        scroll_btn.innerHTML = s_on;
        if (sth < sh) {
            scrollDown = setInterval(() => {
                window.scrollTo({
                    top: document.documentElement.scrollTop + 15,
                    behavior: 'smooth'
                })

                if (sth >= sh) {
                    clearInterval(scrollDown);
                    scroll_btn.innerHTML = s_off;
                }
            }, 100)
        }
    }
})