## Available scripts

### Process control:

#### `yarn dev`

Run locally using nodemon

#### `yarn start`

Run detached node process using forever

#### `yarn restart`

Restart detached node process

#### `yarn stop`

Stop detached node process

### Logs:

#### `yarn logs`

Print output and error log files

#### `yarn logs:output`

Print output log file

#### `yarn logs:error`

Print error log file

#### `yarn logs:clear`

Clear both error and output log files

### Lint:

#### `yarn lint`

Check for lint errors using eslint

#### `yarn lint:fix`

Check for lint errors using eslint and try to autofix them

### Commands:

### Seeders:

#### `yarn seed:users`

Seed users to database

## 1. Production Deployment

`1. Run 'yarn' to install npm packages`

`2. Copy .env to .env.local file in directory root folder (same directory as .env)`

`3. Set .env.local variables`

`5. Run 'yarn start' to start nodejs script in background`

`6. Run 'yarn restart' to restart nodejs script`

`7. Run 'yarn stop' to stop nodejs script`

## 2. Development Deployment

`1. Run 'yarn' to install npm packages`

`2. Copy .env to .env.local file`

`3. Set .env.local variables`

`4. Run 'yarn dev' to serve nodejs script`

## 3. Installing MongoDB and configuring environment credentials

`1.1. For Windows follow steps on link 'http://www.baconapplications.com/installing-and-securing-mongodb-on-windows/'`

`1.2. For Linux Ubuntu 16/18/19 follow tutorial on 'https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-mongodb-on-ubuntu-16-04'`

`2. After creating admin for all databases with role:'userAdminAnyDatabase' you create user which has permissions to change only database you are using`

`3. Enter mongoDb console with created admin account`

`3.1 Run command 'use admin' to change to admin database (where admin users should be stored)`

`3.2 Run command 'db.createUser( { user: "api", pwd: "asdlolasd", roles: [ { role: "dbOwner", db: "online-room" } ] } )'`

`4 Enter .env.local file of project and set variables of user you made following step 3`

`4.1 MONGO_USERNAME = username_you_want`

`4.2 MONGO_PASSWORD = password_you_want`

`4.3 MONGO_PORT= if you changed default port (default is 27017)`

`4.4 MONGO_DB=db_name_you_want (default is "eta")`

`4.5 MONGO_HOSTNAME= if you are not using locally installed mongoDB (default is localhost)`

`4.6 MONGO_SOURCE= database where credentials for user are stored (default is "admin")`


## 4. Install Redis

`Install redis locally or use public server`

`1. For ubuntu 16/18 use Digital Ocean tutorial https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-18-04`

`2. For Windows https://github.com/rgl/redis/downloads`

`3. After installing add credentials to .env.local file`

`3.1 REDIS_HOST = '127.0.0.1' if installed locally`

`3.2 REDIS_PASSWORD= if redis is secured enter password, if not leave empty`

`3.3 REDIS_PORT = if you changed default port (default is 6379)`

`3.4 REDIS_DB = choosen db can be (0-9), all nodes that are connected must use same DB`




## Possible issues and fixes:

- yarn  - Error: Can't find Python executable "python", you can set the PYTHON env variable.
```sh 
sudo apt-get update
sudo apt-get install python2.7    
sudo ln -s /usr/bin/python2.7 /usr/bin/python 
``` 

