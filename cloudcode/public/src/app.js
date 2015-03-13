$(document).ready(function(){
    app.c.init();
});

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var app={};
app.m={};
app.v={};
app.c={};
app.t={};

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

app.m.appName="Lexponential";


app.m.sourceLang="spanish";
app.m.targetLang="english";
app.m.languages={
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
  
 app.m.Todo = Parse.Object.extend("Todo", {
    defaults: {
      content: "empty..",
      sourceLang:app.m.sourceLang,
      targetLang:app.m.targetLang,
    },

    // Ensure that each todo created has `content`.
    initialize: function() {
      if (!this.get("content")) {
        this.set({"content": this.defaults.content});
        this.set("sourceLang",app.m.sourceLang);
        this.set("targetLang",app.m.targetLang);
      }
    }
    
  });

app.m.Word=Parse.Object.extend("Word");

app.m.words;
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////begin controllers

app.c.init=function(){
  Parse.$ = jQuery;
  Parse.initialize(creds().apk, creds().jsk);
  app.v.init();
};

app.c.getWords=function(cb){
    var query = new Parse.Query(app.m.Word);
    query.equalTo("owner",Parse.User.current() );
    query.equalTo("sourceLang",app.m.sourceLang );
    query.find({
      success:function(results){
        //console.log(results);
        app.m.words=results;
        cb();
      }, error:function(error){
        console.log(error);
        cb();
      }
    });
};
///////////////////////////////////////////////////////end controllers
///////////////////////////////////////////////////////begin views

app.v.init=function(){
    zi.css();
    
    $("body").html(app.t.layout() );
    if (Parse.User.current()!==null){
      app.v.selectLanguage();
    }
    
    app.v.initialReveal();
    
};

app.v.initialReveal=function(){
  $("body").fadeIn();
};

app.v.render=function(target,payload){
  if ($(target).length!==1){
    target="body";
    $(target).append(payload);
  } else {
    $(target).fadeOut(function(){
      $(target).html(payload);
      $(target).fadeIn();
    });
  }
};

app.v.inputView=function(){  
  if (Parse.User.current()===null){return;}
  app.v.render("div.content",app.t.inputView() );
};

app.v.main=function(){
  app.v.render("div.content",app.t.main() );
};

app.v.displayLexicon=function(){
  if (Parse.User.current()===null){return;}
  if (app.m.words.length<1){
    app.c.getWords(function(){
      app.v.render("div.content",app.t.lexicon(app.m.words) );
    });
  } else {
    app.v.render("div.content",app.t.lexicon(app.m.words) );
  }
};

app.v.flashcards=function(){
  if (app.m.words.length>5 && Parse.User.current()!==null){
    app.v.render("div.content",app.t.flashcards() );
  }
};

app.v.selectLanguage=function(){
  if (Parse.User.current()===null){return;}
  app.v.render("div.content",app.t.selectLanguage() );
};

app.v.logOut=function(){
  Parse.User.logOut();
  app.v.init();
};

app.v.routes={
  selectLanguage:app.v.selectLanguage,
  add:app.v.inputView,
  flashcards:app.v.flashcards,
  lexicon:app.v.displayLexicon,
  logout:app.v.logOut
};

///////////////////////////////////////////////////////end views
///////////////////////////////////////////////////////begin templates

app.t.layout=function(){
  var d="";
  d+="<div class='wrapper'>";
    d+="<h1>"+app.m.appName+"</h1>";
    d+=app.t.navigation();
    d+="<div class='content'>";
      d+=app.t.loginTemplate();
    d+="</div>";
  d+="</div>";
  return d;
};

app.t.navigation=function(){
  var d="";
  d+="<div id='navigation'>";
    d+="<ul>";
    for (var key in app.v.routes){
      d+="<li id='"+key+"'>"+key+"</li>"; 
      boum.click("div#navigation li#"+key,function(key){
        app.v.routes[key]();
      },key)
    }
    d+="</ul>";
  d+="</div>";
  return d;
};

app.t.card=function(model){
  var answers=[];

  if (app.m.words.length>5){
    answers.push({value:"correct",word:model.get("translation")});
    while(answers.length<3){
      var attempt=_.sample(app.m.words);
      var matchFound=false;
      for (var i=0;i<answers.length;i++){
        if (answers[i].word===attempt.get("translation") ){
          matchFound=true;
          break;
        }
      }
      if (matchFound===false){
        answers.push({value:"incorrect",word:attempt.get("translation")});
      }
    }
    answers=_.shuffle(answers);
  }
  
  boum.click("div#flashcards div#"+model.id+" div.correct",function(id){
    $("div#flashcards h2").html("Correct!");
    //increment points
    var u=Parse.User.current();
    u.increment("pointsThisMonth",1);
    u.increment("pointsAllTime",1);
    u.save();
    
    for (var i=0;i<app.m.words.length;i++){
      if (app.m.words[i].id===id){
        var futureDate=new moment();
        futureDate=futureDate.add(Math.pow(5,app.m.words[i].get("exposures")),'minutes');
        app.m.words[i].set("expires",futureDate.toDate());
        app.m.words[i].increment("exposures",1);
        app.m.words[i].save();
        break;
      }
    }
    
    app.v.flashcards();
  },model.id);
  
  
  boum.click("div#flashcards div.card div.incorrect",function(){
    $("div#flashcards h2").html("Nope...");
    app.v.flashcards();
  });
  
  var d="";
  d+="<div class='card' id='"+model.id+"'>";
    d+="<div class='question'>"+model.get("word")+"</div>";
    for (var i=0;i<answers.length;i++){
      d+="<div class='"+answers[i].value+" answer'>"+answers[i].word+"</div>";
      
    }
  d+="</div>";
  return d;
};

app.t.flashcards=function(){
  //select two cards at random
  var fc="";
  var c1;
  if (app.m.words.length){
    app.m.words=_.sortBy(app.m.words,function(item){return item.get("count")});
    app.m.words.reverse();
    c1=app.m.words[0];
    for (var i=0;i<app.m.words.length;i++){
      
      var now=new moment;
      if (app.m.words[i].get('expires') === undefined || now.isAfter(app.m.words[i].get('expires'))){
       c1=app.m.words[i];       
       break;
      }
    }
    fc+=app.t.card(c1);
  }
  
  var d="";
  d+="<div id='flashcards'>";
    d+="<h2>Flashcards</h2>";
    d+=fc;
  d+="</div>";
  return d;
};

app.t.selectLanguage=function(){
  var d="";
  d+="<div id='language-selection'>";
    d+="<h2>What language will you learn today?</h2>";
    for (var key in app.m.languages){
      d+="<button id='"+key+"'>"+key+"</button>";
      boum.click("div#language-selection button#"+key,function(key){
        app.m.sourceLang=key;
        app.c.getWords(app.v.flashcards);
        //app.v.inputView();
        
      },key);
    }
  d+="</div>";
  return d;
};

app.t.lexicon=function(collection){
  var d="";
  d+="<div id='lexicon'>";
    d+="<h2>"+app.m.sourceLang[0].toUpperCase()+app.m.sourceLang.slice(1)+"</h2>";
    d+="<div class='chart'></div>";
    d+="<table>";
    d+="<tr><th>Times Counted</th><th>Original Word</th><th>Translation</th><th>Exposures</th><th>Expires</th></tr>";
    collection=_.sortBy(collection,function(item){return item.get("count")});
    collection.reverse();
    for (var i=0;i<collection.length;i++){
      d+="<tr>";
        d+="<td>"+collection[i].get("count")+"</td>";
        d+="<td>"+collection[i].get("word")+"</td>";
        d+="<td>"+collection[i].get("translation")+"</td>";
        d+="<td>"+collection[i].get("exposures")+"</td>";
        var now=new moment;
        d+="<td>"+collection[i].get('expires')+"</td>";
      d+="</tr>"; 
    }
    d+="</table>";
  d+="</div>";
  return d;
};

app.t.inputView=function(){
  boum.click("div#input-view button",function(){
    var $text=$("div#input-view textarea");
    
    //parse!
    var t=new app.m.Todo;
    t.set("content",_.escape($text.val() ) );
    t.set("sourceLang",app.m.sourceLang);
    t.set("targetLang",app.m.targetLang);
    t.save(null,{
      success:function(data){
        app.v.displayLexicon();
      }, error: function(err){
        console.log(err);
      }
    });
    
  });
  
  var d="";
  d+="<div id='input-view'>";
    d+="<h2>Add the kind of "+app.m.sourceLang[0].toUpperCase()+app.m.sourceLang.slice(1)+" you want to understand.</h2>";
    d+="<div class='wrapper'><textarea placeholder='be more global'></textarea></div>";
    d+="<button>Add to your "+app.m.sourceLang+" Lexicon</button>";
  d+="</div>";
  return d;
};

app.t.loginTemplate=function(){
  boum.click('div#entrance button#login-button',function(){
    var username = $("#login-username").val();
    var password = $("#login-password").val();

    Parse.User.logIn(username, password, {
      success: function(user) {
        console.log(user);
        
        app.v.selectLanguage();
      },

      error: function(user, error) {
        console.log(error);
        $(".login .error").html("Invalid username or password. Please try again.").show();
        $(".login button").removeAttr("disabled");
      }
    });

  });
  
  
  boum.click('div.signup-form button#signup-button',function(){
    var username = $("#signup-username").val();
    var password = $("#signup-password").val();
    
    var user=new Parse.User();
    user.set("username",username);
    user.set("password",password);
    user.set("pointsAllTime",0);
    user.set("pointsThisMonth",0);
    user.signUp(null, {
      success: function(user) {
        
        Parse.User.logIn(username,password,{
          success:function(){
            app.v.selectLanguage();
          }, error:function(user,error){
            console.log(error);
          }
        });
        
      }, error: function(user, error) {
        console.log(error);
        $(".login .error").html("Invalid username or password. Please try again.").show();
        $(".login button").removeAttr("disabled");
      }
    });

  });
  
  
  var d='';
  //d+='<header id="header"></header>';
  d+='    <div id="entrance">';
  d+='      <div class="login-form">';
  d+='        <h2>Log In</h2>';
  d+='        <div class="error" style="display:none"></div>';
  d+='        <input type="text" id="login-username" placeholder="Username" />';
  d+='        <input type="password" id="login-password" placeholder="Password" />';
  d+='        <button id="login-button">Log In</button>';
  d+='      </div>';
  d+='      <div class="signup-form">';
  d+='        <h2>$25/month. The more you learn, the less you pay. Sign Up Below.</h2>';
  d+='        <div class="error" style="display:none"></div>';
  d+='        <input type="text" id="signup-username" placeholder="Username" />';
  d+='        <input type="password" id="signup-password" placeholder="Create a Password" />';
  d+='        <button id="signup-button">Sign Up</button>';
  /*
  d+='<form action="" method="POST">'
  d+='<script src="https://checkout.stripe.com/checkout.js" class="stripe-button" data-key="pk_test_UbVBYq3RX0BzGaO0XDX5Pt9A" data-amount="2500"  data-name="Lexponential"   data-description="1 Month of Lexponential ($25.00)"  data-image="/lexponential.png">';
  d+='</script>';
  d+='</form>';
  */
  d+='      </div>';
  d+='    </div>';
  return d;
};


///////////////////////////////////////////////////////end templates
///////////////////////////////////////////////////////begin css

zi={};
zi.lightGrey="#888";
zi.darkGrey="#333";
zi.config=function(){
  return {
    "body":{
      "display":"none",
      "font-family":"sans-serif",
      "padding":"0",
      "margin":"0",
      "border":"0",
      "background":"#fff"
    },
    "h1":{
      "font-size":"6em",
      "text-align":"center",
      "color":this.darkGrey,
      "padding":"0",
      "margin":"0"
    },
    "h2":{
      "text-align":"center"
    },
    "div#main":{
      'display':'none'
    },
    "div#todo-stats":{
      'display':'none'
    },
    "div#user-info":{
      "text-align":"right",
      "color":"#fff",
      "background":this.darkGrey,
      "padding":"20px"
    },
    "div#user-info a":{
      "color":"#0ff"
    },
    "div.wrapper":{
      "margin":"10px 100px 10px 100px"
    },
    "header#header":{
      "text-align":"center",
      "font-size":"2em",
      "padding":"0px",
      "margin":"20px",
      "border":"0px solid "+this.darkGrey,
      "background":"#555"
    },
    "header#header input[type=text]":{
      "width":"100%",
      "font-size":"1.2em",
      "padding":"0px",
      "padding-top":"10px",
      "padding-bottom":"10px",
      "border":"1px solid "+this.darkGrey
    },
    "div.content":{
      "border":"1px solid "+this.lightGrey,
      "padding":"0",
      "margin":"0"
    },
    "div.login-form":{
      "padding":"20px",
      "font-size":"2em",
      "background":"#eee",
      "color":this.lightGrey
    },
    "div.signup-form":{
      "background":this.darkGrey,
      "color":"#fff",
      "padding":"20px"
    },
    "div.signup-form input[type=text]":{
      "margin-bottom":"20px"
    },
    "div#entrance input, div#entrance button":{
      "font-size":"20px"
    },
    "div#entrance h2":{
      "text-align":"left"
    },
    "div#input-view":{
      "text-align":"center",
      "padding":"20px"
    },
    "div#input-view textarea":{
      "width":"100%",
      "height":"300px",
      "padding-top":"10px",
      "font-size":"0.8em"
    },
    "div#input-view button":{
      "font-size":"20px",
      "cursor":"pointer"
    },
    "div#language-selection":{
      "text-align":"center"
    },
    "div#language-selection button":{
      "width":"25%",
      "font-size":"1em",
      "cursor":"pointer",
      "padding":"5px"
    },
    "div#lexicon table":{
      "width":"100%"
    },
    "div#lexicon td":{
      "border":"1px solid "+this.darkGrey,
      "background":"#eee"
    },
    "div#navigation ul":{
      "background":this.darkGrey,
      "color":"#fff",
      "padding":"10px"
    },
    "div#navigation li":{
      "display":"inline",
      "cursor":"pointer",
      "padding":"10px"
    },
    "div#navigation li:hover":{
      "background":this.lightGrey
    },
    "div#flashcards div.card":{
      "background":"#eee",
      "border":"1px solid "+this.darkGrey,
      "text-align":"center",
      "margin":"40px",
    },
    "div#flashcards div.question":{
      "font-size":"2em",
      "padding":"20px"
    },
    "div#flashcards div.answer":{
      "background":"#fff",
      "border":"1px solid "+this.lightGrey,
      "margin":"2px",
      "cursor":"pointer",
      "padding":"20px"
    }
  };
};
zi.transform=function(css){
  var c="";
  for (var selector in css){
    c+=selector+"{";
    for (var property in css[selector]){
      c+=property+" : "+css[selector][property]+";";
    }
    c+="}";
  }
  return c;
};
zi.css=function(){
  if ($("head#zi").length<1){
    $("head").append("<style type='text/css' id='zi'></style>");
  }
  $("head style#zi").html( this.transform( this.config() ) );
};
/////////////////////////////////////////////////////// end css section
///////////////////////////////////////////////////////
