Parse.Cloud.afterSave("Todo", function(request, response) {
  var words;
  words=request.object.get("content");
  words=words.split(" ");

  var Word=Parse.Object.extend("Word");
  
  for (var i=0;i<words.length;i++){
    //query for pre-existing copy
      (function(word){
        console.log('inside the iife');
        console.log(word);
        var query = new Parse.Query(Word);
        query.equalTo("english", word);
        query.find({
        success:function(res){
          console.log(res.length);
          if (!res.length){
            var newWord=new Word();
            newWord.increment("count");
            newWord.set("english",word);
            newWord.save();
          }
          
          for (var j=0;j<res.length;j++){
            res[j].increment('count');
            res[j].save(); 
          }
        }, error: function(res,err){
          console.log(err);
        }
        
      });
    
    }(words[i]));

    /*
    
    
    */
  }

  //response.success();

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