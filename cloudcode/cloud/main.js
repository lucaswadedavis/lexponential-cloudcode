var gtkey=require('cloud/creds.js');

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

var Lexeme = Parse.Object.extend("Lexeme");

var addLexeme = function(lexeme, count, opts){
  //query for pre-existing copy
      
  //console.log('inside the iife');
  //console.log(lexeme);
  var query = new Parse.Query(Lexeme);
  query.equalTo("lexeme", lexeme);
  query.find({
  success:function(res){
    //console.log(res.length);
    if (!res.length){
      var newLexeme=new Lexeme();
      //put translate command here
      var url="https://www.googleapis.com/language/translate/v2";
      url+="?key="+gtkey()+"&q="+lexeme+"&source="+opts.sourceLangAbbreviation+"&target="+opts.targetLangAbbreviation+"";
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
            newLexeme.set("sourceLang",opts.sourceLang);
            newLexeme.set("targetLang",opts.targetLang)
            newLexeme.set("lexeme",lexeme);
            newLexeme.set("translation",translation);
            newLexeme.set('count',count);
            newLexeme.set('owner',opts.user);
            newLexeme.set('exposures',1)
            newLexeme.save();
          }

          
        },
        error: function(httpResponse) {
          console.error('Request failed with response code ' + httpResponse.status);
        }
      });
      
      
    }
    //what am I doing here?
    for (var j=0;j<res.length;j++){
      res[j].increment('count',count);
      res[j].save(); 
    }
  }, error: function(res,err){
    console.log(err);
  }
    
  });

};

  
Parse.Cloud.afterSave("Lexiome", function(request, response) {
  var lexemes;
  var sourceLang=request.object.get("sourceLang");
  var sourceLangAbbreviation=languages[sourceLang.toLowerCase()] ? languages[sourceLang.toLowerCase()] : "es" ;
  
  var targetLang=request.object.get("targetLang");
  var targetLangAbbreviation= languages[targetLang.toLowerCase()] ? languages[targetLang.toLowerCase()] : "en";
  
  var user=request.user;
  lexemes=request.object.get("content");
  lexemes=lexemes.split(" ");
  var uniques={};
  for (var i=0;i<lexemes.length;i++){
    uniques[lexemes[i]] ? uniques[lexemes[i]]++ : ( uniques[lexemes[i]] = 1 );
  }

  
  var opts = {};
  opts.sourceLang = sourceLang;
  opts.targetLang = targetLang;
  opts.user = user;
  opts.sourceLangAbbreviation = sourceLangAbbreviation;
  opts.targetLangAbbreviation = targetLangAbbreviation;
  
  
  for (var key in uniques){
    addLexeme(key, uniques[key], opts);
  }

});
