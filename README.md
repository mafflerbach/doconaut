I have used for a while github.io for documentation a project.
In this case, i'am implement a little helper script, which generate a TOC from all h* tags.
I have also implemented an impot Tag for a better organisation for my different sections and of course for reusing some documentation snippets.

The genearl using ist quite simple:

    <!-- import the complete document -->
    <import src="import.xml"></import>

    <!-- import the html fragment with the id content1-->
    <import src="import.xml#content1"></import>

Here the Javascript side:

    /**
     * if you only want generate the table of content
     */
    /*$('#menu').buildToc({
     depth: 0,
     fixedAt: false,
     format: false,
     smoothScrolling: false,
     });
     */
    /**
     * if you use the import function and want to generate the table of content
     */
    /* $('import').importHTML({
     menu: $('#menu'),
     });
     */
    /**
     * you can use the settings object
     */
    $('div').importHTML({
      menu: {
        appendTo: $('#menu'),
        depth: 0,
        fixedAt: true,
        format: true,
        smoothScrolling: true,
      },
      normaliseImages: true,
      normaliseTables: true,
      normaliseExamples: true,
      // for explicit generation
      /*
      if appendTo not defined, it will append to $('body')
      listOfExamples: {
        appendTo: $('#listing')
      },
       // for explicit generation
      listOfTables: {
        appendTo: $('#listing')
      },
       // for explicit generation
      listOfFigure: {
        appendTo: $('#listing')
      }, */
      // for explicit generation
      glossary: {
        appendTo: $('#listing')
      }, */
      // for explicit generation
      bibliography: {
        appendTo: $('#listing')
      }, */
      // for explicit generation
      footnotes: {
        appendTo: $('#listing')
      }, */
      /**
        *  if appendTo not defined, it will append to $('body')
        *  generate appendix automated with
        *  list of examples
        *  list of tables
        *  list of figures
        *  bibliography
        *  glossary
        *  footnotes
        */
      appendix: {
        appendTo: $('#listing'),
      },
      /**
       *
       deaktivate the specifics lists:
      appendix: {
        appendTo: $('#listing'),
        listOfFigure : false,
        listOfTables : false,
        listOfExamples : false
        footnotes : false
        bibliography : false
        glossary : false
      },
       */
    });


you can see a live demo under https://mafflerbach.github.io/htmlDoc/

###Dealing with print header an footer:
Chrome -> uncheck option by header and footer

Edge -> Select Off by  header and footer

internet explorer:

Before printing:

File -> Page Setup, under header and footer set all options to empty

firefox:

Before printing:

File -> Page Setup, under header and footer set all options to empty