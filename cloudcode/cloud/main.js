var gtkey=require('cloud/creds.js');

Parse.Cloud.afterSave("Lexiome", function(request, response) {
  //console.log(gtkey() );
  var words;
  var languages={
    "afrikaans":"af",
    "albanian":"sq",
    "arabic":"ar",
    "azerbaijani":"az",
    "basque":"eu",
    "bengali":"bn",
    "belarusian":"be",
    "bulgarian":"bg",
    "catalan":"ca",
    "croatian":"hr",
    "czech":"cs",
    "danish":"da",
    "dutch":"nl",
    "english":"en",
    "esperanto":"eo",
    "estonian":"et",
    "finnish":"fi",
    "french":"fr",
    "galician":"gl",
    "georgian":"ka",
    "german":"de",
    "greek":"el",
    "haitian Creole":"ht",
    "hebrew":"iw",
    "hindi":"hi",
    "hungarian":"hu",
    "icelandic":"is",
    "irish":"ga",
    "italian":"it",
    "latin":"la",
    "latvian":"lv",
    "lithuanian":"lt",
    "macedonian":"mk",
    "norwegian":"no",
    "persian":"fa",
    "polish":"pl",
    "portuguese":"pt",
    "romanian":"ro",
    "russian":"ru",
    "serbian":"sr",
    "slovak":"sk",
    "slovenian":"sl",
    "spanish":"es",
    "swahili":"sw",
    "swedish":"sv",
    "turkish":"tr",
    "ukrainian":"uk",
    "urdu":"ur",
    "welsh":"cy",
    "yiddish":"yi"
  };
  
  var sourceLang=request.object.get("sourceLang");
  var sourceLangAbbreviation=languages[sourceLang.toLowerCase()] ? languages[sourceLang.toLowerCase()] : "es" ;
  
  var targetLang=request.object.get("targetLang");
  var targetLangAbbreviation= languages[targetLang.toLowerCase()] ? languages[targetLang.toLowerCase()] : "en";
  
  var user=request.user;
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
        query.equalTo("word", word);
        query.find({
        success:function(res){
          //console.log(res.length);
          if (!res.length){
            var newWord=new Word();
            //put translate command here
            var url="https://www.googleapis.com/language/translate/v2";
            url+="?key="+gtkey()+"&q="+word+"&source="+sourceLangAbbreviation+"&target="+targetLangAbbreviation+"";
            //console.log(url);
            Parse.Cloud.httpRequest({
              url: url,
              success: function(httpResponse) {
                console.log(httpResponse.text);
                var res=JSON.parse(httpResponse.text);
                var translation="no translation";
                if (res.data.translations.length>0 && res.data.translations[0].translatedText){
                  translation=res.data.translations[0].translatedText;
                }
                //console.log('this next thing should be the translation:');
                //console.log(english);
                if (translation==="no translation"){
                  return;
                }else {
                  newWord.set("sourceLang",sourceLang);
                  newWord.set("targetLang",targetLang)
                  newWord.set("word",word);
                  newWord.set("translation",translation);
                  newWord.set('count',count);
                  newWord.set('owner',user);
                  newWord.set('exposures',1)
                  newWord.save();
                }
    
                
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