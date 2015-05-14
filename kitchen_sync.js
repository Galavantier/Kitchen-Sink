#!/usr/bin/env shjs

require('shelljs/global');
var chokidar = require('chokidar');
var cliArgs = require("command-line-args");
var Promise = require('promiscuous');

/* define the command-line options */
var cli = cliArgs([
    { name: "help", type: Boolean, description: "Print usage instructions." },
    { name: "host", type: String, description: "The SSH hostname." },
    { name: "port", type: String, description: "The SSH port to use." },
    { name: "localDir", type: String, defaultOption : true, description: "The Local Directory to watch." },
    { name: "remoteDir", type: String, description: "The Remote Directory to sync with." },
    { name: "ignore", type: Array, description: "A comma seperated list of filepath patterns to ignore. We ALWAYS ignore paths that start with a '.'" }
]);

/* parse the supplied command-line values */
var options = cli.parse();

if(options.help) {
  /* generate a usage guide */
  var usage = cli.getUsage({
      header: "Sync a local directory to a remote server using sftp (Mainly for use with Pantheon Multidev environments).",
      footer: ""
  });

  console.log(usage);
  return;
}

var homeDir = exec('echo ~', {silent:true}).output;

var getRelativePath = function(localPath) { return localPath.replace(options.localDir.replace('~', homeDir), ''); };

var getRemotePath = function(localPath) {
  remotePath = (typeof options.remoteDir !== 'undefined') ? options.remoteDir : '';
  return remotePath + getRelativePath(localPath);
};

var runSftp = function(cmd, args) {
  return new Promise(function (resolve, reject) {
    exec('sftp -o Port=' + options.port + ' ' + options.host + ' <<<"' + cmd + ' ' + args.join(' ') + '"',
        {silent:true, async:true},
        function(code, output) {
          var result = (code < 1) ? resolve(output) : reject(output);
        }
    );
  });
};

var log = function(title, path) { console.log(title + " " + path); };

var syncConfig = [
  { title : 'Updated', events : ['change', 'add'], cmds : ['put'], args : function(path) { return [path, getRemotePath(path)]; } },
  { title : 'Created', events : ['addDir'], cmds : ['mkdir'], args : function(path) { return [getRemotePath(path)]; } },
  { title : 'Deleted', events : ['unlink', 'unlinkDir'], cmds : ['rm', 'rmdir'], args : function(path) { return [getRemotePath(path)]; } }
];

var watcher = chokidar.watch(options.localDir, { ignoreInitial: true, ignored: (typeof options.ignore !== 'undefined') ? [/[\/\\]\./].concat(options.ignore) : /[\/\\]\./ });

syncConfig.forEach(function(config) {
  config.events.forEach(function(evnt, index) {
    watcher.on(evnt, function(path) {
      runSftp(config.cmds[index], config.args(path)).then(function(output) { log(config.title, getRelativePath(path)); });
    });
  });
});

watcher
  .on('error', function(error) { console.error('Error happened', error); })
  .on('ready', function() { console.log('Initial scan complete. Ready for changes.'); });
