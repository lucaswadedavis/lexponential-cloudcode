///////////////////////////////////////////////////////begin css
var zi={};
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
