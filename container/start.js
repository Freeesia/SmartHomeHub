'use strict';

const fs = require('fs');

// Match the application's config.json interface, using runtime mounts only.
const config = JSON.parse(fs.readFileSync('/etc/shh/settings.json', 'utf8'));
const secrets = JSON.parse(fs.readFileSync('/run/secrets/shh/secrets.json', 'utf8'));

for (const key of ['voiceKey', 'remoToken', 'jwtSecret', 'ldapPassword', 'sessionSecret']) {
  if (!Object.prototype.hasOwnProperty.call(secrets, key)) {
    throw new Error('A required SHH credential is missing: ' + key);
  }
}

config.googlehome.voiceKey = secrets.voiceKey;
config.remo = secrets.remoToken;
config.jwt.secretOrKey = secrets.jwtSecret;
config.ldap.bindCredentials = secrets.ldapPassword;
config.sessionSecret = secrets.sessionSecret;

process.umask(0o077);
fs.writeFileSync('config.json', JSON.stringify(config), { mode: 0o600 });
require('/opt/shh/app/bin/www.js');
