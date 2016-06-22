I have used for a while github.io for documentation a project.
In this case, i'am implement a little helper script, which generate a TOC from all <h*> tags.
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
    $('#menu').buildToc({
      depth: 0,
      fixedAt: false,
      format: false,
      smoothScrolling: false,
    });

    /**
     * if you use the import function and want to generate the table of content
     */
    $('import').importHTML({
      menu: $('#menu'),
    });

    /**
     * you can use the settings object
     */
    $('import').importHTML({
      menu: $('#menu'),
      menuSettings: {
        depth: 0,
        fixedAt: false,
        format: false,
        smoothScrolling: false,
      }
    });

you can see a live demo under [link]