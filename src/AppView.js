/* global ns, Backbone, $, Handlebars, _ */
(function(ns, Backbone, $, Handlebars, _) {
  'use strict';
  var BaseFlipView = (function() {
    var _prerender = function() {
      _.each(this.panelActions, function(next, current) {
        var match = current.split(/\s+/),
          source = match[0],
          evt = match[1];
        if(typeof this.panels[source] !== "undefined") {
            this.panels[source].bind(evt, this.flip.bind(this, this.panels[source], this.panels[next]));
        }
      }.bind(this));
    };

    var _registerPanels = function() {
      _.each(this.partials, function(partial) {
        Handlebars.registerPartial(partial, Handlebars.templates[partial + ".hbs"]);
      }.bind(this));
    };

    var _registerViews = function() {
      _.each(this.panelActions, function(a, idx) {
        var selector = idx.split(/\s+/)[0];
        this.panels[selector] = new PanelView({el: this.$(selector)});
      }.bind(this));
    };

    return Backbone.View.extend({
      flipped: false,
      partials: [],
      panels: {},
      panelActions: {},
      initialize: function() {
        _registerPanels.call(this);
      },
      render: function() {
        var parent = this;
        var model = { data: 
          {
            phone: '',
            website: ''
          } 
        };
        var cardInit;
        var planDetails;
        var cardDone;
        var editForm;

        this.$el.html(this.template({
          feat_list_context: { title: "First Panel", text: 'Here is some description', action_title: "Continue" },
          edit_context: { title: "Edit your data", action_title: "Continue", isPhone: true, isWebsite: false },
          done_context: { title: "Thank you!", action_title: "Close" },
          error_context: { error_message: "Something went wrong" }
        }));
        _registerViews.call(this);
        
        cardInit = this.panels['.panel-start'] = {$el: this.$('.panel-start')};
        this.panels['.panel-second'] = new EditFormPanel({el: this.$('.panel-second')});
        this.panels['.panel-third'] = new CardDonePanel({el: this.$('.panel-third')});
        
        planDetails = this.panels['.panel-first'];

        planDetails.bind('panel-contact', function (e, data) {
          if (model.data.phone && model.data.phone !== '') {
            parent.flip(planDetails, cardDone);
          } else {
            parent.flip(planDetails, editForm);
          }
        });
        
        cardDone = this.panels['.panel-third'];
        cardDone.bind('panel-close', function (e, data) {
          console.log('close form');
        });
        editForm = this.panels['.panel-second'];
        editForm.bind('panel-validate', function (e, data) {
          parent.flip(editForm, cardDone);
        });
        
        parent.init(this.panels['.panel-first']);
        _prerender.call(this);

      },
      init: function(panel) {
        panel.$el.addClass('flipped-back');
      },
      flip: function(curr, next) {
        this.$('.panel').removeClass('flipped-front');
        this.$('.panel').removeClass('flipped-back');
        if(!this.flipped) {
          next.$el.addClass('flipped-front');
          curr.$el.addClass('flipped-back');
        } else {
          next.$el.addClass('flipped-back');
          curr.$el.addClass('flipped-front');
        }
        this.flipped = !this.flipped;
        this.$el.find(".container").toggleClass("flip");
      }
    });
  })();

  var MyCustomView = BaseFlipView.extend({
    partials: ['card-done', 'card-edit-form', 'card-feature-list', 'card-error'],
    panelActions: {
      '.panel-first panel-next': '.panel-second',
      '.panel-second panel-next': '.panel-third',
      '.panel-third panel-next': '.panel-error',
      '.panel-error panel-any': '.panel-first'
    },
    initialize: function() {
      BaseFlipView.prototype.initialize.apply(this, arguments);
      this.template = Handlebars.templates["app.hbs"];
      Handlebars.registerPartial('wrapper', Handlebars.templates["wrapper.hbs"]);
      
    }
  });
  
  var CardDonePanel = Backbone.View.extend({
    events: {
      'click .close': 'closePanel'
    },
    initialize: function() {
      
    },
    closePanel: function(e) {
      this.trigger('panel-close', e, { panelId: 'panel_done' });
    }
  });
  var EditFormPanel = Backbone.View.extend({
    events: {
      'click .done': 'submitForm'
    },
    submitForm: function(e) {
      e.preventDefault();
      this.trigger('panel-validate', e, { panelId: 'panel_edit' })
    }
  });


  var PanelView = Backbone.View.extend({
    events: {
      "click .next": "next",
      "click .done": "next",
      "click .close": "next",
      "click": 'any'
    },
    any: function() {
      this.trigger("panel-any");
    },
    next: function() {
      this.trigger('panel-contact');
    }
  });

  ns['app'] = {
      init: function (rootEl) {
        return new MyCustomView({
          el: rootEl
        }).render();
      }
  };
})(ns, Backbone, $, Handlebars, _ );