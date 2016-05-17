var HelloWorld;

HelloWorld = (function() {
  function HelloWorld() {
    alert("Hello World");
  }

  HelloWorld.prototype.hello = function() {
    return 'world';
  };

  return HelloWorld;

})();
