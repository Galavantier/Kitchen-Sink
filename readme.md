#Kitchen Sync
####Sync a local directory to a remote server using sftp (Mainly for use with Pantheon Multidev environments)

##Installation
```
git clone https://github.com/Galavantier/Kitchen-Sink.git
cd <code-directory>
npm install -g
chmod +x ./kitchen-sync.js

# optionally add kitchen-sync.js to your bin directory
```

##Usage
```
  --help                  Print usage instructions.
  --host <string>         The SSH hostname.
  --port <string>         The SSH port to use.
  --localDir <string>     The Local Directory to watch.
  --remoteDir <string>    The Remote Directory to sync with.
  --ignore <array>        A comma seperated list of filepath patterns to
                          ignore. We ALWAYS ignore paths that start with a '.'
```

##Example
```
./kitchen-sync.js --host multidev-env.got-pantheon.io --port 23 --localDir ~/Documents/sites/code/ --remoteDir code --ignore '**/sites/default/**'
```

##Notes
- If you get a login error, or the script hangs, try to run sftp directly and manually log in.
- You can just log in and immediately exit the sftp prompt. It's just so the terminal will cache your credentials.

The script does not support auto log-in at the moment, so you either need to have your SSH key setup so that
you do not need to authenticate, or you need to log in with ssh or sftp manually first.

##Dependencies
This project is built on the shoulders of giants:
 - chokidar (https://github.com/paulmillr/chokidar)
 - command-line-args (https://github.com/75lb/command-line-args)
 - promiscuous (https://github.com/RubenVerborgh/promiscuous)
 - shelljs (https://github.com/arturadib/shelljs)
