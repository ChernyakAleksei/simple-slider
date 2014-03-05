(function (context, definition) {

  'use strict';

  if (typeof module != 'undefined' && module.exports) {
    module.exports = definition();
  } else if (typeof define == 'function' && define.amd) {
    define(definition);
  } else {
    window.SimpleSlider = definition();
  }

})(this, function () {

  'use strict';

  // requestAnimationFrame polyfill

  if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

  var vendors = ['webkit', 'moz'];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    var vp = vendors[i];
    window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
    window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame'] || window[vp+'CancelRequestAnimationFrame']);
  }

  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || // iOS6 is buggy
    !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime = 0;
    window.requestAnimationFrame = function(callback) {
      var now = Date.now();
      var nextTime = Math.max(lastTime + 16, now);
      return setTimeout(function() { callback(lastTime = nextTime); }, nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }

  // ------------------

  function getdef(val, def){
    return val===undefined || val===null ? def : val;
  }

  function getUnit(args) {

    var item;
    var count = args.length;
    var unit = '';

    while (--count >= 0) {
      item = args[count];
      if (typeof item === 'string') {
        unit = item
          .replace(parseInt(item, 10) + '', '');
      }
    }

    return unit;

  }

  // Test if have children and throw warning otherwise
  function testChildrenNum(value) {

    if (value <= 0) {
      try {
        console.warn(
          'A SimpleSlider main container element' +
          'should have at least one child.'
        );
      } catch(e) {}

      return true;

    } else {

      return false;
    }

  }

  function anim(target, prop, unit, transitionDuration, startTime, elapsedTime, fromValue, toValue){

    function loop() {

      window.requestAnimationFrame(function requestAnimationFunction(time){

        if (startTime === 0) {
          startTime = time;
        }

        anim(target, prop, unit, transitionDuration, startTime, time, fromValue, toValue);

      });
    }

    var percentual;

    if (startTime === 0) {

      return loop();

    } else {

      percentual = (elapsedTime - startTime) / transitionDuration;

      if (percentual < 1) {

        target[prop] = ((percentual * toValue)) + unit;
        loop();

      } else {

        target[prop] = toValue + unit;
      }
    }

  }

  var SimpleSlider = function(containerElem, options){
    this.containerElem = containerElem;
    this.interval = 0;
    if( !options ) options = {};
    this.trProp = getdef(options.transitionProperty, 'opacity');
    this.trTime = getdef(options.transitionTime, 0.5);
    this.delay = getdef(options.transitionDelay, 2);
    this.unit = getUnit([options.startValue, options.visibleValue, options.endValue]);
    this.startVal = parseInt(getdef(options.startValue, 100), 10);
    this.visVal = parseInt(getdef(options.visibleValue, 100), 10);
    this.endVal = parseInt(getdef(options.endValue, 0), 10);
    this.autoPlay = getdef(options.autoPlay, true);
    this.init();
  };

  SimpleSlider.prototype.init = function() {
    this.reset();
    this.configSlideshow();
  };

  SimpleSlider.prototype.reset = function() {

    if (testChildrenNum(this.containerElem.children.length)) {
      return; // Do not follow reset logic if don't have children
    }

    var i = this.containerElem.children.length-1;
    this.imgs = [];
    while (i>=0) {
      this.imgs[i] = this.containerElem.children[i];
      this.imgs[i].style[this.trProp] = this.endVal + this.unit;
      i--;
    }

    this.imgs[0].style[this.trProp] = this.startVal + this.unit;
    this.actualIndex = 0;
  };

  SimpleSlider.prototype.configSlideshow = function() {

    if (!this.imgs) {
      return;
    }

    if (this.autoPlay) {
      var scope = this;
      if (this.interval) {
        window.clearInterval(this.interval);
      } else {
        this.interval = window.setInterval(function(){
          scope.change(scope.nextIndex());
        }, this.delay*1000);
      }
    }

  };

  SimpleSlider.prototype.startAnim = function(target, fromValue, toValue){

    anim(target.style, this.trProp, this.unit, this.trTime * 1000, 0, 0, fromValue, toValue);

  };

  SimpleSlider.prototype.remove = function(index){
    this.startAnim(this.imgs[index], this.startVal, this.endVal);
  };

  SimpleSlider.prototype.insert = function(index){
    // Inserting element always get placed in front of others
    this.startAnim(this.imgs[index], this.endVal, this.startVal);
  };

  SimpleSlider.prototype.change = function(newIndex){
    this.remove(this.actualIndex);
    this.insert(newIndex);
    this.actualIndex = newIndex;
  };

  SimpleSlider.prototype.nextIndex = function(){
    var newIndex = this.actualIndex+1;
    if( newIndex >= this.imgs.length ){
      newIndex = 0;
    }
    return newIndex;
  };

  SimpleSlider.prototype.dispose = function(){

    window.clearInterval(this.actualIndex);

    var i = this.imgs.length;
    while (--i) {
      this.imgs.pop();
    }
    this.imgs = null;

    this.containerElem = null;
    this.interval = null;
    this.trProp = null;
    this.trTime = null;
    this.delay = null;
    this.startVal = null;
    this.endVal = null;
    this.autoPlay = null;
    this.actualIndex = null;
  };

  return SimpleSlider;

});