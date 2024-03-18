// ==UserScript==
// @name         gwxt study
// @namespace    https://github.com/icntg/gwxt
// @version      0.1
// @description  gwxt study automatically
// @author       starvii
// @require      http://gwxt.sgcc.com.cn/www/html/lnzq/js/jquery-1.8.min.js
// @match        http://gwxt.sgcc.com.cn/*
// @connect      *
// @run-at document-idle
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_setClipboard
// @grant GM_log
// @grant GM_xmlhttpRequest
// @grant unsafeWindow
// @grant window.close
// @grant window.focus

// ==/UserScript==


const HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Cache-Control": "max-age=0",
    "Connection": "close",
    "Upgrade-Insecure-Reuqests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
};

class UI {
    static ButtonId = "ui-btn-start";

    static addStartButton(clickFunction) {
        // const ButtonId = "ui-btn-start"
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
        c.innerHTML = c.innerHTML + `<a id="${UI.ButtonId}" href="javascript:void(0);">自动学习</a>`;
        const link = document.getElementById(UI.ButtonId);
        if (link) {
            link.addEventListener("click", clickFunction, false);
        }
    }
}

(async function () {
    'use strict';

    async function startLearning() {
        const userCode = await getUserCode();
        const lessons = getLessonList();
        if (!lessons || lessons.length <= 0) {
            GM_notification(
                text = "没有找到可以学习的课程！",
                title = "error",
                timeout = 0,
            );
            throw new Error("getLessonList");
        }
        GM_log(userCode);
        GM_log(lessons);
        // alert(userCode);
        // alert(lessons.join(", "));
        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            await studyLesson(userCode, lesson.id, lesson.name);
            GM_notification(
                text = `《${lesson.name}》学习完成！`,
                title = "done",
                timeout = 500,
            );
        }
    }

    async function getUserCode() {
        const url = "http://gwxt.sgcc.com.cn/www/command/PassControl?flag=getusername_new";
        const ret = await (async () => {
            return new Promise((resolve, _) => {
                GM_xmlhttpRequest({
                    url: url,
                    method: "POST",
                    headers: HEADERS,
                    onload: function (xhr) {
                        resolve(xhr.response);
                    },
                    onerror(_) {
                        GM_notification(text = "getUserCode error!");
                        throw new Error("getUserCode");
                    },
                });
            })
        })();
        const userCode = ret.userCode;
        return userCode;
    }

    function getLessonList() {
        // todo 加上课程名字
        const links = $('a[href^="javascript:_enterCourse"]');
        const names = $();
        const buffer = [];
        for (let i = 0; i < links.length; i++) {
            const h = links[i].href;
            const i0 = h.indexOf("'");
            const i1 = h.indexOf("'", i0 + 1);
            const lessonId = h.slice(i0 + 1, i1);
            const lessonName = names[i];
            buffer.push({
                id: lessonId,
                name: lessonName,
            });
        };
        return buffer;
    }

    async function studyLesson(userCode, lessonId, lessonName) {
        GM_log(`${lessonName} start ...`);
        {
            const url = "http://gwxt.sgcc.com.cn/www/command/XYxkzxControl?flag=chooseLesson_sysc";
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "POST",
                    headers: HEADERS,
                    data: { "leid": lessonId, "category": "1", "seled": "1" },
                    onload: (xhr) => resolve(xhr),
                    onerror() { throw new Error(url); },
                })
            ))();
            GM_log(ret.status);
        }

        {
            const url = `http://gwxt.sgcc.com.cn/www/command/XYxkzxControl?flag=lessonNumCheck&lessonId=${lessonId}`;
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "POST",
                    headers: HEADERS,
                    onload: (xhr) => resolve(xhr),
                    onerror() { throw new Error(url); },
                })
            ))();
            GM_log(ret.status);
        }

        {
            const url = "http://gwxt.sgcc.com.cn/www/command/XYxkzxControl?flag=getIfDafen";
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "POST",
                    headers: HEADERS,
                    data: { "leid": lessonId },
                    onload: (xhr) => resolve(xhr),
                    onerror() { throw new Error(url); },
                })
            ))();
            GM_log(ret.status);
        }

        {
            const url = `http://gwxt.sgcc.com.cn/www/command/LessonAction?flag=study&le_id=${lessonId}&type=4&preview=1&lessontype=1&source=&version=Google`;
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "GET",
                    headers: HEADERS,
                    onload: (xhr) => resolve(xhr),
                    onerror() { throw new Error(url); },
                })
            ))();
            GM_log(ret.status);
        }

        {
            const url = `http://gwxt.sgcc.com.cn/www/jsp/normalCourse/playCourse.jsp?le_id=${lessonId}&preview=1&us_id=${userCode}&source=&ifEnableDrag=true&ifEnablePopup=false`;
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "GET",
                    headers: HEADERS,
                    onload: (xhr) => resolve(xhr),
                    onerror() { throw new Error(url); },
                })
            ))();
            GM_log(ret.status);
        }

        {
            const url = "http://gwxt.sgcc.com.cn:80/www/command/LessonAction";
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "POST",
                    headers: HEADERS,
                    data: {
                        "flag": "updateNormalStudyInfo",
                        "percentNum": "100",
                        "leid": lessonId,
                        "userCode": userCode,
                        "preview": "1",
                        "source": ""
                    },
                    onload: (xhr) => resolve(xhr),
                    onerror() { throw new Error(url); },
                })
            ))();
            GM_log(ret.status);
        }
        GM_log(`${lessonName} end`);
    }

    UI.addStartButton(startLearning);
})();