(function ($) {
  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
  }

  function getSelector(settings) {
    if (settings.depth == 0) {
      settings.depth = 6;
    }
    var selectorArr = [];
    for (var i = 1; i <= settings.depth; i++) {
      selectorArr.push("h" + i);
    }
    return selector = selectorArr.join(',');
  }

  function getClass(settings, obj, headline) {

    if (settings.format) {
      var CssClass = "htmlDoc_" + headline[0].nodeName;
      console.log(CssClass);
      obj.addClass(CssClass)
    }
  }

  function activateFix(position, target) {
    $(window).bind('scroll', function () {
      if ($(window).scrollTop() > position) {
        target.addClass('htmlDoc_fixed');
      } else {
        target.removeClass('htmlDoc_fixed');
      }
    });
  }

  function activateScrolling() {
    $('a[href^="#"]').on('click', function (e) {
      e.preventDefault();
      var target = this.hash;
      var $target = $(target);
      selector = "*[id='" + this.hash.replace('#', '') + "']";
      $('html, body').stop().animate({
        'scrollTop': $target.offset().top
      }, 400, 'swing', function () {
        window.location.hash = target;
      });
    });
  }

  $.fn.buildToc = function (options) {
    var settings = $.extend({
      depth: 0,
      format: false,
      smoothScrolling: false,
      fixedAt: false
    }, options);

    var selector = getSelector(settings);

    if ($(selector).length > 0) {
      var content = '<div class="menu"><ul>';
      $(selector).each(function () {
        var id = 'id_' + guid();
        $(this).attr('id', id);
        var listelem = $('<li/>').append('<a href="#' + id + '">' + $(this).text() + '</a>')
        getClass(settings, listelem, $(this));
        content += listelem[0].outerHTML;
      });
      content += '<div></ul>';
      this.append(content);

      if (settings.smoothScrolling) {
        activateScrolling();
      }
      if (settings.fixedAt != false) {
        activateFix(settings.fixedAt, this);
      }
    }
  };
}(jQuery));

(function ($) {
  function getResponse() {
    var deferreds = [];
    $('import').each(function () {
      var href = $(this).attr('src');
      var link = href.split('#');
      var _this = $(this);
      var mee = {
        "link": link,
        "obj": _this
      };
      /**
       * WTF: You can't use a multidimensional array for response,
       * because you don't get the fucking responseText from the ajax return.
       */
      deferreds.push(
          $.get(link[0])
      )
      deferreds.push(
          mee
      )
    })

    return deferreds;
  }

  function applyImports(deferreds, settings) {
    $.when.apply($, deferreds).then(function () {
      for (var i = 0; i < deferreds.length; i = i + 2) {
        if (deferreds[i + 1].link[1] != undefined) {
          var content = $(deferreds[i].responseText).find('#' + deferreds[i + 1].link[1]);
          deferreds[i + 1].obj.replaceWith($(content.html()));
        } else {
          var content = $(deferreds[i].responseText).find('content');
          var append = '';
          $(content).each(function () {
            append += $(this).html();
          })
          deferreds[i + 1].obj.replaceWith(append);
        }
      }


      if (settings.menu != '') {
        if (settings.menuSettings != '') {
          settings.menu.buildToc(settings.menuSettings);
        } else {
          settings.menu.buildToc();
        }
      }
    })
  }

  $.fn.importHTML = function (options) {
    var settings = $.extend({
      menu: '',
      menuSettings: '',
    }, options);

    var deferreds = getResponse();
    applyImports(deferreds, settings);

  };
}(jQuery));