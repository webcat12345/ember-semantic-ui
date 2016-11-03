import Ember from 'ember';

export default Ember.Component.extend({
    prog: 0,
    incrementBy: 2.5,
    currDimIndex: 0,
    tag: '',
    increment: function () {
        let dims =  this.get("dims");
        let currProg = this.get("prog");
        if (currProg < 100) {
            this.set("prog", currProg + this.incrementBy)
            if(dims){
                let dim = dims.objectAt(this.currDimIndex);
                this.set("dim", dim.name)
                this.currDimIndex = this.currDimIndex +1;
            }
            //return this.incrementProperty("prog", this.incrementBy);
        } else {
            //this.set("prog", 100);
            //this.set("dim", done);
        }
        //currProg = this.get("prog");
        setTimeout(this.increment.bind(this), 1000);
    },
    didInsertElement: function () {
        this.increment();
    }
});
