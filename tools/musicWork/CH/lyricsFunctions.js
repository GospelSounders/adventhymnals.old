const path = require('path');
require = require('esm')(module /*, options*/ );
// import {Midi} from './Midi'
// const Midi = require('./Midi')
// const fs = require('fs-extra');
// const {
//     convertArrayToCSV
// } = require('convert-array-to-csv');

const fs = require('fs-extra');
const nthline = require('nthline');
const to = require('await-to-js').to,
  extractor = require('unfluff'),
  parser = require('node-html-parser').parse;

// export {instrumentByPatchID, instrumentFamilyByID, drumKitByPatchID} from './instrumentMaps'

const lyricsFolder = path.join(__dirname, "../");

const pageData = `
<!DOCTYPE html>
<html lang="en" dir="ltr">

<head profile="http://www.w3.org/1999/xhtml/vocab">
    <meta name="viewport" content="initial-scale=1.0" />
    <meta charset="utf-8"/>
    <meta property="og:url" content="https://hymnary.org/hymn/CSR1908/3" />    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="Generator" content="Drupal 7 (http://drupal.org)" />
<meta name="theme-color" content="#e9e6cd" />
<link rel="shortcut icon" href="https://hymnary.org/sites/hymnary.org/themes/newhymn/favicon.ico" type="image/vnd.microsoft.icon" />
<link rel="apple-touch-icon" href="https://hymnary.org/files/Hymnary_big_0.png" type="image/png" />
  <title>Christ in Song: for all religious services nearly one thousand best gospel hymns, new and old with responsive scripture readings (Rev. and Enl.) 3. In the land of strangers | Hymnary.org</title>
    <style type="text/css" media="all">
@import url("https://hymnary.org/modules/system/system.base.css?q2s3f1");
@import url("https://hymnary.org/modules/system/system.menus.css?q2s3f1");
@import url("https://hymnary.org/modules/system/system.messages.css?q2s3f1");
@import url("https://hymnary.org/modules/system/system.theme.css?q2s3f1");
</style>
<style type="text/css" media="all">
@import url("https://hymnary.org/misc/ui/jquery.ui.core.css?q2s3f1");
@import url("https://hymnary.org/misc/ui/jquery.ui.theme.css?q2s3f1");
@import url("https://hymnary.org/misc/ui/jquery.ui.tabs.css?q2s3f1");
</style>
<style type="text/css" media="all">
@import url("https://hymnary.org/modules/comment/comment.css?q2s3f1");
@import url("https://hymnary.org/modules/field/theme/field.css?q2s3f1");
@import url("https://hymnary.org/sites/all/modules/logintoboggan/logintoboggan.css?q2s3f1");
@import url("https://hymnary.org/modules/node/node.css?q2s3f1");
@import url("https://hymnary.org/modules/poll/poll.css?q2s3f1");
@import url("https://hymnary.org/sites/all/modules/ubercart/uc_file/uc_file.css?q2s3f1");
@import url("https://hymnary.org/sites/all/modules/ubercart/uc_order/uc_order.css?q2s3f1");
@import url("https://hymnary.org/sites/all/modules/ubercart/uc_product/uc_product.css?q2s3f1");
@import url("https://hymnary.org/sites/all/modules/ubercart/uc_store/uc_store.css?q2s3f1");
@import url("https://hymnary.org/modules/user/user.css?q2s3f1");
@import url("https://hymnary.org/modules/forum/forum.css?q2s3f1");
@import url("https://hymnary.org/sites/all/modules/views/css/views.css?q2s3f1");
@import url("https://hymnary.org/sites/all/modules/ckeditor/css/ckeditor.css?q2s3f1");
</style>
<style type="text/css" media="all">
@import url("https://hymnary.org/sites/hymnary.org/modules/advertising/advertising.css?q2s3f1");
</style>
<style type="text/css" media="print">
@import url("https://hymnary.org/sites/hymnary.org/modules/advertising/advertising-print.css?q2s3f1");
</style>
<style type="text/css" media="all">
@import url("https://hymnary.org/sites/all/modules/ctools/css/ctools.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/modules/hymnary/hymnary.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/modules/hymnary/hymnary-mobile.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/modules/hymnary/jquery-tooltip/jquery.tooltip.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/modules/hymnary/jquery.editable-select.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/modules/hymnary_ecommerce/hymnary_ecommerce.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/modules/luyh/luyh.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/modules/hymnary/hymn.css?q2s3f1");
@import url("https://hymnary.org/sites/all/modules/fontello/css/fontello.fix.css?q2s3f1");
@import url("https://hymnary.org/files/icon/fontello/hymnary/css/fontello.css?q2s3f1");
@import url("https://hymnary.org/files/icon/fontello/hymnary/css/animation.css?q2s3f1");
</style>

<!--[if IE 7]>
<style type="text/css" media="all">
@import url("https://hymnary.org/files/icon/fontello/hymnary/css/fontello-ie7.css?q2s3f1");
</style>
<![endif]-->
<style type="text/css" media="all">
@import url("https://hymnary.org/sites/hymnary.org/modules/hymnary_common/css/popover.css?q2s3f1");
</style>
<style type="text/css" media="all">
@import url("https://hymnary.org/sites/hymnary.org/themes/newhymn/style.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/themes/newhymn/style-mobile.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/themes/newhymn/uc_cart_block-override.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/themes/newhymn/hamburger.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/themes/newhymn/hamburger-submenu.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/themes/newhymn/sidr/hymnary-sidr-theme.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/themes/newhymn/headerbar-menu.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/themes/newhymn/pager.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/themes/newhymn/all.css?q2s3f1");
@import url("https://hymnary.org/sites/hymnary.org/themes/newhymn/blockedBanner.css?q2s3f1");
</style>
    <script type="text/javascript" src="https://hymnary.org/misc/jquery.js?v=1.4.4"></script>
<script type="text/javascript" src="https://hymnary.org/misc/jquery-extend-3.4.0.js?v=1.4.4"></script>
<script type="text/javascript" src="https://hymnary.org/misc/jquery.once.js?v=1.2"></script>
<script type="text/javascript" src="https://hymnary.org/misc/drupal.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/misc/ui/jquery.ui.core.min.js?v=1.8.7"></script>
<script type="text/javascript" src="https://hymnary.org/misc/ui/jquery.ui.widget.min.js?v=1.8.7"></script>
<script type="text/javascript" src="https://hymnary.org/misc/ui/jquery.ui.tabs.min.js?v=1.8.7"></script>
<script type="text/javascript" src="https://hymnary.org/sites/all/modules/ubercart/uc_file/uc_file.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/modules/hymnary/hymnary-search-block.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/modules/hymnary/jquery-tooltip/jquery.tooltip.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/modules/hymnary/jquery-tooltip/lib/jquery.delegate.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/modules/hymnary/jquery-tooltip/lib/jquery.bgiframe.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/modules/hymnary/jquery.editable-select.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/modules/hymnary/popup.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/modules/hymnary_common/js/js.cookie.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/modules/luyh/luyh.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/modules/hymnary/hymnary-page_hymn.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/modules/hymnary_common/js/popover.js?q2s3f1"></script>
<script type="text/javascript" src="https://code.jquery.com/jquery-3.4.0.slim.min.js?q2s3f1"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/bloodhound.min.js?q2s3f1"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/typeahead.bundle.min.js?q2s3f1"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/typeahead.jquery.min.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/modules/hymnary/hymnary_search_autocomplete.js?q2s3f1"></script>
<script type="text/javascript">
<!--//--><![CDATA[//><!--
var jQ340 = jQuery.noConflict(true);
//--><!]]>
</script>
<script type="text/javascript">
<!--//--><![CDATA[//><!--

            jQuery(function()
            {
                jQuery('#scripref0').bind( 'mouseenter', { content: '<div class="popover-header">Luke 15:24 (NRSV)</div><div class="popover-body"><div class="scripverse"><p><sup class="verse">24</sup>for this son of mine was dead and is alive again; he was lost and is found!’ And they began to celebrate. </p> </p></div></div><div class="popover-footer">New Revised Standard Version Bible, copyright 1989, Division of Christian Education of the National Council of the Churches of Christ in the United States of America. Used by permission. All rights reserved.</div>' }, popoverBaseMouseenter );
            });
        
//--><!]]>
</script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/hamburger.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/hamburger-submenu.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/headerbar-menu.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/retina.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/includes.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/experiment.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/all.min.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/ads.js?q2s3f1"></script>
<script type="text/javascript" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/blockedBanner.js?q2s3f1"></script>
<script type="text/javascript">
<!--//--><![CDATA[//><!--
jQuery.extend(Drupal.settings, {"basePath":"\/","pathPrefix":"","ajaxPageState":{"theme":"newhymn","theme_token":"P0GE18uPttbIvesE5_h8Wsg5Mqgo0ywj5geuBTy4LDE","js":{"misc\/jquery.js":1,"misc\/jquery-extend-3.4.0.js":1,"misc\/jquery.once.js":1,"misc\/drupal.js":1,"misc\/ui\/jquery.ui.core.min.js":1,"misc\/ui\/jquery.ui.widget.min.js":1,"misc\/ui\/jquery.ui.tabs.min.js":1,"sites\/all\/modules\/ubercart\/uc_file\/uc_file.js":1,"sites\/hymnary.org\/modules\/hymnary\/hymnary-search-block.js":1,"sites\/hymnary.org\/modules\/hymnary\/jquery-tooltip\/jquery.tooltip.js":1,"sites\/hymnary.org\/modules\/hymnary\/jquery-tooltip\/lib\/jquery.delegate.js":1,"sites\/hymnary.org\/modules\/hymnary\/jquery-tooltip\/lib\/jquery.bgiframe.js":1,"sites\/hymnary.org\/modules\/hymnary\/jquery.editable-select.js":1,"sites\/hymnary.org\/modules\/hymnary\/popup.js":1,"sites\/hymnary.org\/modules\/hymnary_common\/js\/js.cookie.js":1,"sites\/hymnary.org\/modules\/luyh\/luyh.js":1,"sites\/hymnary.org\/modules\/hymnary\/hymnary-page_hymn.js":1,"sites\/hymnary.org\/modules\/hymnary_common\/js\/popover.js":1,"https:\/\/code.jquery.com\/jquery-3.4.0.slim.min.js":1,"https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/typeahead.js\/0.11.1\/bloodhound.min.js":1,"https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/typeahead.js\/0.11.1\/typeahead.bundle.min.js":1,"https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/typeahead.js\/0.11.1\/typeahead.jquery.min.js":1,"sites\/hymnary.org\/modules\/hymnary\/hymnary_search_autocomplete.js":1,"0":1,"1":1,"sites\/hymnary.org\/themes\/newhymn\/hamburger.js":1,"sites\/hymnary.org\/themes\/newhymn\/hamburger-submenu.js":1,"sites\/hymnary.org\/themes\/newhymn\/headerbar-menu.js":1,"sites\/hymnary.org\/themes\/newhymn\/retina.js":1,"sites\/hymnary.org\/themes\/newhymn\/includes.js":1,"sites\/hymnary.org\/themes\/newhymn\/experiment.js":1,"sites\/hymnary.org\/themes\/newhymn\/all.min.js":1,"sites\/hymnary.org\/themes\/newhymn\/ads.js":1,"sites\/hymnary.org\/themes\/newhymn\/blockedBanner.js":1},"css":{"modules\/system\/system.base.css":1,"modules\/system\/system.menus.css":1,"modules\/system\/system.messages.css":1,"modules\/system\/system.theme.css":1,"misc\/ui\/jquery.ui.core.css":1,"misc\/ui\/jquery.ui.theme.css":1,"misc\/ui\/jquery.ui.tabs.css":1,"modules\/comment\/comment.css":1,"modules\/field\/theme\/field.css":1,"sites\/all\/modules\/logintoboggan\/logintoboggan.css":1,"modules\/node\/node.css":1,"modules\/poll\/poll.css":1,"sites\/all\/modules\/ubercart\/uc_file\/uc_file.css":1,"sites\/all\/modules\/ubercart\/uc_order\/uc_order.css":1,"sites\/all\/modules\/ubercart\/uc_product\/uc_product.css":1,"sites\/all\/modules\/ubercart\/uc_store\/uc_store.css":1,"modules\/user\/user.css":1,"modules\/forum\/forum.css":1,"sites\/all\/modules\/views\/css\/views.css":1,"sites\/all\/modules\/ckeditor\/css\/ckeditor.css":1,"sites\/hymnary.org\/modules\/advertising\/advertising.css":1,"sites\/hymnary.org\/modules\/advertising\/advertising-print.css":1,"sites\/all\/modules\/ctools\/css\/ctools.css":1,"sites\/hymnary.org\/modules\/hymnary\/hymnary.css":1,"sites\/hymnary.org\/modules\/hymnary\/hymnary-mobile.css":1,"sites\/hymnary.org\/modules\/hymnary\/jquery-tooltip\/jquery.tooltip.css":1,"sites\/hymnary.org\/modules\/hymnary\/jquery.editable-select.css":1,"sites\/hymnary.org\/modules\/hymnary_ecommerce\/hymnary_ecommerce.css":1,"sites\/hymnary.org\/modules\/luyh\/luyh.css":1,"sites\/hymnary.org\/modules\/hymnary\/hymn.css":1,"sites\/all\/modules\/fontello\/css\/fontello.fix.css":1,"public:\/\/icon\/fontello\/hymnary\/css\/fontello.css":1,"public:\/\/icon\/fontello\/hymnary\/css\/animation.css":1,"public:\/\/icon\/fontello\/hymnary\/css\/fontello-ie7.css":1,"sites\/hymnary.org\/modules\/hymnary_common\/css\/popover.css":1,"sites\/hymnary.org\/themes\/newhymn\/style.css":1,"sites\/hymnary.org\/themes\/newhymn\/style-mobile.css":1,"sites\/hymnary.org\/themes\/newhymn\/uc_cart_block-override.css":1,"sites\/hymnary.org\/themes\/newhymn\/hamburger.css":1,"sites\/hymnary.org\/themes\/newhymn\/hamburger-submenu.css":1,"sites\/hymnary.org\/themes\/newhymn\/sidr\/hymnary-sidr-theme.css":1,"sites\/hymnary.org\/themes\/newhymn\/headerbar-menu.css":1,"sites\/hymnary.org\/themes\/newhymn\/pager.css":1,"sites\/hymnary.org\/themes\/newhymn\/all.css":1,"sites\/hymnary.org\/themes\/newhymn\/blockedBanner.css":1}},"hymnary":{"fieldNames":{"textName:":"","textTitle:":"","textLanguages:":"","firstLine:":"","meter:":"","refrainFirstLine:":"","textAuthNumber:":"","textPlaceOfOrigin:":"","originalLangTitle:":"","lectionaryWeeks:":"","originalLanguage:":"","fullText:":"","notes:":"","languages:":"","topics:":"","textSources:":"","scripture:":"","tuneTitle:":"","incipit:":"","tunePlaceOfOrigin:":"","tuneAuthNumber:":"","tuneKey:":"","tuneSources:":"","all:":"","media:":{"text":"Text","image":"Image","audio":"Audio","score":"Score","flexscore":"FlexScore"},"yearWritten:":"","flexscoreDomain:":{"public":"public","copyrighted":"copyrighted"},"personID:":"","personName:":"","gender:":{"m":"Male","f":"Female"},"personYear:":"","hymnalID:":"","hymnalTitle:":"","hymnalNumber:":"","publisher:":"","publicationPlace:":"","publicationDate:":"","denominations:":"","tags:":"","hymnalLanguages:":"","in:":{"texts":"texts","tunes":"tunes","instances":"instances","people":"people","hymnals":"hymnals"}}}});
//--><!]]>
</script>
</head>
<body class="html not-front not-logged-in one-sidebar sidebar-second page-hymn page-hymn-csr1908 page-hymn-csr1908- page-hymn-csr1908-3 sidebar-second sidebar-second-hymn" >
  <div id="skip-link">
    <a href="#block-system-main" class="element-invisible element-focusable">Skip to main content</a>
  </div>
          <div class="region region-beforeheader">
    <div id="block-advertising-3" class="clearfix block block-advertising">


  <div class="content"><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><script> (adsbygoogle = window.adsbygoogle || []).push({ google_ad_client: "ca-pub-3003432132428802", enable_page_level_ads: true });</script></div>
</div>
  </div>
    <div id="wrapper">
        <div id="container" class="clearfix">
            <div id="header">
                <div id="logo_h_background">
    <a href="/"><span class="element-invisible">Home Page</span></a>
    <img src="/sites/hymnary.org/themes/newhymn/hymnary-H-box-sized.png"
        alt="Hymnary.org" id="compactLogo" class="has-hi-dpi"/>
</div>
<div id="logo-floater">
    <a href="/"><span class="element-invisible">Home Page</span></a>
    <img src="/sites/hymnary.org/themes/newhymn/hymnary-title.png" alt="Hymnary.org" id="logo" class="has-hi-dpi"/>
</div>


                
                <h2 class="element-invisible element-focusable">User Links</h2><ul class="links secondary-links"><li class="0 first"><a href="/user?destination=/hymn/CSR1908/3">Log in</a></li>
<li class="1 last"><a href="/user/register?destination=/hymn/CSR1908/3">Register</a></li>
</ul>            </div>

            <div id="header-bar">
                <a id='hamburger-menu-toggle' href='#'></a>
                <div><h2>Discover</h2><ul>
    <li><a href='#' class='submenu-toggle'>Browse Resources</a>
        <ul class='hamburger-browse'>
        <li><a href="/search?qu=%20in%3Atexts" title="Browse text authorities">Texts</a></li><li><a href="/search?qu=%20in%3Atunes" title="Browse tune authorities">Tunes</a></li><li><a href="/search?qu=%20in%3Ainstances" title="Browse published text-tune combinations">Instances</a></li><li><a href="/search?qu=%20in%3Apeople" title="Browse authors, composers, editors, etc.">People</a></li><li><a href="/search?qu=%20in%3Ahymnals" title="Browse hymnals">Hymnals</a></li>        </ul>
    </li>
    <li><a href='/explore'>Exploration Tools</a></li>
    <li><a href='/browse/topics'>Topics</a></li>
    <li><a href='/browse/popular'>Popular Hymns</a></li>
    <li><a href='/browse/lectionary'>Lectionary</a></li>
</ul></div>
<!-- Keep hamburger only lis in their own ul for headerbar style reasons (:last-child:hover) -->
<ul class='headerbar-hide'>
    <li><a href='/store'>Store</a></li>
    <li><a href="/news">Blog</a></li>
    <li><a href="/forum">Forums</a></li>
    <li><a href="/tutorials">Tutorials</a></li>
    <li><a href="/about">About Us</a></li>
</ul>
<div><h2>Collections</h2><ul><li><a href="/starred"><img typeof="foaf:Image" src="https://hymnary.org/sites/hymnary.org/modules/hymnary_stars/star.png" alt="" />My Starred Hymns</a></li><li><a href="/flexscores"><img class="generic media-icon-small" typeof="foaf:Image" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/icons/20x20/flexscore.png" alt="Flexscore" title="Flexscore" />My FlexScores</a></li><li><a href="/myhymnals_help"><img class="generic media-icon-small" typeof="foaf:Image" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/icons/20x20/myhymnals.png" alt="In my hymnals" title="In my hymnals" />My Hymnals</a></li><li><a href="/user/0/purchased-files"><img class="generic media-icon-small" typeof="foaf:Image" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/icons/20x20/cart.png" alt="Product" title="Product" />My Purchased Files</a></li></ul></div><div><h2><a href='/store'>Store</a></h2></div>
<div><h2>Connect</h2>
    <ul>
        <li><a href='/news'>Blog</a></li>
        <li><a href='/forum'>Forums</a></li>
        <li><a href='/volunteer'>Volunteer</a></li>
        <li><a href='https://www.facebook.com/hymnary.org'>Facebook</a></li>
        <li><a href='https://twitter.com/hymnary'>Twitter</a></li>
    </ul>
</div>
<form class='simple-search-form' action='/search' method='get'><input  type="text" name="qu" placeholder="Search the entire Hymnary" autocomplete="off" class="typeahead-autocomplete"/></form><!-- Last HeaderbarMenu item must not be collapsible (without adjusting style). -->
            </div>

            <div id="sidr" class="sidr left">
                  <div class="region region-hamburgermenu">
    <div id="block-hymnary-hamburger-navigate" class="clearfix block block-hymnary">


  <div class="content"><ul class='headerbar-hide'>
    <li><a href='#' id='close-menu-button'>Close Menu</a></li>
    <li><a href="/user?destination=/hymn/CSR1908/3">Log in</a></li><li><a href="/user/register?destination=/hymn/CSR1908/3">Register</a></li></ul>
<div><h2>Search</h2><ul>
    <li>
        <form class='simple-search-form' action='/search' method='get'><input  type="text" name="qu" placeholder="Search the entire Hymnary" autocomplete="off" class="typeahead-autocomplete"/></form>    </li>
    <li><a href='/advanced_search'>Advanced Search</a></li>
    <li><a href='/melody/search'>Search by Melody</a></li>
</ul></div>
</div>
</div>
<div id="block-hymnary-collections" class="clearfix block block-hymnary">


  <div class="content"><div><h2>Collections</h2><ul><li><a href="/starred"><img typeof="foaf:Image" src="https://hymnary.org/sites/hymnary.org/modules/hymnary_stars/star.png" alt="" />My Starred Hymns</a></li><li><a href="/flexscores"><img class="generic media-icon-small" typeof="foaf:Image" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/icons/20x20/flexscore.png" alt="Flexscore" title="Flexscore" />My FlexScores</a></li><li><a href="/myhymnals_help"><img class="generic media-icon-small" typeof="foaf:Image" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/icons/20x20/myhymnals.png" alt="In my hymnals" title="In my hymnals" />My Hymnals</a></li><li><a href="/user/0/purchased-files"><img class="generic media-icon-small" typeof="foaf:Image" src="https://hymnary.org/sites/hymnary.org/themes/newhymn/icons/20x20/cart.png" alt="Product" title="Product" />My Purchased Files</a></li></ul></div></div>
</div>
<div id="block-hymnary-browse" class="clearfix block block-hymnary">


  <div class="content"><div><h2>Discover</h2><ul>
    <li><a href='#' class='submenu-toggle'>Browse Resources</a>
        <ul class='hamburger-browse'>
        <li><a href="/search?qu=%20in%3Atexts" title="Browse text authorities">Texts</a></li><li><a href="/search?qu=%20in%3Atunes" title="Browse tune authorities">Tunes</a></li><li><a href="/search?qu=%20in%3Ainstances" title="Browse published text-tune combinations">Instances</a></li><li><a href="/search?qu=%20in%3Apeople" title="Browse authors, composers, editors, etc.">People</a></li><li><a href="/search?qu=%20in%3Ahymnals" title="Browse hymnals">Hymnals</a></li>        </ul>
    </li>
    <li><a href='/explore'>Exploration Tools</a></li>
    <li><a href='/browse/topics'>Topics</a></li>
    <li><a href='/browse/popular'>Popular Hymns</a></li>
    <li><a href='/browse/lectionary'>Lectionary</a></li>
</ul></div>
<!-- Keep hamburger only lis in their own ul for headerbar style reasons (:last-child:hover) -->
<ul class='headerbar-hide'>
    <li><a href='/store'>Store</a></li>
    <li><a href="/news">Blog</a></li>
    <li><a href="/forum">Forums</a></li>
    <li><a href="/tutorials">Tutorials</a></li>
    <li><a href="/about">About Us</a></li>
</ul>
</div>
</div>
  </div>
            </div>

            
            <div id="center">
                <div id="before">
                                    </div>
                <div id="squeeze">
                    
                    
                    
                      <div class="region region-content">
    <div id="block-system-main" class="clearfix block block-system">


  <div class="content"><div id="standard-hymn-page"><div id="hymn-titlebar"><table><tr><td class='prev-hymn-number'><a href="/hymn/CSR1908/2"><i class="icon fontello icon-left-open" aria-hidden="true"></i> 2</a><td><h2 class='page-title'><a href="/hymnal/CSR1908?page=0">Christ in Song</a>&lrm;#3</h2></td><td class='next-hymn-number'><a href="/hymn/CSR1908/4">4 <i class="icon fontello icon-right-open" aria-hidden="true"></i></a></tr></table></div><div class='infoBubble'><table><tr style='vertical-align:top'><td style='width:30%'><b>Text:</b></td><td><a href="/text/in_the_land_of_strangers_whither_thou_ar">Welcome!  Wanderer, Welcome!</a></td></tr><tr style='vertical-align:top'><td style='width:30%'><b>Author:</b></td><td><a href="/person/Bonar_Horatius">Horatius Bonar</a></td></tr><tr style='vertical-align:top'><td style='width:30%'><b>Tune:</b></td><td><a href="/tune/welcome_sankey">[In the land of strangers]</a></td></tr><tr style='vertical-align:top'><td style='width:30%'><b>Composer:</b></td><td><a href="/person/Sankey_IraDavid">Ira D. Sankey</a></td></tr></table></div><div class='hymnSection hymnpage'>
<h2 class='hymntitle'>3. Welcome!  Wanderer, Welcome!</h2><div id="instance_embedded_media_tabs"><ul><li><a href="#score">Score</a></li><li><a href="#text">Full Text</a></li></ul><div id="score"><a href="/hymn/CSR1908/page/3"><img class='instance_pagescan' src="/page/fetch/CSR1908/3/low/3"/></a></div><div id="text"><p>1 In the land of strangers,<br />
Whither thou art gone,<br />
Hear a far voice calling,<br />
"My son!  my son!"<br />
</p><p>Chorus:<br />
"Welcome!  wand'rer, welcome!<br />
Welcome back to home!<br />
Thou hast wandered far away;<br />
Come home!  come home!"<br />
</p><p>2 "From the land of hunger,<br />
Fainting, famished, lone,<br />
Come to love and gladness,<br />
My son!  my son!  [Chorus]<br />
</p><p>3 "Leave the haunts of riot,<br />
Wasted, woe be gone,<br />
Sick at heart and weary,<br />
My son!  my son!  [Chorus]<br />
</p><p>4 "See the door still open!  <br />
Thou art still my own;<br />
Eyes of love are on thee,<br />
My son!  my son!  [Chorus]<br />
</p><p>5 "Far off thou hast wandered;<br />
Wilt thou farther roam?<br />
Come, and all is pardoned,<br />
My son!  my son!  [Chorus]<br />
</p><p>6 "See the well-spread table,<br />
Unforgotten one!<br />
Here is rest and plenty,<br />
My son!  my son!  [Chorus]<br />
</p><p>7 "Thou art friendless, homeless,<br />
Hopeless, and undone;<br />
Mine is love unchanging,<br />
My son!  my son!"  [Chorus]</div></div><div class='text hy_column'><a name='textInfo'></a><table class="infoTable" style="width: auto">
            <tr><th colspan="2">
                        Text Information                    </th></tr>
    
                                <tr class="result-row"><td valign="top">
            <span class="hy_infoLabel">First Line:</span></td>
            <td><span class="hy_infoItem"><a href="/text/in_the_land_of_strangers_whither_thou_ar">In the land of strangers</a></span></td></tr>
                                        <tr class="result-row"><td valign="top">
            <span class="hy_infoLabel">Title:</span></td>
            <td><span class="hy_infoItem">Welcome!  Wanderer, Welcome!</span></td></tr>
                                        <tr class="result-row"><td valign="top">
            <span class="hy_infoLabel">Author:</span></td>
            <td><span class="hy_infoItem"><a href="/person/Bonar_Horatius">Horatius Bonar</a></span></td></tr>
                                        <tr class="result-row"><td valign="top">
            <span class="hy_infoLabel">Refrain First Line:</span></td>
            <td><span class="hy_infoItem">Welcome!  wand'rer, welcome!</span></td></tr>
                                        <tr class="result-row"><td valign="top">
            <span class="hy_infoLabel">Publication Date:</span></td>
            <td><span class="hy_infoItem">1908</span></td></tr>
                                        <tr class="result-row"><td valign="top">
            <span class="hy_infoLabel">Scripture:</span></td>
            <td><span class="hy_infoItem"><div id="scripref0" class="scripture_reference"><a href="https://www.ccel.org/study/Luke_15:24">Luke 15:24</a></div></span></td></tr>
                                        <tr class="result-row"><td valign="top">
            <span class="hy_infoLabel">Topic:</span></td>
            <td><span class="hy_infoItem">Invitation and Repentance; Invitation and Repentance: Returning to God</span></td></tr>
            </table>

</div>
<div class='tune hy_column'><a name='tuneInfo'></a><table class="infoTable" style="width: auto">
            <tr><th colspan="2">
                        Tune Information                    </th></tr>
    
                                <tr class="result-row"><td valign="top">
            <span class="hy_infoLabel">Name:</span></td>
            <td><span class="hy_infoItem"><a href="/tune/welcome_sankey">[In the land of strangers]</a></span></td></tr>
                                        <tr class="result-row"><td valign="top">
            <span class="hy_infoLabel">Composer:</span></td>
            <td><span class="hy_infoItem"><a href="/person/Sankey_IraDavid">Ira D. Sankey</a></span></td></tr>
                                        <tr class="result-row"><td valign="top">
            <span class="hy_infoLabel">Key:</span></td>
            <td><span class="hy_infoItem">F Major</span></td></tr>
            </table>

</div>
<br style='clear: both'/><br/>
<br style='clear: both'/><div class='media'><a name='media'></a><table class="infoTable" style="width: auto">
            <tr><th colspan="2">
                        Media                    </th></tr>
    
    </table>

More media are available on the <a href="/text/in_the_land_of_strangers_whither_thou_ar#media">text authority</a> and <a href="/tune/welcome_sankey#media">tune authority</a> pages.</div><br style='clear: both'/><div id="instance_product_list"></div></div></div></div>
</div>
<div id="block-hymnary-feedback" class="clearfix block block-hymnary">


  <div class="content"><em>Suggestions or corrections? <a href="/info/email.html?to=feedback&amp;subj=Suggestions%20for%20the%20page%20/hymn/CSR1908/3">Contact us</a></em></div>
</div>
<div id="block-advertising-2" class="clearfix block block-advertising">


  <div class="content"><br clear="both" /><div class="turtle-block"><br/><hr/><p><small><a href="/info/advertisements.html">Advertisements</a></small></p>
<div>
					<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
					<ins class="adsbygoogle"
						 style="display:block"
						 data-ad-client="ca-pub-3003432132428802"
						 data-ad-slot="8120516198"
						 data-ad-format="auto"></ins>
					<script>
					(adsbygoogle = window.adsbygoogle || []).push({});
					</script>
					</div><br /></div></div>
</div>
  </div>
<span class="clear"></span>
                    <div id="footer">
                        <div id="footer-logos">
                            <a href="https://www.ccel.org/"><img src="/sites/hymnary.org/themes/newhymn/ccel-logo2.png" alt="Christian Classics Ethereal Library" /></a>
                            <a href="http://www.calvin.edu/worship/"><img src="/sites/hymnary.org/themes/newhymn/cicw-logo2.png" alt="Calvin Institute of Christian Worship" /></a>
                            <a href="http://www.calvin.edu/"><img src="/sites/hymnary.org/themes/newhymn/calvin-university.svg" alt="Calvin University" width='200px' class='nospace'/></a>
                            <a href="http://www.thehymnsociety.org/"><img src="/sites/hymnary.org/themes/newhymn/hs-footer_sm.png" alt="The Hymn Society" /></a>
                            <a href="https://hymnary.org/NEH"><img src="/sites/hymnary.org/themes/newhymn/NEH-logo-small.png" alt="National Endowment for the Humanities" /></a>
                            <br />
                            <div style="margin-right: auto; margin-left: auto; width: 60%"><hr id="footer-rule" /></div>
                        </div>
                                                      <div class="region region-footer">
    <div id="block-hymnary-footer" class="clearfix block block-hymnary">


  <div class="content"><a href="/about">About</a> | <a href="/copyright">Copyright</a> | <a href="/info/privacy.html">Privacy</a> | <a href="/info/email.html?to=feedback">Contact us</a> | <a href="/hymnads">Advertise with us</a> | <a href="/info/email.html?to=publisher">Publisher Partnerships</a> | <a href="/give">Give</a> | <a href="/subscriptions">Subscribe</a></div>
</div>
  </div>
                                            </div>
                </div>
            </div>

                            <div id="sidebar-second" class="sidebar">
                      <div class="region region-sidebar-second">
    <div id="block-advertising-1" class="clearfix block block-advertising">


  <div class="content"><div class="turtle-block"><p><small><a href="/info/advertisements.html">Advertisements</a></small></p>
<div>
		<!-- Begin Google AdSense Code -->
		<script type="text/javascript"><!--
		google_ad_client = "pub-3003432132428802";
		google_ad_slot = "6487139442";
		google_ad_width = 160;
		google_ad_height = 600;
		//-->
		</script>
		<script type="text/javascript"
		src="https://pagead2.googlesyndication.com/pagead/show_ads.js">
		</script>
		<!-- End Google AdSense Code --></div><br /><div>
		<!-- Begin Google AdSense Code -->
		<script type="text/javascript"><!--
		google_ad_client = "pub-3003432132428802";
		google_ad_slot = "6487139442";
		google_ad_width = 160;
		google_ad_height = 600;
		//-->
		</script>
		<script type="text/javascript"
		src="https://pagead2.googlesyndication.com/pagead/show_ads.js">
		</script>
		<!-- End Google AdSense Code --></div><br /></div></div>
</div>
  </div>
                </div>
                    </div>
    </div>
        <form action="/hymn/CSR1908/3" method="post" id="adblock-banner-form" accept-charset="UTF-8"><div><div id="blockbanner">It looks like you are using an ad-blocker. Ad revenue helps keep us running.
        Please consider white-listing Hymnary.org or <b><a href="/subscriptions" target="_blank">subscribing</a>
            to eliminate ads entirely and help support Hymnary.org.</b><div class="form-actions form-wrapper" id="edit-actions"><button type="submit" id="bbignore"><i class="fas fa-times-circle"><input type="submit" id="edit-submit" name="op" value="" class="form-submit" /></i></button></div></div><input type="hidden" name="form_build_id" value="form-wZ2tBv3RqT9ZfRUEsE7iXE2dQGuQsH0jDLRUsVP3JFc" />
<input type="hidden" name="form_id" value="adblock_banner_form" />
</div></form></body>
</html>
`;

