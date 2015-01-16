
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("chop", function(request, response) {
  var words=JSON.parse(request.body);
  words=words.words;
  words=words.split(" ");

  //make the Lexicon constructor function (class)
  var Lexicon=Parse.Object.extend("Lexicon");
  var lexicon=new Lexicon();

  for (var i=0;i<words.length;i++){
    lexicon.set(words[i],Math.floor(1000*Math.random() ));
  }

  lexicon.save(null,{
    success:function(lexicon){
      response.success(lexicon);
    },
    error:function(lexicon,error){
      response.success(error);
    }
  });


});
