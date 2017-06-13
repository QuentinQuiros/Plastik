import $ from "jquery";
import scrollify from "jquery-scrollify";

$(function() {

  //Gestion du scroll sur la page d'accueil
  $.scrollify({
    section : ".mag",
    touchScroll : true,
    scrollbars : false,
    scrollSpeed: 600,
    easing: "linear"
  });

  //Gestion de l'animation du menu principal
  const menuEntries = $('#main-menu > ul > li > a.inactive');
  var menuTexts = [];
  for (let i = 0; i < menuEntries.length; i++) {
    menuTexts[i] = menuEntries[i].textContent.trim();
    (function (entry) {
      setTimeout(() => collapseEntry(entry), 750);
    })(menuEntries[i]);
    menuEntries.eq(i).mouseover(function() {
        $(this).find("span").width('auto');
    });
    menuEntries.eq(i).mouseleave(function() {
      collapseEntry(this);
    })
  }

  //Function qui raccourcit le texte des éléments du menu
  function collapseEntry(entry) {
    $(entry).find("span").animate({
        width: '0'
    });
  }

  //Sections d'éléments qui ne concernent que la page article
  const article = $('#article');
  if (article.length) {

    //Gestion du header de la page article
    let headerVisible = false;
    const articleHeader = $('#article-header-container');
    const picRefs = $('#article-body .pic-ref');
    const pics = $('#article-aside .pic');
    const fullscreenBtn = $('.icon.resize');
    const body = $('body');
    const articleBody = $('#article-body');
    const summary = $('#main-menu .summary');
    const summaryNext = $('#main-menu .next');
    const summaryPrevious = $('#main-menu .previous');
    const quoteBtn = $('#quote-btn');
    const quoteInput = $('#quote-input');
    const quoteMessage = $('#quote-message');
    const aside = $('#article-aside');
    const asideContent = $('#article-aside-content');

    const articleOffset = $('#article-body')[0].offsetTop;

    let lastScrolled = 0;
    let currentPicRef = -1;

    //Gestion du scroll sur l'article
    article.scroll(function () {
      let scrolled = article[0].scrollTop;
      handleHeader(scrolled);
      handlePicRef(scrolled, lastScrolled);
      lastScrolled = scrolled;
    });

    //Function qui gère le header
    function handleHeader (scrolled) {
      if (scrolled >= articleOffset && !headerVisible) {
        headerVisible = true;
        articleHeader.addClass('show');
      } else if (scrolled < articleOffset && headerVisible) {
        headerVisible = false;
        articleHeader.removeClass('show');
      }
    }

    //FUnction qui gère les références aux images
    function handlePicRef (scrolled, lastScrolled) {
      if ((scrolled > lastScrolled) && (currentPicRef + 1 < picRefs.length)) {
        let nextPicRef = picRefs[currentPicRef + 1];
        let picRefOffset = nextPicRef.offsetTop;
        let total = scrolled + body.height() / 2;
        if (total > picRefOffset) {
          currentPicRef++;
          scrollAsideToPic(nextPicRef);
        }
      } else if ((scrolled < lastScrolled) && (currentPicRef - 1 >= 0)) {
        let nextPicRef = picRefs[currentPicRef - 1];
        let picRefOffset = nextPicRef.offsetTop;
        let total = scrolled + body.height() / 2;
        if (total < picRefOffset) {
          currentPicRef--;
          scrollAsideToPic(nextPicRef);
        }
      }
    }

    function scrollAsideToPic(picRef) {
      let ref = picRef.getAttribute('to');
      let pic = $(ref);
      let picOffset = pic[0].offsetTop;
      asideContent.stop().animate({scrollTop : picOffset }, 1000, 'swing');
    }

    //Gestion du mode fullscreen
    let fullscreenOn = false;
    fullscreenBtn.click(function () {
      if (!fullscreenOn) {
        fullscreenOn = true;
        body.addClass('fullscreen');
      } else {
        fullscreenOn = false;
        body.removeClass('fullscreen');
      }
    });

    //Gestion de l'agrandissement des images
    pics.click(function () {
      let pic = $(this);
      if (!pic.hasClass('pic-full')) {
        pic.addClass('pic-full');
      } else {
        pic.removeClass('pic-full');
      }
    });

    //Gestion de la modification de la taille du texte des articles
    $('#zoom .plus').click(() => zoomArticle(articleBody));
    $('#zoom .minus').click(() => zoomArticle(articleBody, true));

    //Function qui gère l'aggrandissement du texte
    function zoomArticle(articleBody, back = false) {
      const increment = 1,
            mini = 12,
            max = 24;
      let fontSize = parseInt(articleBody.css('font-size'));
      fontSize += back ? -increment : increment;
      if (fontSize <= max && fontSize >= mini ) articleBody.css('font-size', fontSize);
    }


    //Scrolle la section sommaire du menu principal jusqu'à la bonne entrée
    setTimeout (function() {
      const active = summary.find('p.active');
      if (active.length) {
        let offset = active[0].offsetTop;
        let height = active.outerHeight();
        summary.stop().animate({scrollTop : offset - height}, 1000, 'swing');
      }
    }, 750);

    summaryNext.click(() => scrollSummary(summary));
    summaryPrevious.click(() => scrollSummary(summary, true));

    //Fonction qui scroll le sommaire du menu principal
    function scrollSummary (summary, back = false) {
      const scrollIncrement = 150;
      let scroll = summary.scrollTop() || 0;
      scroll += back ? -scrollIncrement : scrollIncrement;
      if (scroll) summary.stop().animate({scrollTop : scroll}, 250, 'swing');
    }


    //Gestion du bouton de copie de la citation
    quoteBtn.click(function () {
      quoteInput.select();
      let copy;
      try {
        copy = document.execCommand('copy');
      } catch (e) {
        copy = false;
      } finally {
        if (copy) {
          quoteMessage.text("Citation copiée dans le presse-papier !");
        } else {
          quoteMessage.text("La copie automatique n'est pas prise en charge par votre navigateur. Merci de copier manuellement.");
        }
      }
    });

  }

});
