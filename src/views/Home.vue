<template>
  <div class="body-content">
    <div id="canvas">
      <div class="zoom-icon zoom-icon-in"></div>
      <div class="magazine-viewport">
        <div class="container">
          <div class="magazine">
            <div ignore="1" class="next-button"></div>
            <div v-for="(item, index) in allPages" :key="index">
              <!-- 书中间的阴影 -->
              <div class="gradient" v-if="index!==0 && index!==allPages.length-1"></div>
              <img style="width:100%;height:100%"  :src="item.name" alt="">
            </div>
            <div ignore="1" class="previous-button"></div>
          </div>
        </div>
      </div>
      <!-- Thumbnails -->
      <div class="thumbnails">
        <div>
          <ul>
            <li class="i">
              <img src="@/assets/1.jpeg" width="40" height="60" class="page-1">
              <span>1</span>
            </li>
            <li class="d">
              <img src="@/assets/2.jpg" width="40" height="60" class="page-2">
              <img src="@/assets/3.jpg" width="40" height="60" class="page-3">
              <span>2-3</span>
            </li>
            <li class="d">
              <img src="@/assets/4.jpeg" width="40" height="60" class="page-4">
              <img src="@/assets/5.jpg" width="40" height="60" class="page-5">
              <span>4-5</span>
            </li>
            <li class="i">
              <img src="@/assets/6.jpeg" width="40" height="60" class="page-6">
              <span>6</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FenMian2",
  components: {},
  data() {
    return {
      page: 6,
      allPages: [
        {
          page: 1,
          name: require("@/assets/1.jpeg"),
        },
        {
          page: 2,
          name: require("@/assets/2.jpg"),
        },
        {
          page: 3,
          name: require("@/assets/3.jpg"),
        },
        {
          page: 4,
          name: require("@/assets/4.jpeg"),
        },
        {
          page: 5,
          name: require("@/assets/5.jpg"),
        },
        {
          page: 6,
          name: require("@/assets/6.jpeg"),
        },
      ],
    };
  },
  mounted() {
    this.$nextTick(() => {
      yepnope({
        test: Modernizr.csstransforms,
        yep: ["extras/turn.js"],
        nope: ["extras/turn.html4.min.js"],
        both: [
          "extras/zoom.min.js",
          "extras/magazine.js",
          "extras/magazine.css",
        ],
        complete: this.loadApp,
        
      });
    });
  },
  methods: {
    loadApp() {
      $("#canvas").fadeIn(1000);
      var flipbook = $(".magazine");
      // Check if the CSS was already loaded
      
      if (flipbook.width() == 0 || flipbook.height() == 0) {
        setTimeout(loadApp, 10);
        return;
      }
      // 翻书音效
      let audio = new Audio()
      audio.src = require("@/assets/book2.mp3")
      audio.loop = true
      // Create the flipbook
      flipbook.turn({
        width: 922,
        height: 600,
        duration: 1000,
        acceleration: !isChrome(),
        gradients: true,
        autoCenter: true,
        elevation: 50,
        pages: this.page,
        when: {
          // 翻页完成之前被启动(最终没翻页不执行)
          turning: function (event, page, view) {
            var book = $(this),
              currentPage = book.turn("page"),
              pages = book.turn("pages");
              // 是否改变路由 (刷新逻辑使用  vue 改变了路由不在是当前模块)
            // Hash.go("page/" + page).update();
            disableControls(page);
            $(".thumbnails .page-" + currentPage)
              .parent()
              .removeClass("current");
            $(".thumbnails .page-" + page)
              .parent()
              .addClass("current");
          },
          // 翻页完成之后启动
          turned: function (event, page, view) {
            disableControls(page);
            $(this).turn("center");
            if (page == 1) {
              $(this).turn("peel", "br");
            }
          },
          // 当当前范围需要某些页面时 触发此事件
          // missing: function (event, pages) {
          //   for (var i = 0; i < pages.length; i++) {
          //     addPage(pages[i], $(this));
          //   }
          // },
          // 页面任何一个动作开始时候 触发
          start: function (event, page, pageObj) {
            const book = $(this),
            currentPage = book.turn("page");
            if(currentPage !== 1){
              audio.play();
            }
          },
          // 页面任何一个动作结束时候 触发
          end: function (event, page, pageObj) {
            audio.pause()
            audio.load();
          }
        },
      });
      // Zoom.js
      $(".magazine-viewport").zoom({
        flipbook: $(".magazine"),
        max: function () {
          return largeMagazineWidth() / $(".magazine").width();
        },
        when: {
          swipeLeft: function () {
            $(this).zoom("flipbook").turn("next");
          },
          swipeRight: function () {
            $(this).zoom("flipbook").turn("previous");
          },
          resize: function (event, scale, page, pageElement) {
            if (scale == 1) loadSmallPage(page, pageElement);
            else loadLargePage(page, pageElement);
          },
          zoomIn: function () {
            $(".thumbnails").hide();
            $(".made").hide();
            $(".magazine").removeClass("animated").addClass("zoom-in");
            $(".zoom-icon")
              .removeClass("zoom-icon-in")
              .addClass("zoom-icon-out");
            if (!window.escTip && !$.isTouch) {
              escTip = true;
              $("<div />", { class: "exit-message" })
                .html("<div>Press ESC to exit</div>")
                .appendTo($("body"))
                .delay(2000)
                .animate({ opacity: 0 }, 500, function () {
                  $(this).remove();
                });
            }
          },
          zoomOut: function () {
            $(".exit-message").hide();
            $(".thumbnails").fadeIn();
            $(".made").fadeIn();
            $(".zoom-icon")
              .removeClass("zoom-icon-out")
              .addClass("zoom-icon-in");
            setTimeout(function () {
              $(".magazine").addClass("animated").removeClass("zoom-in");
              resizeViewport();
            }, 0);
          },
        },
      });
      // Zoom event
      if ($.isTouch) $(".magazine-viewport").bind("zoom.doubleTap", zoomTo);
      else $(".magazine-viewport").bind("zoom.tap", zoomTo);
      // Using arrow keys to turn the page
      $(document).keydown(function (e) {
        var previous = 37,
          next = 39,
          esc = 27;
        switch (e.keyCode) {
          case previous:
            // left arrow
            $(".magazine").turn("previous");
            e.preventDefault();
            break;
          case next:
            //right arrow
            $(".magazine").turn("next");
            e.preventDefault();
            break;
          case esc:
            $(".magazine-viewport").zoom("zoomOut");
            e.preventDefault();
            break;
        }
      });
      // URIs - Format #/page/1
      Hash.on("^page/([0-9]*)$", {
        yep: function (path, parts) {
          var page = parts[1];
          if (page !== undefined) {
            if ($(".magazine").turn("is")) $(".magazine").turn("page", page);
          }
        },
        nop: function (path) {
          if ($(".magazine").turn("is")) $(".magazine").turn("page", 1);
        },
      });
      $(window)
        .resize(function () {
          resizeViewport();
        })
        .bind("orientationchange", function () {
          resizeViewport();
        });
      // Events for thumbnails
      $(".thumbnails").click(function (event) {
        var page;
        if (
          event.target &&
          (page = /page-([0-9]+)/.exec($(event.target).attr("class")))
        ) {
          $(".magazine").turn("page", page[1]);
        }
      });
      $(".thumbnails li")
        .bind($.mouseEvents.over, function () {
          $(this).addClass("thumb-hover");
        })
        .bind($.mouseEvents.out, function () {
          $(this).removeClass("thumb-hover");
        });
      if ($.isTouch) {
        $(".thumbnails")
          .addClass("thumbanils-touch")
          .bind($.mouseEvents.move, function (event) {
            event.preventDefault();
          });
      } else {
        $(".thumbnails ul")
          .mouseover(function () {
            $(".thumbnails").addClass("thumbnails-hover");
          })
          .mousedown(function () {
            return false;
          })
          .mouseout(function () {
            $(".thumbnails").removeClass("thumbnails-hover");
          });
      }
      // Regions
      if ($.isTouch) {
        $(".magazine").bind("touchstart", regionClick);
      } else {
        $(".magazine").click(regionClick);
      }
      // Events for the next button
      $(".next-button")
        .bind($.mouseEvents.over, function () {
          $(this).addClass("next-button-hover");
        })
        .bind($.mouseEvents.out, function () {
          $(this).removeClass("next-button-hover");
        })
        .bind($.mouseEvents.down, function () {
          $(this).addClass("next-button-down");
        })
        .bind($.mouseEvents.up, function () {
          $(this).removeClass("next-button-down");
        })
        .click(function () {
          $(".magazine").turn("next");
        });
      // Events for the next button
      $(".previous-button")
        .bind($.mouseEvents.over, function () {
          $(this).addClass("previous-button-hover");
        })
        .bind($.mouseEvents.out, function () {
          $(this).removeClass("previous-button-hover");
        })
        .bind($.mouseEvents.down, function () {
          $(this).addClass("previous-button-down");
        })
        .bind($.mouseEvents.up, function () {
          $(this).removeClass("previous-button-down");
        })
        .click(function () {
          $(".magazine").turn("previous");
        });
      resizeViewport();
      $(".magazine").addClass("animated");
    },
    /**
     *  初始
     * 
     **/
    init(){
      $(".zoom-icon")
        .bind("mouseover", function () {
          if ($(this).hasClass("zoom-icon-in"))
            $(this).addClass("zoom-icon-in-hover");

          if ($(this).hasClass("zoom-icon-out"))
            $(this).addClass("zoom-icon-out-hover");
        })
        .bind("mouseout", function () {
          if ($(this).hasClass("zoom-icon-in"))
            $(this).removeClass("zoom-icon-in-hover");

          if ($(this).hasClass("zoom-icon-out"))
            $(this).removeClass("zoom-icon-out-hover");
        })
        .bind("click", function () {
          if ($(this).hasClass("zoom-icon-in"))
            $(".magazine-viewport").zoom("zoomIn");
          else if ($(this).hasClass("zoom-icon-out"))
            $(".magazine-viewport").zoom("zoomOut");
        });
      // $("#canvas").hide();
    }
  },
};


// Load the HTML4 version if there's not CSS transform
</script>

<style lang="scss" scoped>
</style>