class lyricsFunctions {

  constructor() {

  }

  readLine = async (lineNumber, path) => {
    return new Promise((resolve, reject) => {
      nthline(lineNumber, path)
        .then(line => resolve(line))
    })
  }

  // input
  // output
  populatelyrics = async (args) => {
    console.log(args)
    let {
      output,
      input,
      start,
      stop
    } = args;
    console.log(input)
    console.log(output)
    console.log(start)
    console.log(stop)

    let inputPath = path.join(__dirname, "../", "files", "lyrics", input);
    let fileNameFormat = 0; // integer in fileNames

    let filePath = path.join(inputPath, `${start}.txt`)
    try {
      fs.readFileSync(filePath)
    } catch (error) {
      fileNameFormat = 1;
      console.log(error)
    }

    start = parseInt(start)
    stop = parseInt(stop)
    let filePaths = [];
    for (let i = start; i <= stop; i++) {
      if (fileNameFormat === 0) filePath = path.join(inputPath, `${start}.txt`)
      else {
        let tmp = i.toString();
        if (tmp.length < 2) tmp = '0' + tmp
        if (tmp.length < 3) tmp = '0' + tmp
        filePath = path.join(inputPath, `${tmp}.txt`)
        // console.log('ELSEEEEEEEEEEE' + filePath)
      }
      filePaths.push(filePath)
      //   let hymnTxt = fs.readFileSync(filePath, 'utf-8')
      //   console.log(hymnTxt);
      //   process.exit();
    }

    let readTitle = async (path) => {
      let firstLine = await this.readLine(0, path);
      let tmps = firstLine.split('–')
      let hymnNumber = parseInt(tmps.shift());
      let title = tmps.join('-').replace(' ', '')
      console.log(`#:${hymnNumber}`)
      console.log(`TITLE:${title}`)
      console.log(firstLine)
      return firstLine;
      console.log(path)
    }

    let promises = filePaths.map(function (path) {
      return readTitle(path)
    })
    let [err, care] = await to(Promise.all(promises));
    let titles = care;

    let saveHymnTitlesAndText = async (titleData) => {

    }
    console.log(inputPath)
    let hymnNumber = 1;
    this.getFromOnline(pageData, hymnNumber)


  }

