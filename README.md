# Installation with Vagrant

* `vagrant up`
* `vagrant ssh`
* `cd /datasenseui`
* `wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.23.2/install.sh | bash`
* `source ~/.profile` (.bash_prfile)
* `nvm install 4.2.0`
* `nvm alias default v4.2.0`
* `npm install -g ember-cli` (0.11)
* `npm install -g bower`
* `nvm alias default v0.10.36`
* `npm install`
* `bower install`
* `ember server`


## Running

* `ember server`
* Visit your app at http://localhost:4200.
* If using Vagrant `ember server --watcher polling` will live reload

## Deploying to Heroku
Look at deploy section on http://www.ember-cli.com/



## Writing code
Look at generators on http://www.ember-cli.com/

Generate the relevant file, then fill it

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://iamstef.net/ember-cli/](http://iamstef.net/ember-cli/).

##Windows Host with Vagrant
http://kmile.nl/post/73956428426/npm-vagrant-and-symlinks-on-windows

Need to symlink some folders to some directory on guest due to windows file name length limit.
This can be done by running it as admin once

As Admin Run:

* `va`
* `ln -s ~/node_modules /datasenseui/node_modules`
* `mkdir ~/ember_tmp`
* `ln -s ~/ember_tmp /datasenseui/tmp`
