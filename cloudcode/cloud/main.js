
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

Parse.Cloud.afterSave("Todo", function(request, response) {
  var words;
  words=request.object.get("content");
  words=words.split(" ");

  var Word=Parse.Object.extend("Word");
  
  for (var i=0;i<words.length;i++){
    //query for pre-existing copy
    //var found=false;
    var query = new Parse.Query(Word);
    query.equalTo("english", words[i]);
    query.find({
      success: function(results) {
        //alert("Successfully retrieved " + results.length + " scores.");
        // Do something with the returned Parse.Object values
        for (var i = 0; i < results.length; i++) { 
          var count = results[i].get('count');
          results[i].set('count',count+1);
          results[i].save();
          //var object = results[i];
          //alert(object.id + ' - ' + object.get('playerName'));
        }
      },
      error: function(error) {
        //alert("Error: " + error.code + " " + error.message);
      }
    });
    var word=new Word();
    word.set("count",1);
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

//example of a custom route 
/*
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
*/