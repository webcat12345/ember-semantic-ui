import Ember from 'ember';

export default Ember.Component.extend({
    didInsertElement: function () {

        // Add the active classes (required by the carousel to work)
        Ember.$('.carousel-inner div.item').first().addClass('active');
        Ember.$('.carousel-indicators li').first().addClass('active');

        // Set the values of data-slide-to attributes
        Ember.$('.carousel-indicators li').each(function (index, li) {
            Ember.$(li).attr('data-slide-to', index);
        });

        //// Start the carousel
        //Ember.$('.carousel').carousel();
    }
});
