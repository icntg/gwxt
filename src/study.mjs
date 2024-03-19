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
// @grant GM_notification
// @grant GM_registerMenuCommand
// @grant unsafeWindow
// @grant window.close
// @grant window.focus

// ==/UserScript==


const MAX_RETRIES = 15;

const HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Cache-Control": "max-age=0",
    "Connection": "close",
    "Upgrade-Insecure-Reuqests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
};

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

class UI {
    static ButtonId = "ui-btn-start";
    static DivNotifyId = "ui-div-notify";

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

    static addMessageNotifier() {
        const checker = document.getElementById(UI.DivNotifyId);
        if (checker) {
            return;
        }
        const divWrapper = document.createElement('div');
        divWrapper.style.position = "absolute";
        divWrapper.style.top = "50%";
        divWrapper.style.left = "50%";

        const div = document.createElement('div');
        div.setAttribute("id", UI.DivNotifyId);
        const width = 800;
        const height = 120;
        div.style.display = "none";
        div.style.position = "absolute";
        div.style.width = `${width}px`;
        div.style.height = `${height}px`;
        div.style.left = `-${width / 2}px`;
        div.style.top = `-${height / 2}px`;
        div.style.zIndex = "9999";
        div.style.border = "solid 2px red";
        div.style.lineHeight = `${height}px`;
        div.style.textAlign = "center";
        div.style.backgroundColor = "AliceBlue";
        div.style.fontSize = "30px";
        div.innerText = "";

        divWrapper.appendChild(div);
        document.body.appendChild(divWrapper);
    }

    static notify(text, timeout = 500) {
        function hidden() {
            const div = document.getElementById(UI.DivNotifyId);
            div.style.display = "none";
        }
        const div = document.getElementById(UI.DivNotifyId);
        if (!div) {
            UI.addMessageNotifier();
        }
        div.innerText = text;
        div.style.display = "block";
        if (timeout > 0) {
            setTimeout(hidden, timeout);
        }
    }
}

