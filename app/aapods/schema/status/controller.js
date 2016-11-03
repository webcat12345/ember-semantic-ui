import Ember from 'ember';

export default Ember.Controller.extend({
  readyCt: function () {
    let tables = this.get('model.tables');
    let ready = 0;
    tables.forEach(function (t) {
      if (t.ready) {
        ready++;
      }
    });
    return ready;
  }.property('model.tables'),

  patterns: function () {
    let ts = this.get('model.tasks');
    let patterns = {
      newscubes: null,
      news: null,
      newswhy: null,
      defaultwhy: null,
      why: null,
      completed: true,
      running: false
    };
    ts.forEach(function (t) {
      if (t.get('type') === 'pipeline.itemsets:run' && t.get('name') === 'news') {
        patterns.newscubes = t;
        if (!t.get('isCompleted')) {
          patterns.completed = false;
        }

        if (!t.get('isRunning')) {
          patterns.running = true;
        }
      }
      if (t.get('type') === 'pipeline.itemsets:run' && t.get('name') === 'newswhy') {
        patterns.newswhy = t;
        if (!t.get('isCompleted')) {
          patterns.completed = false;
        }

        if (!t.get('isRunning')) {
          patterns.running = true;
        }
      }

      if (t.get('type') === 'pipeline.itemsets:run' && t.get('name') === 'defaultwhy') {
        patterns.defaultwhy = t;
        if (!t.get('isCompleted')) {
          patterns.completed = false;
        }

        if (!t.get('isRunning')) {
          patterns.running = true;
        }
      }
      if (t.get('type') === 'pipeline' && t.get('name') === 'news:run') {
        patterns.news = t;
        if (!t.get('isCompleted')) {
          patterns.completed = false;
        }

        if (!t.get('isRunning')) {
          patterns.running = true;
        }
      }
      if (t.get('type') === 'pipeline.itemsets:run' && t.get('name') === t.get('datasetId') + 'why') {
        patterns.why = t;
        if (!t.get('isCompleted')) {
          patterns.completed = false;
        }

        if (!t.get('isRunning')) {
          patterns.running = true;
        }
      }
    });
    return patterns;
  }.property('model.tasks'),

  sources: function () {
    let ts = this.get('model.tasks');
    let srcs = this.get('model.sources');
    let tables = this.get('model.tables');
    let srcProxies = Ember.A([]);
    srcs.forEach(function (s) {
      let sproxy = Ember.ObjectProxy.create({content: s});
      ts.forEach(function (t) {
        if (t.get('type') === 'pipeline.prepare:run' && t.get('name') === s.get('name')) {
          sproxy.set('task', t);
        }
      });
      for (let i = 0; i < tables.length; i++) {
        if (tables[i].source === s.id) {
          sproxy.set('table', tables[i]);
          break;
        }
      }
      srcProxies.pushObject(sproxy);
    });
    return srcProxies;
  }.property('model.tasks', 'model.sources', 'model.tables'),
  etl: function () {
    let ts = this.get('model.tasks');
    let tables = this.get('model.tables');

    let etl = {task: null, tables: []};

    ts.forEach(function (t) {
      if (t.get('type') === 'pipeline' && t.get('name') === 'etl:run') {
        etl.task = t;
      }
      if (t.get('type') === 'etl') {
        let table = {task: t, table: null};
        for (let i = 0; i < tables.length; i++) {
          if (tables[i].name === t.get('name') || tables[i].name === t.get('datasetId') + "_" + t.get('name')) {
            table.table = tables[i];
            break;
          }
        }
        etl.tables.push(table);
      }
    });
    return etl;
  }.property('model.tasks', 'model.tables')

});

