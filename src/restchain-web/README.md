
# Developer Instructions

> <mark> IMPORTANT </mark> : the web application MUST use a node 10 version for compatibility reasons. 

## Installation

```
$ cd restchain-web
```

Check the node version 
```
node -v
```

Installing and building the web app
```
$ yarn 
$ yarn build
```

## Image creation 

Previous steps (Installation) are required

```
$ docker build ./ -t restchain-web:xx
```

Steps required to publish the repository
```
$ docker login
$ docker tag restchain-web:xx restchain/restchain-web:xx
$ docker push restchain/restchain-web:xx
```