(async function () {
    'use strict';

    async function startLearning() {
        const lessons = getLessonList();
        if (!lessons || lessons.length <= 0) {
            alert("没有可学习的课程！");
            throw new Error("no lesson");
        }
        const userCode = await getUserCode();
        if (!userCode) {
            alert("获取UserCode失败！");
            throw new Error("no userCode");
        }
        GM_log(userCode);
        GM_log(lessons);
        // alert(userCode);
        // alert(lessons.join(", "));
        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            if (lesson.percentage === "100%") {
                continue;
            }
            await studyLesson(userCode, lesson.id, lesson.name);
            UI.notify(`《${lesson.name}》学习完成！`, 500);
        }
        UI.notify(`页面全部课程学习完成！请刷新页面检查结果！`, 5 * 60 * 1000);
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
                        // 注意，此处响应包中没有 Content-Type，因此直接使用 response 并不会按照 json 进行解析。
                        resolve(xhr.responseText);
                    },
                    onerror(_) {
                        alert("getUserCode error!");
                        throw new Error("getUserCode");
                    },
                });
            })
        })();
        const userCode = JSON.parse(ret).userCode;
        return userCode;
    }

    function getLessonList() {
        const buffer = [];
        const trs = $('a[href^="javascript:_enterCourse"]').parent().parent()
        trs.each((idx, tr) => {
            const name = tr.children[1].children[0].innerText;
            const percentage = tr.children[6].children[1].innerText;
            const h = tr.children[7].children[0].href;
            const i0 = h.indexOf("'");
            const i1 = h.indexOf("'", i0 + 1);
            const id = h.slice(i0 + 1, i1);
            buffer.push({
                id: id,
                name: name,
                percentage: percentage,
            });
        });
        return buffer;
    }

    async function retry(asyncFunc) {
        for (let count = 0; count < MAX_RETRIES; count++) {
            try {
                const ret = await asyncFunc();
                if (0 === ret) {
                    break;
                }
            } catch (err) {
                console.error(`[${count}] ${err}`);
            }
        }
    }

    async function studyLesson(userCode, lessonId, lessonName) {
        GM_log(`${lessonName} start ...`);
        debugger;

        // 选课，非必要
        await retry(async () => {
            const url = "http://gwxt.sgcc.com.cn/www/command/XYxkzxControl?flag=chooseLesson_sysc";
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "POST",
                    headers: HEADERS,
                    data: JSON.stringify({ "leid": lessonId, "category": "1", "seled": "1" }),
                    onload(xhr) { resolve(xhr); },
                    onerror(err) { throw new Error(`${url} ${err}`); },
                })
            ))();
            const info = `${ret.status} ${url}`;
            GM_log(info);
            console.log(info);
            if (ret.status === 200 || ret.status === 302) {
                return 0;
            }
            return ret.status;
        });
        sleep(500);

        await retry(async () => {
            const url = `http://gwxt.sgcc.com.cn/www/command/XYxkzxControl?flag=lessonNumCheck&lessonId=${lessonId}`;
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "POST",
                    headers: HEADERS,
                    onload(xhr) { resolve(xhr); },
                    onerror(err) { throw new Error(`${url} ${err}`); },
                })
            ))();
            const info = `${ret.status} ${url}`;
            GM_log(info);
            console.log(info);
            if (ret.status === 200 || ret.status === 302) {
                return 0;
            }
            return ret.status;
        });
        sleep(500);

        await retry(async () => {
            const url = "http://gwxt.sgcc.com.cn/www/command/XYxkzxControl?flag=getIfDafen";
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "POST",
                    headers: HEADERS,
                    data: JSON.stringify({ "leid": lessonId }),
                    onload(xhr) { resolve(xhr); },
                    onerror(err) { throw new Error(`${url} ${err}`); },
                })
            ))();
            const info = `${ret.status} ${url}`;
            GM_log(info);
            console.log(info);
            if (ret.status === 200 || ret.status === 302) {
                return 0;
            }
            return ret.status;
        });
        sleep(500);

        await retry(async () => {
            const url = `http://gwxt.sgcc.com.cn/www/command/LessonAction?flag=study&le_id=${lessonId}&type=4&preview=1&lessontype=1&source=&version=Google`;
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "GET",
                    headers: HEADERS,
                    onload(xhr) { resolve(xhr); },
                    onerror(err) { throw new Error(`${url} ${err}`); },
                })
            ))();
            const info = `${ret.status} ${url}`;
            GM_log(info);
            console.log(info);
            if (ret.status === 200 || ret.status === 302) {
                return 0;
            }
            return ret.status;
        });
        sleep(500);

        await retry(async () => {
            const url = `http://gwxt.sgcc.com.cn/www/jsp/normalCourse/playCourse.jsp?le_id=${lessonId}&preview=1&us_id=${userCode}&source=&ifEnableDrag=true&ifEnablePopup=false`;
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "GET",
                    headers: HEADERS,
                    onload(xhr) { resolve(xhr); },
                    onerror(err) { throw new Error(`${url} ${err}`); },
                })
            ))();
            const info = `${ret.status} ${url}`;
            GM_log(info);
            console.log(info);
            if (ret.status === 200 || ret.status === 302) {
                return 0;
            }
            return ret.status;
        });
        sleep(500);

        await retry(async () => {
            const url = "http://gwxt.sgcc.com.cn:80/www/command/LessonAction";
            const ret = await (async () => new Promise((resolve, _) =>
                GM_xmlhttpRequest({
                    url: url,
                    method: "POST",
                    headers: HEADERS,
                    data: JSON.stringify({
                        "flag": "updateNormalStudyInfo",
                        "percentNum": "100",
                        "leid": lessonId,
                        "userCode": userCode,
                        "preview": "1",
                        "source": ""
                    }),
                    onload(xhr) { resolve(xhr); },
                    onerror(err) { throw new Error(`${url} ${err}`); },
                })
            ))();
            const info = `${ret.status} ${url}`;
            GM_log(info);
            console.log(info);
            if (ret.status === 200 || ret.status === 302) {
                return 0;
            }
            return ret.status;
        });

        GM_log(`${lessonName} end`);
        sleep(500);
    }

    const _lessons = getLessonList();
    if (_lessons && _lessons.length > 0) {
        GM_registerMenuCommand("自动学习", startLearning);
        UI.addMessageNotifier();
        UI.addStartButton(startLearning);
    }
})();