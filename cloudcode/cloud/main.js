var gtkey=require('cloud/creds.js');

Parse.Cloud.afterSave("Todo", function(request, response) {
  console.log(gtkey() );
  var words;
  words=request.object.get("content");
  words=words.split(" ");
  var uniques={};
  for (var i=0;i<words.length;i++){
    uniques[words[i]] ? uniques[words[i]]++ : ( uniques[words[i]] = 1 );
  }

  var Word=Parse.Object.extend("Word");
  
  for (var key in uniques){
    //query for pre-existing copy
      (function(word,count){
        //console.log('inside the iife');
        //console.log(word);
        var query = new Parse.Query(Word);
        query.equalTo("spanish", word);
        query.find({
        success:function(res){
          //console.log(res.length);
          if (!res.length){
            var newWord=new Word();
            //put translate command here
            var url="https://www.googleapis.com/language/translate/v2";
            url+="?key="+gtkey()+"&q="+word+"&source=es&target=en";
            console.log(url);
            Parse.Cloud.httpRequest({
              url: url,
              success: function(httpResponse) {
                console.log(httpResponse.text);
                var res=JSON.parse(httpResponse.text);
                var english="no translation";
                if (res.data.translations.length>0 && res.data.translations[0].translatedText){
                  english=res.data.translations[0].translatedText;
                }
                console.log('this next thing should be the translation:');
                console.log(english);
                newWord.set("spanish",word);
                newWord.set("english",english);
                newWord.set('count',count);
                newWord.save();

    
                
              },
              error: function(httpResponse) {
                console.error('Request failed with response code ' + httpResponse.status);
              }
            });
            
            
          }
          
          for (var j=0;j<res.length;j++){
            res[j].increment('count',count);
            res[j].save(); 
          }
        }, error: function(res,err){
          console.log(err);
        }
        
      });
    
    }(key,uniques[key]));

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