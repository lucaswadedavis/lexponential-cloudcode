$(function() {
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
  sourceLang="spanish";
  targetLang="english";
  
  Parse.$ = jQuery;
  zi.css();
  // Initialize Parse with your Parse application javascript keys
  Parse.initialize(creds().apk, creds().jsk);








  var Word = Parse.Object.extend("Word", {});
  











  var Todo = Parse.Object.extend("Todo", {
    // Default attributes for the todo.
    defaults: {
      content: "empty todo..",
      sourceLang:sourceLang,
      targetLang:targetLang,
      done: false
    },

    // Ensure that each todo created has `content`.
    initialize: function() {
      if (!this.get("content")) {
        this.set({"content": this.defaults.content});
      }
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    }
  });









  // This is the transient application state, not persisted on Parse
  var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });


  
  
  
  
  
  
  
  var WordList = Parse.Collection.extend({
    //need a Word class
    model: Word
  });
  
  
  
  /*
  var FlashcardModel = Parse.Object.extend({
    
  });
  
  
  
  
  var FlashcardCollection = Parse.Collection.extend({
    model : Word,
    initialize : function(){
      
    }
  });
  
  
  
  
  
  var FlashcardView = Parse.View.extend({
    model : FlashcardCollection,
    
    initialize : function(){
        
    },
    
    render : function(){
      
    }
    
  });
  */ls
  
  
  
  
  
  
  
  
  
  
  
  
  
  var TodoList = Parse.Collection.extend({

    // Reference to this collection's model.
    model: Todo,

    // Filter down the list of all todo items that are finished.
    done: function() {
      return this.filter(function(todo){ return todo.get('done'); });
    },
    

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.done());
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: function(todo) {
      return todo.get('order');
    }

  });












  var TodoView = Parse.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .toggle"              : "toggleDone",
      "dblclick label.todo-content" : "edit",
      "click .todo-destroy"   : "clear",
      "keypress .edit"      : "updateOnEnter",
      "blur .edit"          : "close"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a Todo and a TodoView in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      _.bindAll(this, 'render', 'close', 'remove');
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove);
    },

    // Re-render the contents of the todo item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.input = this.$('.edit');
      return this;
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
      this.model.save({content: this.input.val()});
      $(this.el).removeClass("editing");
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });







  //eventually build a word view
  var WordView = Parse.View.extend({
    template:_.template($('#word-template').html()),
    
    initialize: function(){
      //console.log("wordView initialized");
      this.render();
    },
    
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });











  var WordListView = Parse.View.extend({
    el:$(".wordswords table tbody"),
    template:_.template($('#word-template').html()),
    initialize:function(){
      ///////////////////////////////////////////////////
      this.words = new WordList;
      this.words.query = new Parse.Query(Word);
      this.words.query.equalTo("owner",Parse.User.current() );
      this.words.bind('all',this.render, this);
      this.words.fetch();
      ////////////////////////////////////////////////////
    },
      
    events:{
      "click .log-out":"logOut"
    },
      
    render:function(){
      //console.log(this);
      this.$el.html("");
      this.words.each(function(word){
        wordView=new WordView({model:word});
        this.$el.prepend(wordView.template(word.attributes));
        //console.log(word);
      },this);
    },
    
    logOut:function(){
      this.$el.html("");
    }
  });



  var LanguageSelectionView = Parse.View.extend({
    el:$(".languages"),
    template:_.template($('#language-selection-template').html()),
    
    initialize:function(){
      this.render();
      },
      
    render:function(){
      //console.log(this);
      this.$el.html("");
      var d="";
      d+='<div>';
      for (var key in languages){
        d+="<button value='"+key+"'>"+key+"</button>";
      }
      d+="</div>";
      this.$el.html(d);
    },
    
    clear:function(){
      this.$el.html("");
    }
  });

















  // The Application
  // ---------------

  // The main view that lets a user manage their todo items
  var ManageTodosView = Parse.View.extend({

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-todo":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete",
      "click .log-out": "logOut",
      "click ul#filters a": "selectFilter"
    },

    el: ".content",

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved to Parse.
    initialize: function() {
      var self = this;

      _.bindAll(this, 'addOne', 'addAll', 'addAllWords', 'addSome', 'render', 'toggleAllComplete', 'logOut', 'createOnEnter');

      // Main todo management template
      this.$el.html(_.template($("#manage-todos-template").html()));
      
      this.input = this.$("#new-todo");
      this.allCheckbox = this.$("#toggle-all")[0];

      // Create our collection of Todos
      this.todos = new TodoList;

      // Setup the query for the collection to look for todos from the current user
      this.todos.query = new Parse.Query(Todo);
      this.todos.query.equalTo("user", Parse.User.current());
        
      this.todos.bind('add',     this.addOne);
      this.todos.bind('reset',   this.addAll);
      //this.todos.bind('reset',   this.addAllWords);
      this.todos.bind('all',     this.render);

      // Fetch all the todo items for this user
      this.todos.fetch();

      state.on("change", this.filter, this);
    },

    // Logs out the user and shows the login view
    logOut: function(e) {
      Parse.User.logOut();
      new LogInView();
      this.undelegateEvents();
      delete this;
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      var done = this.todos.done().length;
      var remaining = this.todos.remaining().length;

      this.$('#todo-stats').html(this.statsTemplate({
        total:      this.todos.length,
        done:       done,
        remaining:  remaining
      }));
      
      this.delegateEvents();

      this.allCheckbox.checked = !remaining;
      new LanguageSelectionView;
    },

    // Filters the list based on which type of filter is selected
    selectFilter: function(e) {
      var el = $(e.target);
      var filterValue = el.attr("id");
      state.set({filter: filterValue});
      Parse.history.navigate(filterValue);
    },

    filter: function() {
      var filterValue = state.get("filter");
      this.$("ul#filters a").removeClass("selected");
      this.$("ul#filters a#" + filterValue).addClass("selected");
      if (filterValue === "all") {
        this.addAll();
      } else if (filterValue === "completed") {
        this.addSome(function(item) { return item.get('done') });
      } else {
        this.addSome(function(item) { return !item.get('done') });
      }
    },

    // Resets the filters to display all todos
    resetFilters: function() {
      this.$("ul#filters a").removeClass("selected");
      this.$("ul#filters a#all").addClass("selected");
      this.addAll();
    },

    // Add a single todo item to the list by creating a view for it, and
    // prepending its element to the `<ul>`.
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").prepend(view.render().el);
    },
    // prepending its element to the `<tbody>`.
    addOneWord: function(word) {
      console.log("addOneWord Method");
      var view = new WordView({model: word});
      console.log(view.render().el);
      this.$("#word-table tbody").prepend(view.render().el);
    },
    
    // Add all items in the Todos collection at once.
    addAll: function(collection, filter) {
      this.$("#todo-list").html("");
      this.todos.each(this.addOne);
    },

      // Add all items in the Todos collection at once.
    addAllWords: function(collection, filter) {
      console.log("addAllWords");
      this.$("#word-table tbody").html("");
      console.log(this.words);
      //console.log(this.words.each);
      this.words.each(function(word){
        var wordView = new WordView({model:word});
        this.$el.append(wordView.render().el);
      },this);
    },

    // Only adds some todos, based on a filtering function that is passed in
    addSome: function(filter) {
      var self = this;
      this.$("#todo-list").html("");
      this.todos.chain().filter(filter).each(function(item) { self.addOne(item) });
    },

    // If you hit return in the main input field, create new Todo model
    createOnEnter: function(e) {
      var self = this;
      if (e.keyCode != 13) return;

      this.todos.create({
        content: this.input.val(),
        order:   this.todos.nextOrder(),
        done:    false,
        user:    Parse.User.current(),
        ACL:     new Parse.ACL(Parse.User.current())
      });

      this.input.val('');
      this.resetFilters();
    },

    // Clear all done todo items, destroying their models.
    clearCompleted: function() {
      _.each(this.todos.done(), function(todo){ todo.destroy(); });
      return false;
    },

    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      this.todos.each(function (todo) { todo.save({'done': done}); });
    }
  });





















  var LogInView = Parse.View.extend({
    events: {
      "submit form.login-form": "logIn",
      "submit form.signup-form": "signUp"
    },

    el: ".content",
    
    initialize: function() {
      _.bindAll(this, "logIn", "signUp");
      this.render();
    },

    logIn: function(e) {
      var self = this;
      var username = this.$("#login-username").val();
      var password = this.$("#login-password").val();
      
      Parse.User.logIn(username, password, {
        success: function(user) {
          new ManageTodosView();
          self.undelegateEvents();
          delete self;
        },

        error: function(user, error) {
          self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
          self.$(".login-form button").removeAttr("disabled");
        }
      });

      this.$(".login-form button").attr("disabled", "disabled");

      return false;
    },

    signUp: function(e) {
      var self = this;
      var username = this.$("#signup-username").val();
      var password = this.$("#signup-password").val();
      
      Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
        success: function(user) {
          new ManageTodosView();
          self.undelegateEvents();
          delete self;
        },

        error: function(user, error) {
          self.$(".signup-form .error").html(_.escape(error.message)).show();
          self.$(".signup-form button").removeAttr("disabled");
        }
      });

      this.$(".signup-form button").attr("disabled", "disabled");

      return false;
    },

    render: function() {
      this.$el.html(_.template($("#login-template").html()));
      this.delegateEvents();
    }
  });




















  // The main view for the app
  var AppView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    initialize: function() {
      this.render();
    },

    render: function() {
      if (Parse.User.current()) {
        new ManageTodosView();
        new WordListView();
        new LanguageSelectionView();
      } else {
        new LogInView();
      }
    }
  });











  var AppRouter = Parse.Router.extend({
    routes: {
      "all": "all",
      "active": "active",
      "completed": "completed"
    },

    initialize: function(options) {
    },

    all: function() {
      state.set({ filter: "all" });
    },

    active: function() {
      state.set({ filter: "active" });
    },

    completed: function() {
      state.set({ filter: "completed" });
    }
  });







  var state = new AppState;











  new AppRouter;
  new AppView;
  
  Parse.history.start();
});



///////////////////////////////////////////////////////begin css

zi={};
zi.lightGrey="#888";
zi.darkGrey="#333";
zi.config=function(){
  return {
    "body":{
      "font-family":"sans-serif",
      "padding":"0",
      "margin":"0",
      "border":"0",
      "background":"#fff"
    },
    "h1":{
      "font-size":"3em",
      "text-align":"center",
      "color":this.darkGrey
    },
    "div#main":{
      'display':'none'
    },
    "div#todo-stats":{
      'display':'none'
    },
    "div.content":{
      "background":this.lightGrey
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
    "div.content, div.wordswords":{
      "margin":"20px",
      "border":"1px solid "+this.lightGrey
    },
    "div.wordswords table":{
      "width":"100%"
    },
    "div.wordswords td":{
      "border":"1px solid "+this.lightGrey
    },
    "form.login-form":{
      "padding":"20px",
      "font-size":"2em",
      "background":"#eee",
      "color":this.lightGrey
    },
    "form.signup-form":{
      "background":this.darkGrey,
      "color":"#fff",
      "padding":"20px"
    },
    "form.login-form input, form.signup-form input":{
      "font-size":"20px"
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