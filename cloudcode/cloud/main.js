var gtkey=require('cloud/creds.js');
var _ = require('underscore');

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
var Queue = Parse.Object.extend("Queue");

var queryUrl = function(key,opts){
  var url="https://www.googleapis.com/language/translate/v2";
  url+="?key="+key+"&q="+opts.lexeme+"&source="+opts.sourceLangAbbreviation+"&target="+opts.targetLangAbbreviation+"";
  return url;
};

var translationQueue = {
  
  enqueue: function(opts){
    var q = new Queue();
    for (var key in opts){
      q.set(key,opts[key]);
    }
    q.save();
  },
  dequeue: function(){
    console.log("dequeue");
  }
};


var getTranslation = function(opts, cb){
  //console.log(JSON.stringify(opts));
  Parse.Cloud.httpRequest({
    url: queryUrl(gtkey(), opts),
    success: function(httpResponse) {
      //console.log(httpResponse.text);
      var res=JSON.parse(httpResponse.text);
      var translation="no translation";

      if (res.data.translations.length>0 && res.data.translations[0].translatedText){
        translation=res.data.translations[0].translatedText;
      }
      
      //as long as we get a translation back, add it as a new Lexeme
      if (translation !== "no translation"){  
        var newLexeme=new Lexeme();

        newLexeme.set("lexeme",opts.lexeme);
        newLexeme.set("translation",translation);
        newLexeme.set("sourceLang",opts.sourceLang);
        newLexeme.set("targetLang",opts.targetLang);
        newLexeme.set('count',opts.count);
        newLexeme.set('owner',opts.user);
        newLexeme.set('exposures',1);
        newLexeme.save();
      }
      
      cb();
    },
    error: function(httpResponse) {
      console.error('lexeme translation error: ' + opts.lexeme + ' --- Request failed with response code ' + httpResponse.status);
      cb();
    }
  });
};

var saveNull = function(opts){
  var newLexeme=new Lexeme();

  newLexeme.set("translation",null);
  newLexeme.set("sourceLang",opts.sourceLang);
  newLexeme.set("targetLang",opts.targetLang);
  newLexeme.set("lexeme",opts.lexeme);
  newLexeme.set('count',opts.count);
  newLexeme.set('owner',opts.user);
  newLexeme.set('exposures',1);
  newLexeme.save();
};

var addLexeme = function(opts){
  var query = new Parse.Query(Lexeme);
  query.equalTo("lexeme", opts.lexeme);
  query.find({
    success:function(res){
      //if the translation doesn't yet exist, then ask someone to translate it.
      if (!res.length){
        translationQueue.enqueue(opts);
        //getTranslation(opts);
      }
      //if, instead the entry already exists
      //console.log('addLexeme --- ' + JSON.stringify(res));
      for (var j=0;j<res.length;j++){
        res[j].increment('count',opts.count);
        res[j].save(); 
      }
    }, error: function(res,err){
      console.log("Error adding Lexeme: ",err);
    }
  });
};


  
Parse.Cloud.afterSave("Lexiome", function(request, response) {
  var sourceLang=request.object.get("sourceLang");
  var sourceLangAbbreviation=languages[sourceLang.toLowerCase()] ? languages[sourceLang.toLowerCase()] : "es" ;
  var targetLang=request.object.get("targetLang");
  var targetLangAbbreviation= languages[targetLang.toLowerCase()] ? languages[targetLang.toLowerCase()] : "en";
  var user=request.user;
  var lexemes=request.object.get("content");
  //this probably won't work, but this is where we'll need to extract newlines
  lexemes = lexemes.replace( (new RegExp("\n", 'g') ), " ");
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
    opts.lexeme = _.escape(key);
    opts.count = uniques[key];
    
    
    if (opts.lexeme){
      addLexeme( opts );
    } else {
      console.log("After Saving Lexiome - Opts: ", JSON.stringify(opts) );
    }
  }
  
  //clear the translation queue
  
});


Parse.Cloud.job("dequeueTranslation", function(request, status) {
  translationQueue.dequeue();

});