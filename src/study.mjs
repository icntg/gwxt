// ==UserScript==
// @name         gwxt study
// @namespace    https://github.com/icntg/gwxt
// @version      0.1
// @description  gwxt study automatically
// @author       starvii
// @require      http://gwxt.sgcc.com.cn/www/html/lnzq/js/jquery-1.8.min.js
// @match        http://gwxt.sgcc.com.cn/*
// @connect      *
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_setClipboard
// @grant GM_log
// @grant GM_xmlhttpRequest
// @grant unsafeWindow
// @grant window.close
// @grant window.focus
// ==/UserScript==


(async function () {
    'use strict';

    const HEADERS = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Cache-Control": "max-age=0",
        "Connection": "close",
        "Upgrade-Insecure-Reuqests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
    }

    let userCode = "";
    let lessons = [];

    async function UI$$$StartButtonClick() {
        console.log(userCode);
        console.log(lessons);
        alert(userCode);
        alert(lessons.join(", "));
    }

    function UI$$$StartButtonAdd() {
        // debugger;
        const boxes = $("div[class='btnbox']");
        if (!boxes) {
            return;
        }
        const box = boxes[boxes.length - 1];
        if (!box) {
            return;
        }
        const children = box.children;
        if (!children) {
            return;
        }
        const c = children[children.length - 1];
        if (!c) {
            return;
        }
        c.innerHTML = c.innerHTML + '<a id="btn-start-study" href="javascript:void(0);">自动学习</a>';
        const link = document.getElementById("btn-start-study");
        if (link) {
            link.addEventListener("click", UI$$$StartButtonClick, false);
        }
    }

    async function getUserCode() {
        const url = "http://gwxt.sgcc.com.cn/www/command/PassControl?flag=getusername_new";
        const f = async () => {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    url: url,
                    method: "POST",
                    headers: HEADERS,
                    onload: function (xhr) {
                        resolve(xhr.responseText);
                    }
                });
            })
        }
        const ret = await f();
        const userCode = JSON.parse(ret).userCode;
        return userCode;
    }

    function getLessonList() {
        const links = $('a[href^="javascript:_enterCourse"]');
        const buffer = [];
        for (let i = 0; i < links.length; i++) {
            const h = links[i].href;
            const i0 = h.indexOf("'");
            const i1 = h.indexOf("'", i0 + 1);
            const courseId = h.slice(i0 + 1, i1);
            buffer.push(courseId);
        };
        return buffer;
    }

    async function studyLesson(userCode, lessonId) {

    }

    userCode = await getUserCode();
    lessons = getLessonList();
    UI$$$StartButtonAdd();
    

    // const CHECKED_DATE = 'checkedDate';

    // function checkDateEquals(a, b) {
    //     return a.getFullYear() === b.getFullYear() &&
    //         a.getMonth() === b.getMonth() &&
    //         a.getDate() === b.getDate();
    // }

    // function checkVagrantVersion() {
    //     GM_setValue(CHECKED_DATE, new Date());
    //     GM_xmlhttpRequest({
    //         "method": "GET",
    //         "url": "https://www.vagrantup.com/",
    //         "headers": {
    //             "user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
    //         },
    //         "onload": function (result) {
    //             var list = jQuery.parseHTML(result.response);
    //             jQuery.each(list, function (i, el) {
    //                 if (el.nodeName == 'HEADER') {
    //                     var header = jQuery.parseXML(el.innerHTML);
    //                     var version = header.getElementsByTagName('a')[1].textContent.replace('Download ', '');
    //                     if (version != '2.2.6') {
    //                         alert('Vagrant update!');
    //                     }
    //                     return false;
    //                 }
    //             });
    //         }
    //     });
    // }

    // var today = new Date();
    // var lastCheckedDay = new Date(GM_getValue(CHECKED_DATE, new Date('2006-1-1')));
    // if (!checkDateEquals(lastCheckedDay, today)) {
    //     checkVagrantVersion();
    // }

})();