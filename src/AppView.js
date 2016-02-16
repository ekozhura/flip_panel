/* global Backbone, $, Handlebars, _ */
var AppView = Backbone.View.extend({
  $el: $('#app'),
  flipped: false,
  initialize: function() {
    this.template = Handlebars.templates["main.hbs"];
  },
  render: function() {
    this.$el.html(this.template({}));
    var firstPanel = new PanelView({
      el: this.$("#panel-container1"),
      tpl: "panel1.hbs",
      data: { title: "First Panel" }
    });
    var secondPanel = new PanelView({
      el: this.$("#panel-container2"),
      tpl: "panel2.hbs",
      data: { btnText: "don't click me" }
    });
    var errorPanel = new PanelView({
      el: this.$("#panel-container3"),
      tpl: "panel3.hbs",
      data: { }
    });
    firstPanel.$el.addClass('flipped-back');
    firstPanel.bind("flip", this.flip.bind(this, firstPanel, secondPanel));
    secondPanel.bind("flip", this.flip.bind(this, secondPanel, errorPanel));
  },
  flip: function(curr, next) {
    if(!this.flipped) {
      this.$('.panel').removeClass('flipped-front');
      next.$el.addClass('flipped-front');
      curr.$el.addClass('flipped-back');
    } else {
      this.$('.panel').removeClass('flipped-back');
      next.$el.addClass('flipped-back');
      curr.$el.addClass('flipped-front');
    }
    this.flipped = !this.flipped;
    this.$el.find(".container").toggleClass("flip");
  }
});

var PanelView = Backbone.View.extend({
  props: {
    tpl: '',
    data: {}
  },
  events: {
    "click .next": function() {
      this.trigger("flip");
    }
  },
  initialize: function(opts) {
    _.extend(this.props, opts);
    this.render();
  },
  render: function() {
    this.$el.html(Handlebars.templates[this.props.tpl](this.props.data));
  }
});

$(document).ready(function() {
  new AppView({
    el: '#app'
  }).render()
});