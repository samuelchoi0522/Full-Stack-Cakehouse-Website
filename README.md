1. Change 2 files in your docker container
```
- Dot_AWS_Credentials -> ~/.aws/credentials
- Dot_AWS_Config -> ~/.aws/config
```

2. to build the docker image
```
- Install 'Docker Desktop' in your macbook and do setup
- run docker build
  $ docker build -t sweetpluscake:test -f ./Dockerfile .
- if you want to tag it differently
  $ docker build -t sweetpluscake:different_tag -f ./Dockerfile .
- see if your image is running
  $ docker image ls
- to create & get into your docker container
  $ docker run -it -v {Alsolute pat to your source code without slash at the end}:/root/sweetplus {Your image name}:{Your image tag} /bin/bash
  $ docker run -it -v /Users/chois025/MyWorkspace/goapp/src/github.com/comdol2/Full-Stack-Cakehouse-Website:/root/sweetplus sweetpluscake:test /bin/bash
- to get into the same container from another terminal
  $ docker container ls
  CONTAINER ID   IMAGE                       COMMAND                  CREATED       STATUS       PORTS                              NAMES
  18a4e4b12c0f   sweetpluscake:latest        "docker-entrypoint.s…"   3 hours ago   Up 3 hours   0.0.0.0:3000-3001->3000-3001/tcp   thirsty_lichterman
  { find id for your container } ==> 18a4e4b12c0f
  $ docker exec -it 18a4e4b12c0f /bin/bash
```

Note) DO NOT upload your docker image anywhere as it has your AWS credentials in it.
      DO NOT commit any files that contain any credentials or secret.
