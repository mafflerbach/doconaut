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

  function hash() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
     return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
     s4() + '-' + s4() + s4() + s4();
  }


  function scrollToElement(ele) {
    $(window).scrollTop(ele.offset().top);
  }

  function getSelector(settings) {
    if (settings.menu.depth == 0 || settings.menu.depth == undefined) {
      settings.menu.depth = 6;
    }
    var selectorArr = [];
    for (var i = 1; i <= settings.menu.depth; i++) {
      selectorArr.push("h" + i);
    }
    return selectorArr.join(',');
  }

  function getClass(settings, obj, headline) {

    if (settings.menu.format) {
      var CssClass = "doconaut_" + headline[0].nodeName;
      obj.addClass(CssClass)
    }
  }

  function activateFix(position, target) {
    if (position == true) {
      position = 1;
    }
    $(window).bind('scroll', function () {
      if ($(window).scrollTop() > position) {
        target.addClass('doconaut_fixed');
      } else {
        target.removeClass('doconaut_fixed');
      }
    });
  }

  function activateScrolling() {
    $('a[href^="#"]').on('click', function (e) {
      e.preventDefault();
      var target = this.hash;
      var $target = $(target);

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
      var content = '<div class="doconaut_menu">' +
          '<h2 style="display:none;">Table of Contents</h2>' +
          '<ul>';

      var headlines = [];
      $(selector).each(function () {
        var muu = $(this).children().remove().end().text($.trim($(this).text())).text().replace(/\r?\n|\r/g, '');
        var string = muu.replace(/\s+/g, ' ');

        var link = string.replace(/\'/, ' ');
        link = link.replace(/\?/, '');

        var id = getGuid(link, headlines);
        var replacement = "<a href=\"#" + id + "\"><" + $(this)[0].nodeName + " id=\"" + id + "\" class=\"" + $(this)[0].className + "\">" + string + "</" + $(this)[0].nodeName + "></a>";
        $(this).replaceWith(replacement);
        var listelem = $('<li/>').append('<a href="#' + id + '">' + string + '</a>');
        getClass(settings, listelem, $(this));
        content += listelem[0].outerHTML;
      });


      content += '<div></ul>';
      this.append(content);

      if (settings.menu.smoothScrolling) {
        activateScrolling();
      }

      if (settings.menu.fixedAt !=  undefined) {
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
        );
        deferreds.push(
            mee
        )
      }
    });

    return deferreds;
  }

  function getWrapper(element, text, className) {
    return '<div class="' + className + '">' +
        element +
        '<span><em>' + text + '</em></span>' +
        '</div>';
  }

  function normaliseElement(element, attr, classname) {
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
      id += "_" + c;
      headlines.push(id);
    }

    return id;
  }


  function generateList(header, className, element, attr) {
    var content = '<div class="' + className + '"><h3>' + header + '</h3><ul>';
    var headlines = [];
    var count = 0;
    element.each(function () {
      if ($(this).attr(attr) != undefined) {
        count++;
        if ($(this).attr(attr) != undefined) {
          var id = getGuid($(this).attr(attr), headlines);
        }
        $(this).attr('id', id);
        var listelem = $('<li/>').append('<a href="#' + id + '">' + $(this).attr(attr) + '</a>');
        content += listelem[0].outerHTML;
      }
    });
    content += '<div></ul>';
    if (count > 0) {
      return content;
    } else {
      return '';
    }
  }


  function applyImports(deferreds, settings) {
    $.when.apply($, deferreds).then(function () {
      var content = '';
      for (var i = 0; i < deferreds.length; i = i + 2) {
        if (deferreds[i + 1].link[1] != undefined) {
          content = $(deferreds[i].responseText).find('#' + deferreds[i + 1].link[1]);
          deferreds[i + 1].obj.replaceWith($(content.html()));
        } else {
          content = $(deferreds[i].responseText).find('content');
          var append = '';
          $(content).each(function () {
            append += $(this).html();
          });
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
        if (settings.appendix.appendTo != undefined) {
          settings.appendix.appendTo.buildAppendix(settings);
        } else {
          $('body').buildAppendix(settings);
        }
      }
      if (settings.listOfExamples != false) {
        if (settings.listOfExamples.appendTo != undefined) {
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
      if (settings.glossary != false) {
        if (settings.glossary.appendTo != undefined) {
          settings.glossary.appendTo.glossary();
        } else {
          $('body').glossary();
        }
      }
      if (settings.footnotes != false) {
        if (settings.footnotes.appendTo != undefined) {
          settings.footnotes.appendTo.footnotes();
        } else {
          $('body').footnotes();
        }
      }
      if (settings.bibliography != false) {
        if (settings.bibliography.appendTo != undefined) {
          settings.bibliography.appendTo.bibliography();
        } else {
          $('body').bibliography();
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


  function collectSpecialContent(ids) {
    for (var i = 0; i < ids.length; i++) {
      ids[i] = '#' + ids[i];
    }
    return $(ids.join(',')).detach();
  }

  function sortGlossary(elements) {
    function sortElements(a, b) {
      return ($(b).attr('id').toUpperCase()) < ($(a).attr('id').toUpperCase()) ? 1 : -1;
    }

    return elements.sort(sortElements);
  }

  function emphasisSpecialTags(element, bracket) {
    var ids = [];
    element.each(function () {
      var id = $(this).text().replace(/ /g, '_');
      ids.push(id);
      if (bracket != undefined) {
        var content = "<a href='#" + id + "'> <em>[" + $(this).text() + "]</em></a>";
      } else {
        var content = "<a href='#" + id + "'> <em>" + $(this).text() + "</em></a>";
      }
      $(this).replaceWith(content);
    });
    return ids;
  }

  function addAlphabet(nodes) {
    function getWrapper(element) {
      return "<div><div class='col-3-12' id='" + element.attr('id') + "'>" +
          element.attr('id').replace(/_/g, ' ') +
          "</div>" +
          "<div class='col-9-12'>" +
          element.html() +
          "</div></div>";
    }

    var alphabet = [];
    var parent = $("<div class='doconaut_glossary'>");

    nodes.each(function () {
      var letter = $(this).attr('id')[0].toUpperCase();
      if (!inArray(letter, alphabet)) {
        var c = $('<div class="doconaut_letterSection"/>');
        alphabet.push(letter);
        letter = $('<div class="doconaut_letter"><span id="letter_' + letter + '">' + letter + '</span></div>');
        c.append(letter);
        c.append($(getWrapper($(this))).addClass("doconaut_glossentry grid "));
      } else {
        parent.find('#letter_' + letter).parent().parent().append($(getWrapper($(this))).addClass("doconaut_glossentry grid"));
      }
      parent.append(c);
    });

    return parent
  }

  function appendix(element, options) {
    var settings = $.extend({}, options);
    var content = "<h2 class='doconaut_appendix'>Appendix</h2>";
    element.append(content);
    if (settings.appendix.listOfExamples != false && $('code').length > 0) {
      element.append(generateList('List of Examples', 'doconaut_loe', $('code'), 'title', settings));
    }
    if (settings.appendix.listOfFigure != false && $('img').length > 0) {
      element.append(generateList('List of Figures', 'doconaut_figures', $('img'), 'title', settings));
    }
    if (settings.appendix.listOfTables != false && $('table').length > 0) {
      element.append(generateList('List of Tables', 'doconaut_lot', $('table'), 'summary', settings));
    }
    if (settings.appendix.bibliography != false) {
      element.bibliography();
    }
    if (settings.appendix.glossary != false) {
      element.glossary();
    }
    if (settings.appendix.footnotes != false) {
      element.footnotes();
    }
  }

  $.fn.doconaut = function (options) {
    var settings = $.extend({
      menu: false,
      normaliseImages: true,
      normaliseTables: true,
      normaliseExamples: true,
      listOfExamples: false,
      listOfTables: false,
      appendix: true,
      listOfFigure: false,
      bibliography: false,
      footnotes: false,
      glossary: false
    }, options);

    var deferreds = getResponse($(this));
    applyImports(deferreds, settings);
  };

  $.fn.normalizeTables = function (options) {
    normaliseElement($('table'), 'summary', 'doconaut_table', options);
  };

  $.fn.normalizeImages = function (options) {
    normaliseElement($('img'), 'title', 'doconaut_image', options);
  };

  $.fn.normalizeExamples = function (options) {
    normaliseElement($('code'), 'title', 'doconaut_code', options);
  };

  $.fn.buildAppendix = function (options) {
    appendix($(this), options);
  };

  $.fn.listOfExamples = function (options) {
    var settings = $.extend({}, options);
    var content = generateList('List of Examples', 'doconaut_loe', $('code'), 'title', settings);
    $(this).append(content);
  };



  $.fn.footnotes = function (options) {

    $('footnote').each(function (index, val) {

      var footnote = '';
      var footnoteContent = '';
      var content = '';
      if ($(this).attr('src') != undefined) {
        var parent = $(this).parent().parent();
        var id = $(this).attr('src');
        content = '<em><a href="#' + id + '"><sup>(' + (index + 1) + ')</sup></a></em> ';
        $(this).replaceWith(content);

        footnote = $('#' + id)[0].outerHTML;
        footnoteContent = '<div class="footnote"><span><sup>(' + (index + 1) + ')</sup></span> ' + footnote + '</div>';

        $('#' + id).remove();
        parent.append(footnoteContent);
        $(this).parent().append(footnoteContent);
      } else {
        var appendTo = $(this).parent().parent();
        id = hash();
        footnote = $(this)[0].outerHTML;
        footnoteContent = '<div class="footnote" id='+id+'><span><sup>(' + (index + 1) + ')</sup></span> ' + footnote + '</div>';
        content = '<em><a href="#' + id + '"><sup>(' + (index + 1) + ')</sup></a></em> ';
        $(this).replaceWith(content);
        appendTo.append($(footnoteContent));
      }
    });
  };
  $.fn.glossary = function () {
    var count = $('glossentry').length;
    var ids = emphasisSpecialTags($('glossentry'));
    var nodes = addAlphabet(sortGlossary(collectSpecialContent(ids)));
    var content = "<div><h3>Glossary</h3>";
    nodes.each(function () {
      content += $(this)[0].outerHTML;
    });
    content += "</div>";
    if (count > 0) {
      $(this).append(content);
    }
  };

  $.fn.bibliography = function () {
    function getWrapper(element) {
      return "<div><div class='col-1-12' id='" + element.attr('id') + "'>" +
          element.attr('id') +
          "</div>" +
          "<div class='col-11-12'>" +
          element.html() +
          "</div></div>";
    }

    var count = $('biblioentry').length;
    var ids = emphasisSpecialTags($('biblioentry'), true);
    var nodes = collectSpecialContent(ids);
    var content = "<div><h3>Bibliography</h3>";
    nodes.each(function () {

      content += getWrapper($(this));
    });
    content += "</div>";
    if (count > 0) {
      $(this).append(content);
    }
  };

  $.fn.listOfFigure = function (options) {
    var settings = $.extend({}, options);
    var content = generateList('List of Figures', 'doconaut_figures', $('img'), 'title', settings);
    $(this).append(content);
  };

  $.fn.listOfTables = function (options) {
    var settings = $.extend({}, options);
    var content = generateList('List of Tables', 'doconaut_lot', $('table'), 'summary', settings);
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