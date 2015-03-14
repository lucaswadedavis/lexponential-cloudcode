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

var queryUrl = function(key,opts){
  var url="https://www.googleapis.com/language/translate/v2";
  url+="?key="+key+"&q="+opts.lexeme+"&source="+opts.sourceLangAbbreviation+"&target="+opts.targetLangAbbreviation+"";

  return url;
};

var addLexeme = function(opts){
  var query = new Parse.Query(Lexeme);
  query.equalTo("lexeme", opts.lexeme);
  query.find({
  success:function(res){
    //console.log(res.length);
    if (!res.length){
      var newLexeme=new Lexeme();
      //put translate command here
      Parse.Cloud.httpRequest({
        url: queryUrl(gtkey(), opts),
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
            newLexeme.set("lexeme",opts.lexeme);
            newLexeme.set("translation",translation);
            newLexeme.set('count',opts.count);
            newLexeme.set('owner',opts.user);
            newLexeme.set('exposures',1)
            newLexeme.save();
          }

          
        },
        error: function(httpResponse) {
          console.error('lexeme: ' + opts.lexeme + ' --- Request failed with response code ' + httpResponse.status);
        }
      });
      
      
    }
    //what am I doing here?
    for (var j=0;j<res.length;j++){
      res[j].increment('count',opts.count);
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
  
  for (var i=0;i<lexemes.length;i++){
    lexemes[i] = lexemes[i].replace(".","");
  }
  
  var uniques={};
  for (var i=0;i<lexemes.length;i++){
    uniques[lexemes[i]] ? uniques[lexemes[i]]++ : ( uniques[lexemes[i]] = 1 );
  }

  
  for (var key in uniques){
    var opts = {};
    opts.sourceLang = sourceLang;
    opts.targetLang = targetLang;
    opts.user = user;
    opts.sourceLangAbbreviation = sourceLangAbbreviation;
    opts.targetLangAbbreviation = targetLangAbbreviation;
    opts.lexeme = key;
    opts.count = uniques[key];
    addLexeme(opts);
  }

});
