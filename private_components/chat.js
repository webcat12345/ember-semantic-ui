/**
 * Created by maurinlenglart on 2/19/16.
 */



<!--Start of HappyFox Live Chat Script-->

window.HFCHAT_CONFIG = {
  EMBED_TOKEN: "c8a64b60-d75d-11e5-b238-ed249111e94b",
  ACCESS_TOKEN: "93556ba29e8c48b3b61854e9f846dbff",
  HOST_URL: "https://happyfoxchat.com",
  ASSETS_URL: "https://d1l7z5ofrj6ab8.cloudfront.net/visitor"
};

(function () {
  var scriptTag = document.createElement('script');
  scriptTag.type = 'text/javascript';
  scriptTag.async = true;
  scriptTag.src = window.HFCHAT_CONFIG.ASSETS_URL + '/js/widget-loader.js';

  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(scriptTag, s);
})();

<!--End of HappyFox Live Chat Script-->
