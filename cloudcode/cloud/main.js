
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

Parse.Cloud.afterSave("Todo", function(request, response) {
  var words;
  //words=JSON.parse(request);
  //console.log(request.content);
  console.log("Luke!");
  words=request.object.get("content");
  words=words.split(" ");

  //make the Lexicon constructor function (class)
  var Word=Parse.Object.extend("Word");

  for (var i=0;i<words.length;i++){
    var word=new Word();
    word.set("count",Math.floor(1000*Math.random() ));
    word.set("english",words[i]);
    word.save(null,{
      success:function(res){
        //response.success(res);
      },
      error:function(res,error){
        response.success(error);
      }
    });
  }

  response.success();

});

Parse.Cloud.define("chop", function(request, response) {
  var words=JSON.parse(request.body);
  words=words.words;
  words=words.split(" ");

  //make the Lexicon constructor function (class)
  var Word=Parse.Object.extend("Word");

  for (var i=0;i<words.length;i++){
    var word=new Word();
    word.set("count",Math.floor(1000*Math.random() ));
    word.set("english",words[i]);
    word.save(null,{
      success:function(res){
        //response.success(res);
      },
      error:function(res,error){
        response.success(error);
      }
    });
  }

  response.success();

});
