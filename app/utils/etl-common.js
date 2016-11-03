export default {
  test: "hello",
  convertArgArrToDict: function (argArr, argDefaults) {
    var t_args_dict = {};
    for (var i = 0; i < argArr.length; i++) {
      var t_arg = argArr[i];
      if (argDefaults) {
        var t_arg_def = argDefaults[t_arg["name"]];
        if (t_arg_def && "func" in t_arg_def) {
          t_arg["value"] = t_arg_def["func"](t_arg["value"]);
        }
      }
      t_args_dict[t_arg["name"]] = t_arg["value"];
    }
    return t_args_dict;
  }
};
