(function ($) {
  function guid(id) {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }

    return id;
    /*
     return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
     s4() + '-' + s4() + s4() + s4(); */
  }


  function scrollToElement(ele) {
    $(window).scrollTop(ele.offset().top);
  }

  function getSelector(settings) {
    if (settings.menu.depth == 0) {
      settings.menu.depth = 6;
    }
    var selectorArr = [];
    for (var i = 1; i <= settings.menu.depth; i++) {
      selectorArr.push("h" + i);
    }
    return selector = selectorArr.join(',');
  }

  function getClass(settings, obj, headline) {

    if (settings.menu.format) {
      var CssClass = "htmlDoc_" + headline[0].nodeName;
      obj.addClass(CssClass)
    }
  }

  function activateFix(position, target) {
    if (position == true) {
      position = 1;
    }
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
      var selector = "*[id='" + this.hash.replace('#', '') + "']";
      $('html, body').stop().animate({
        'scrollTop': $target.offset().top
      }, 400, 'swing', function () {
        window.location.hash = target;
      });
    });
  }

  function inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
      if (haystack[i] == needle) return true;
    }
    return false;
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
      var content = '<div class="htmlDoc_menu">' +
          '<h2 style="display:none;">Table of Contents</h2>' +
          '<ul>';

      var headlines = []
      $(selector).each(function () {

        var id = getGuid($(this).text(), headlines )

        console.log($(this)[0].className)
        if ($(this)[0].className != '') {

        }
        var replacement = "<a href=\"#" + id + "\"><" + $(this)[0].nodeName + " id=\"" + id + "\" class=\""+$(this)[0].className+"\">" + $(this).text() + "</" + $(this)[0].nodeName + "></a>";
        $(this).replaceWith(replacement);

        var listelem = $('<li/>').append('<a href="#' + id + '">' + $(this).text() + '</a>')
        getClass(settings, listelem, $(this));
        content += listelem[0].outerHTML;
      });


      content += '<div></ul>';
      this.append(content);

      if (settings.menu.smoothScrolling) {
        activateScrolling();
      }

      if (settings.menu.fixedAt != false) {
        activateFix(settings.menu.fixedAt, this);
      }
    }
  };

  function getResponse(element) {
    var deferreds = [];
    element.each(function () {
      if ($(this).attr('src') != undefined) {

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
      }
    })

    return deferreds;
  }

  function getWrapper(element, text, className) {

    var wrapper = '<div class="' + className + '">' +
        element +
        '<span><em>' + text + '</em></span>' +
        '</div>';

    return wrapper
  }

  function normaliseElement(element, attr, classname, options) {
    element.each(function () {
      if ($(this).attr(attr) != undefined) {
        var wrapper = getWrapper($(this)[0].outerHTML, $(this).attr(attr), classname);
        $(this).replaceWith(wrapper);
      }
    })
  }

  function getGuid(str, headlines) {

    var id = guid(str.replace(/ /g, '_'));
    if (!inArray(id, headlines)) {
      headlines.push(id);
    } else {
      var c = 0;
      for (var i = 0; i < headlines.length; i++) {
        if (headlines[i] == id) {
          c++;
        }
      }
      id += "_" + c
      headlines.push(id);
    }

    return id;
  }


  function generateList(header, className, element, attr, settings) {
    var content = '<div class="' + className + '"><h3>' + header + '</h3><ul>';

    var headlines = [];
    element.each(function () {

      if ($(this).attr(attr) != undefined) {
        var id = getGuid($(this).attr(attr), headlines);
      }

      $(this).attr('id', id);
      var listelem = $('<li/>').append('<a href="#' + id + '">' + $(this).attr(attr) + '</a>')
      content += listelem[0].outerHTML;
    });
    content += '<div></ul>';
    return content;
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

      if (settings.normaliseImages == true) {
        $('body').normalizeImages();
      }
      if (settings.normaliseExamples == true) {
        $('body').normalizeExamples();
      }
      if (settings.normaliseTables == true) {
        $('body').normalizeTables();
      }
      if (settings.appendix != false) {
        if(settings.appendix.appendTo != undefined) {
          settings.appendix.appendTo.buildAppendix(settings);
        } else {
          $('body').buildAppendix(settings);
        }
      }
      if (settings.listOfExamples != false) {
        if(settings.listOfExamples.appendTo != undefined) {
          settings.listOfExamples.appendTo.listOfExamples();
        } else {
          $('body').listOfExamples();
        }
      }
      if (settings.listOfFigure != false) {
        if (settings.listOfFigure.appendTo != undefined) {
          settings.listOfFigure.appendTo.listOfFigure();
        } else {
          $('body').listOfFigure();
        }
      }
      if (settings.listOfTables != false) {
        if (settings.listOfTables.appendTo != undefined) {
          settings.listOfTables.appendTo.listOfTables();
        } else {
          $('body').listOfTables();
        }
      }
      if (settings.menu != '') {
        settings.menu.appendTo.buildToc(settings);
        if (window.location.hash != '') {
          scrollToElement($(window.location.hash))
        }
      }

    })
  }

  $.fn.importHTML = function (options) {
    var settings = $.extend({
      menu: '',
      normaliseImages: false,
      normaliseTables: false,
      normaliseExamples: false,
      listOfExamples: false,
      listOfTables: false,
      bibliography: false,
      footnotes: false,
      appendix: false,
      listOfFigure: false,
      glossary: false,
    }, options);

    var deferreds = getResponse($(this));
    applyImports(deferreds, settings);
  };

  $.fn.normalizeTables = function (options) {
    normaliseElement($('table'), 'summary', 'htmlDoc_table', options);
  };

  $.fn.normalizeImages = function (options) {
    normaliseElement($('img'), 'title', 'htmlDoc_image', options);
  };

  $.fn.normalizeExamples = function (options) {
    normaliseElement($('code'), 'title', 'htmlDoc_code', options);
  };


  $.fn.buildAppendix = function (options) {
    var settings = $.extend({}, options);

    var content = "<h2 class='htmlDoc_appendix'>Appendix</h2>";

    if (settings.appendix.listOfExamples != false) {

      content += generateList('List of Examples', 'htmlDoc_loe', $('code'), 'title', settings);
    }
    if (settings.appendix.listOfFigure != false) {
      content += generateList('List of Figures', 'htmlDoc_figures', $('img'), 'title', settings);
    }
    if (settings.appendix.listOfTables != false) {
      content += generateList('List of Tables', 'htmlDoc_lot', $('table'), 'summary', settings);
    }

    $(this).append(content);

  };
  $.fn.listOfExamples = function (options) {
    var settings = $.extend({}, options);
    var content = generateList('List of Examples', 'htmlDoc_loe', $('code'), 'title', settings);
    $(this).append(content);
  };

  $.fn.listOfFigure = function (options) {
    var settings = $.extend({}, options);
    var content = generateList('List of Figures', 'htmlDoc_figures', $('img'), 'title', settings);
    $(this).append(content);
  };

  $.fn.listOfTables = function (options) {
    var settings = $.extend({}, options);
    var content = generateList('List of Tables', 'htmlDoc_lot', $('table'), 'summary', settings);
    $(this).append(content);
  };


}(jQuery));

(function () {
  var beforePrint = function () {
    // document.title = "Print page title";
    // alert('Functionality to run before printing.');
  };
  var afterPrint = function () {
    // alert('Functionality to run after printing');
  };

  if (window.matchMedia) {
    var mediaQueryList = window.matchMedia('print');
    mediaQueryList.addListener(function (mql) {
      if (mql.matches) {
        beforePrint();
      } else {
        afterPrint();
      }
    });
  }

  window.onbeforeprint = beforePrint;
  window.onafterprint = afterPrint;
}());