  getFromOnline = async (pageData) => {
    // console.log(pageData)
    let title_number = /<h2 class='hymntitle'>([^;]+)<\/h2>/.exec(pageData)[1];
    // let author = /Author:<[^>]+>/.exec(pageData)[0];
    console.log(title_number)
    let hymnNumber = parseInt(title_number)

    //<b>Author:</b></td><td><a href="/person/Bonar_Horatius">Horatius Bonar</a>
    let author = /<.*?>(.*?)<\/.*?>/g.exec(pageData)[4];
    // let extracted = pageData.matchAll(/<.*?>(.*?)<\/.*?>/g)
    let reg = new RegExp(/<.*?>(.*?)<\/.*?>/g)
    let extracted = pageData.matchAll(/<.*?>(.*?)<\/.*?>/)
    let result = {}
    let searchFor = [
     'hymntitle', 'Author:', 'Composer:', 'Tune:', 'Key:', 'Tune:', 'First Line:', 'Title:', 'Refrain First Line:', 'Publication Date:', 'Scripture:', 'Topic:'
    ]
    let requiredData = {};
    let previousLine = 'jshkjhdskjfhksd';
    let tmpDetails = {}
    while ((result = reg.exec(pageData)) !== null) {
      // if(previousLine === 'Author:') {
      // console.log(searchFor.indexOf(previousLine))
      if (searchFor.indexOf(previousLine) !== -1) {
        let innerReg = />([^<](.*))/g;
        try {
          let innerResult = innerReg.exec(result[1])[1]
          console.log(`${previousLine}=>${innerResult}`)
          // if(previousLine === 'Title:')
         
          tmpDetails[previousLine.replace(":", '')] = innerResult
          let tmpLine = result[1];
          previousLine = result[1];
          // if(!)result[]
          // console.log(tmpLine)
        } catch (err) {

        }
      } else
        previousLine = result[1];

      // console.log(result[2]);
    }

    console.log(tmpDetails)
    tmpDetails['hymnNumber'] = hymnNumber;
    console.log(tmpDetails)
    // let ret = 


    // let title = /[0-9]+\. ([^;]+)/.exec(pageData)[1];

    // console.log(title_number)
    // console.log(author)
    // let data = extractor(pageData);
    // let data = extractor.lazy(pageData, 'en');
    // console.log(data.title())
    // console.log(data.author())
    // // console.log(title)
    // const root = parser('pageData');
    // console.log(extracted)
    // for(let i in extracted) {
    //     try{
    //     console.log(extracted[i])
    //     }catch(error){}
    //     // if(extracted[i] === 'Author:')console.log('+========='+i) 
    // }

  }

  // getChord = (notes) => {

  // }


};

// const lineReader = require('readline').createInterface({
//   input: require('fs').createReadStream('file.in')
// });



module.exports = lyricsFunctions;



