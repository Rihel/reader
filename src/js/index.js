'use strict';

(function () {

    var Util = {
        prefix: 'html5_reader_',
        StorageGetter: function StorageGetter(key) {
            return localStorage.getItem(Util.prefix + key);
        },
        StorageSetter: function StorageSetter(key, val) {
            return localStorage.setItem(Util.prefix + key, val);
        },
        getBJSONP: function getBJSONP(url, callback) {
            return $.jsonp({
                url: url,
                cache: true,
                callback: 'duokan_fiction_chapter',
                success: function success(result) {

                    var data = $.base64.decode(result);
                    var json = decodeURIComponent(escape(data));
                    callback(json);
                }
            });
        }
    };
    var readerModel = void 0,
        readerUI = void 0,
        $top_nav = $('#top-nav'),
        $bottom_nav = $('#bottom-nav'),
        $day_btn = $('.day-button'),
        $font_btn = $('.font-button'),
        $font_container = $('#font-container'),
        $large_font = $('#large-font'),
        $small_font = $('#small-font'),
        $fiction_container = $('#fiction_container'),
        $bg_list = $('#bg_list'),
        Win = $(window),
        Doc = $(document),
        Body = $('body'),
        initBackgroundColor = Util.StorageGetter('background-color'),
        index = Util.StorageGetter('index'),
        initFontSize = Util.StorageGetter('font-size');
    initFontSize = parseInt(initFontSize);
    if (!initFontSize) {
        initFontSize = 14;
    }
    if (!index) {
        index = 1;
    }
    if (!initBackgroundColor) {
        initBackgroundColor = '#e9dfc7';
    }

    $fiction_container.css('font-size', initFontSize);
    Body.css('background-color', initBackgroundColor);
    $bg_list.find('.bg-container').eq(index).addClass('bg-active');

    function main() {
        //todo 整个项目的入口函数
        readerModel = ReaderModel();
        readerUI = ReaderBaseFrame($fiction_container);
        readerModel.init(function (data) {
            readerUI(data);
        });
        EventHanlder();
    }

    function ReaderModel() {
        //todo 实现和阅读器相关的数据交互的方法

        var chapter_id = void 0;
        var chapterTotal = void 0;
        var init = function init(UIcallback) {
            // getFictionInfo(() => {
            //     getCurChapterContent(chapter_id, (data) => {
            //         UIcallback && UIcallback(data);
            //     })
            // })
            getFictionInfoPromise().then(function (data) {
                return getCurChapterContentPromise();
            }).then(function (data) {
                UIcallback && UIcallback(data);
            });
        };

        var getFictionInfoPromise = function getFictionInfoPromise() {
            return new Promise(function (resolve, reject) {
                $.get('/data/chapter.json', function (data) {
                    //todo 获得章节信息之后的回调
                    if (data.result === 0) {
                        chapter_id = data.chapters[1].chapter_id;
                        chapterTotal = data.chapters.length;
                        resolve(data);
                    } else {
                        reject();
                    }
                }, 'json');
            });
        };
        var getCurChapterContentPromise = function getCurChapterContentPromise() {
            return new Promise(function (resolve, reject) {
                $.get('data/data' + chapter_id + '.json', function (data) {
                    if (data.result === 0) {
                        var url = data.jsonp;
                        Util.getBJSONP(url, function (data) {
                            console.log(JSON.parse(data));
                            resolve(data);
                        });
                    } else {
                        reject({ msg: 'fail' });
                    }
                }, 'json');
            });
        };

        var getFictionInfo = function getFictionInfo(callback) {
            $.get('/data/chapter.json', function (data) {
                //todo 获得章节信息之后的回调
                chapter_id = data.chapters[1].chapter_id;
                chapterTotal = data.chapters.length;
                callback && callback();
            }, 'json');
        };
        var getCurChapterContent = function getCurChapterContent(chapter_id, callback) {
            $.get('data/data' + chapter_id + '.json', function (data) {
                if (data.result === 0) {
                    var url = data.jsonp;
                    Util.getBJSONP(url, function (data) {
                        console.log(JSON.parse(data));
                        callback && callback(data);
                    });
                }
            }, 'json');
        };
        var prevChapter = function prevChapter(UIcallback) {
            chapter_id = parseInt(chapter_id, 10);
            if (chapter_id === 0) {
                return;
            }
            chapter_id -= 1;
            getCurChapterContent(chapter_id, UIcallback);
        };
        var nextChapter = function nextChapter(UIcallback) {
            chapter_id = parseInt(chapter_id, 10);
            if (chapter_id === chapterTotal) {
                return;
            }
            chapter_id += 1;
            getCurChapterContent(chapter_id, UIcallback);
        };
        return {
            init: init,
            prevChapter: prevChapter,
            nextChapter: nextChapter
        };
    }

    function ReaderBaseFrame(container) {
        //todo 渲染基本的UI结构
        function parseChapterDate(jsonData) {
            var jsonObj = JSON.parse(jsonData);
            var html = '<h4>' + jsonObj.t + '</h4>';
            jsonObj.p.forEach(function (item, index) {
                html += '<p>' + item + '</p>';
            });
            return html;
        }
        return function (data) {
            container.html(parseChapterDate(data));
        };
    }

    function EventHanlder() {
        //todo 交互事件的绑定
        $large_font.click(function () {
            if (initFontSize > 20) {
                return;
            }
            initFontSize += 1;
            Util.StorageSetter('font-size', initFontSize);
            $fiction_container.css('font-size', initFontSize / 10 + 'rem');
        });

        $bg_list.find('.bg-container').click(function () {

            if ($(this).hasClass('bg-active')) {
                return;
            }
            initBackgroundColor = $(this).css('background-color');
            Body.css('background-color', initBackgroundColor);

            Util.StorageSetter('background-color', initBackgroundColor);
            Util.StorageSetter('index', $(this).index());
            $bg_list.find('.bg-container').removeClass('bg-active');
            $(this).addClass('bg-active');
        });

        $small_font.click(function () {
            if (initFontSize < 12) {
                return;
            }
            initFontSize -= 1;
            Util.StorageSetter('font-size', initFontSize);
            $fiction_container.css('font-size', initFontSize / 10 + 'rem');
        });
        $('#action_mid').click(function () {
            if ($top_nav.css('display') == 'none') {
                $bottom_nav.show();
                $top_nav.show();
            } else {
                $bottom_nav.hide();
                $top_nav.hide();
                $font_container.hide();
            }
        });
        $font_btn.click(function () {

            if ($font_container.css('display') == 'none') {
                $font_container.show();
                $font_btn.find('i').css({
                    color: '#ff7800'
                });
            } else {
                $font_container.hide();
                $font_btn.find('i').css({
                    color: '#fff'
                });
            }
        });
        $day_btn.click(function () {
            //todo 触发背景切换事件

            console.log($day_btn.find('span').html());
            if ($day_btn.find('span').html() === '夜间') {
                $day_btn.find('i').removeClass('fa-circle').addClass('fa-certificate');
                $day_btn.find('span').html('白天');
                Body.css({
                    background: '#000'
                });
            } else {
                $day_btn.find('i').removeClass('fa-certificate').addClass('fa-circle');
                $day_btn.find('span').html('夜间');
                Body.css({
                    background: '#e9dfc7'
                });
            }
        });
        Win.scroll(function () {
            $bottom_nav.hide();
            $top_nav.hide();
            $font_container.hide();
            $font_btn.find('i').css({
                color: '#fff'
            });
        });
        $('#prev_button').click(function () {
            readerModel.prevChapter(function (data) {
                readerUI(data);
                $('body,html').css({
                    scrollTop: 0
                });
            });
        });
        $('#next_button').click(function () {
            readerModel.nextChapter(function (data) {
                readerUI(data);
                $('body,html').css({
                    scrollTop: 0
                });
            });
        });
    }
    main();
})();