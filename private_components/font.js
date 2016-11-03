(function () {
  var path = '//easy.myfonts.net/v2/js?sid=253196(font-family=Celias+Bold)&sid=253199(font-family=Celias+Light)&sid=253201(font-family=Celias+Medium)&sid=253204(font-family=Celias)&key=HoFYk8q6H9',
    protocol = ('https:' == document.location.protocol ? 'https:' : 'http:'),
    trial = document.createElement('script');
  trial.type = 'text/javascript';
  trial.async = true;
  trial.src = protocol + path;
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(trial);
})();
