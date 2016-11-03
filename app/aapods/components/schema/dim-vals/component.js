import Ember from 'ember';
import ENV from 'datasenseui/config/environment';
export default Ember.Component.extend({
    tag: "",
    isLoading: true,
    isVals: function(){
      if(this.get("vals").get("length") > 0){
          return true;
      }else{
          return false;
      }
    }.property("vals"),
    _getVals: function () {
        if (this.get("dimid")) {
            let _this = this;
            let onSuccess = function (dimensionsValues) {
                dimensionsValues = dimensionsValues.map((dim) => {
                    return { id: dim, name: dim, value: encodeURI(dim) };
                });
                _this.set("vals", dimensionsValues);
                _this.set("isLoading", false);
            };
            let onFailure = function () {
                _this.set("error", true);
                _this.set("isLoading", false);
            };
            Ember.$.get(ENV.api_endpoint + '/schema/dimensionsValues/' + this.get("dimid") + '/').then(onSuccess, onFailure);
        } else {
            this.set("vals", null);
        }
    },
    getVals: function () {
        this._getVals();
    }.observes("dimid"),
    actions: {
        retry: function () {
            this._getVals();
        }
    }
});