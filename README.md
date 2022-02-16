<div align="center"><img src="./docs/banner.webp"/></div>

# MyWebComicReader

> A very simple web based .zip comic reader.
>
> 一个非常简单的基于网页的.zip压缩包漫画阅读器。

​    

## 瞎BB

写的很low，随缘更新  ~~(菜)~~。

功能比较简单，只能看zip压缩包的漫画，只要里面是漫画，套了几层 ~~buff~~ 文件夹都行。

7z直接改后缀改成zip是不行的。

目前仅支持单话的漫画（只有一个文件夹放漫画的），压缩包里有多个文件夹应该不能正常使用。

本地可以通过 VS Code 安装 **Live Server** 扩展使用。

​    

[**DEMO**](https://monsterhhe.github.io/MyWebComicReader)

![serena](./docs/serena.gif)

​    

## Features

- 简单

- 仅支持本地的 **.zip** 压缩包

- 通过点击/拖放上传zip压缩包

- 按压缩包内图片名中的数字大小排序

  改进了下方法，名字中带字符应该也是没问题的

  可能还有点问题，慢慢改进

- 显示加载进度

- 顶部显示阅读进度条

- 左下显示时间/总页数

- 每页顶部（页间）显示页码

- 阅读器点击显示/隐藏标题（压缩包名）

- 阅读器点击显示/隐藏工具栏

  工具栏：回顶部、关闭阅读器、开/关页间页码显示（默认显示）、自动向下滚动

- 优化了图片加载速度

- 用 **Lazyload** 懒加载图片

- 用手机端浏览器看，关闭页间显示后图片间可能会有条缝隙，影响不大应该

​    

## Credits

- JSZip: [Stuk/jszip](https://github.com/Stuk/jszip) `MIT License / GPL v3`
- jQuery: https://jquery.com/ `MIT License`
- FontAwesome: [FortAwesome/Font-Awesome](https://github.com/FortAwesome/Font-Awesome) `CC BY 4.0 License`
- Lazyload: [tuupola/lazyload](https://github.com/tuupola/lazyload) `MIT License`

​    

## Background Image

[monologue](https://www.pixiv.net/artworks/75685593) by Pixiv@Yaduo铮粽子
