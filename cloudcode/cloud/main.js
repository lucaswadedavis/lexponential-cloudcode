
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
      success:function(res){
        console.log('search returned');
        console.log(res);
      }, error: function(res,err){
        console.log(err);
      }
    })

    var word=new Word();
    word.increment("count");
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