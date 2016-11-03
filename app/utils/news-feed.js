import Ember from 'ember';

export default function add_meta_data(feed, datefactorid, user, metrics) {
  var colors = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "RebeccaPurple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen"];
  var colormap = {};
  if (!feed) {
    return;
  }
  var newfeed = Ember.A([]);
  for (var i = 0; i < feed.length; i++) {
    //feed[i].factorid + "==" + feed[i].factorcol;
    var filter = "";
    var factors = [];
    var values = [];
    var factorids = "";

    for (let k = 0; k < feed[i]["segment"].length; k++) {
      if (feed[i]["segment"][k]["id"] === 'Overall') {
        continue;
      }
      filter += feed[i]["segment"][k]["id"] + "==" + feed[i]["segment"][k]["val"] + ";";
      factors.push(k);
      values.push(feed[i]["segment"][k]["val"]);
      factorids += feed[i]["segment"][k]["id"];
    }
    filter = filter.substring(0, filter.length - 1);
    feed[i]["allsegmentslink"] = {};
    feed[i]["allsegmentslink"]["filter"] = JSON.stringify({
      "metrics": [feed[i].id],
      "dimensions": [feed[i]["segment"][0].id]
    });

    feed[i]["totallikes"] = 0;
    feed[i]["likedby"] = "";
    if ("likes" in feed[i]) {
      feed[i]["totallikes"] = Object.keys(feed[i]["likes"]).length;
      feed[i]["likedby"] = Object.keys(feed[i]["likes"]).join(",");
      feed[i]["liked"] = (user.username in feed[i]["likes"]);
    }

    feed[i]["factorname"] = feed[i]["segment"][0].name;
    feed[i]["allsegmentslink"]["query"] = "";
    feed[i]["segmentlink"] = {};
    feed[i]["segmentlink"]["filter"] = JSON.stringify({
      "segments": [feed[i]["segment_name"]]
    });
    feed[i]["segmentlink"]["query"] = "";

    if (filter !== 'Overall==Overall') {
      feed[i]["filter"] = filter;
    }
    var d = new Date(feed[i]["datecol"]);
    var s = d.toDateString();
    feed[i]["datecurrent"] = s.split(' ')[0] + ", " + s.split(' ')[1] + " " + s.split(' ')[2];
    d = new Date(feed[i]["prevdatecol"]);
    s = d.toDateString();
    feed[i]["dateprevious"] = s.split(' ')[0] + ", " + s.split(' ')[1] + " " + s.split(' ')[2];

    feed[i]["datefactorid"] = datefactorid;
    feed[i]["factors"] = factors;
    feed[i]["values"] = values;
    feed[i]["c_current"] = (feed[i]["c_current"] * 100).toFixed(2);
    feed[i]["c_previous"] = (feed[i]["c_previous"] * 100).toFixed(2);
    feed[i]["c_delta"] = (feed[i]["c_delta"] * 100).toFixed(2);
    feed[i]["moving_avg_contribution"] = (feed[i]["moving_avg_contribution"] * 100).toFixed(2);
    feed[i]["url"] = window.location.href;

    feed[i]["period_lang"] = 'day last week';
    feed[i]["weekType"] = 1;
    if (feed[i]["period"] === '366' || feed[i]["period"] === '365') {
      feed[i]["period_lang"] = 'date last year';
      feed[i]["weekType"] = 0;
    }

    if (feed[i]["period"] === '364') {
      feed[i]["period_lang"] = 'day last year';
      feed[i]["weekType"] = 0;
    }

    if (factorids in colormap) {
      feed[i]["color"] = colormap[factorids];
    }
    else {
      colormap[factorids] = colors.pop();
      feed[i]["color"] = colormap[factorids];
    }

    if (feed[i].delta > 0) {
      feed[i]["storyclass"] = "posstory";
      feed[i]["isPos"] = true;
    }
    else {
      feed[i]["storyclass"] = "negstory";
      feed[i]["isPos"] = false;
    }
    for (let k = 0; k < feed[i]["table"].length; k++) {
      feed[i]["table"][k].model = metrics.findBy('id', feed[i]["table"][k].id);
      if (feed[i]["table"][k]["delta"] > 0) {
        feed[i]["table"][k]["storyclass"] = "posstory";
        feed[i]["table"][k]["isPos"] = true;
      }
      else {
        feed[i]["table"][k]["storyclass"] = "negstory";
        feed[i]["table"][k]["isPos"] = false;
      }
    }

    newfeed.pushObject(Ember.Object.create(feed[i]));
  }
  return newfeed;
}
