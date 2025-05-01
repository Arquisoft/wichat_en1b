# wichat_en1b

[![Actions Status](https://github.com/arquisoft/wichat_en1b/workflows/CI%20for%20wichat_en1b/badge.svg)](https://github.com/arquisoft/wichat_en1b/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_wichat_en1b&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Arquisoft_wichat_en1b)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_wichat_en1b&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Arquisoft_wichat_en1b)

<p float="left">
<img src="https://blog.wildix.com/wp-content/uploads/2020/06/react-logo.jpg" height="100">
<img src="https://miro.medium.com/max/365/1*Jr3NFSKTfQWRUyjblBSKeg.png" height="100">
</p>

## Deployment Server
http://wichat-en1b.francecentral.cloudapp.azure.com:3000

## Introduction
This is a base project for the Software Architecture course in 2024/2025. It is a basic application composed of several components.

- **User service**. Express service that handles the insertion of new users in the system.
- **Auth service**. Express service that handles the authentication of users.
- **LLM service**. Express service that handles the communication with the LLM, to ask questions about the game.
- **Question service**. Express service that handles the questions that are presented in the game.
- **Statistics service**. Express service that handles the statistics of the users.
- **Gateway service**. Express service that is exposed to the public and serves as a proxy to the previous ones.
- **Webapp**. React web application that uses the gateway service to manage the different application characteristics.

The **user**, **auth** and **statistics** services share a Mongo database that is accessed with mongoose.

## Team members
- **Br1NKOL** — Alberto Cuervo Arias, [UO289088@uniovi.es](mailto:uo289088@uniovi.es)
- **Rolitoansu** — Raúl Antuña Suárez, [UO294202@uniovi.es](mailto:uo294202@uniovi.es)
- **UO288583** — Fernando Sutil Fernández, [UO288583@uniovi.es](mailto:uo288583@uniovi.es)
- **orvizz** — Mario Orviz Viesca, [UO295180@uniovi.es](mailto:UO295180@uniovi.es)
- **saulmf** — Saúl Martín Fernández, [UO294936@uniovi.es](mailto:UO294936@uniovi.es)

## Quick start guide

First, clone the project:

```git clone git@github.com:arquisoft/wichat_en1b.git```

### Secrets configuration

In order to perform some operations on this project, such as comunicating with the LLM and signing tokens, we need to set up some secrets that are crucial for the application to work. In this project we use the LLM of [Empathy](https://ai-challange-2025.webflow.io/) for the game questions and [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token) to sign tokens.

We need to create an `.env` file in the root folder of the project. It should contain the following fields so the project can work locally:
```ini
# Your Empathy LLM API key
LLM_API_KEY=YOUR-API-KEY

# Your Gemini API key
GEMINI_API_KEY=YOUR-API-KEY

# JWT secret to sign tokens, locally it can be random
JWT_SECRET=YOUR-JWT-SECRET
```

To test the correct functionality of the E2E tests some preparation is needed, In order to run the e2e tests of the webapp module, another .env file in the webapp directory is needed. As it is local the value to sign tokens can be random, it should contain the following field:
```ini
# JWT secret to sign tokens, locally it can be random
JWT_SECRET=YOUR-JWT-SECRET
```
#### ⚠️ IMPORTANT
Note that this file must **NOT** be uploaded to the github repository (it is excluded in the `.gitignore`).

An extra configuration, so everything works in the deployed version of the app, is to create the same `.env` file (with the `LLM_API_KEY` and `JWT_SECRET` variables) in the virtual machine (in the home of the azureuser directory).

### Launching Using docker
For launching the application using docker compose, just type:
```docker compose --profile dev up --build```

You can optionally include the `--watch` tag so the application starts with the [watch](https://docs.docker.com/compose/how-tos/file-watch/) functionality and **hot reloads** as you save your changes: 
```docker compose --profile dev up --build --watch```

If you want that the Front-end also **hot reloads** as you save your changes, you should modify the `dockerfile` of the `webapp` module. The last command should be:
```dockerfile
CMD ["npm", "start"]
````
instead of
```dockerfile
CMD ["npm", "run", "prod"]
````

#### ⚠️ IMPORTANT
If you modify the `dockerfile`, please ensure that **it is not included by any means in your changes**. You could avoid this by including it in the `.gitignore` file.

### Component by component start
First, start the database. Either install and run Mongo or run it using docker:

```docker run -d -p 27017:27017 --name=my-mongo mongo:latest```

You can use also services like Mongo Altas for running a Mongo database in the cloud.

Now launch the auth, user and gateway services. Just go to each directory and run `npm install` followed by `npm start`.

Lastly, go to the webapp directory and launch this component with `npm install` followed by `npm start`.

After all the components are launched, the app should be available in **localhost** in port **3000**.

## Deployment
For the deployment, we have several options. The first and more flexible is to deploy to a virtual machine using SSH. This will work with any cloud service (or with our own server). Other options include using the container services that all the cloud services provide. This means, deploying our Docker containers directly. Here I am going to use the first approach. I am going to create a virtual machine in a cloud service and after installing docker and docker-compose, deploy our containers there using GitHub Actions and SSH.

### Machine requirements for deployment
The machine for deployment can be created in services like Microsoft Azure or Amazon AWS. These are in general the settings that it must have:

- Linux machine with Ubuntu > 20.04 (the recommended is 24.04).
- Docker installed.
- Open ports for the applications installed (in this case, ports 3000 for the webapp and 8000 for the gateway service).

Once you have the virtual machine created, you can install **docker** using the following instructions:

```bash
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo apt update
sudo apt install docker-ce
sudo usermod -aG docker ${USER}
```

### Continuous delivery (GitHub Actions)
Once we have our machine ready, we could deploy by hand the application, taking our docker-compose file and executing it in the remote machine. In this repository, this process is done automatically using **GitHub Actions**. The idea is to trigger a series of actions when some condition is met in the repository. The precondition to trigger a deployment is going to be: "create a new release". The actions to execute are the following:

![GitHub workflow image](https://github.com/user-attachments/assets/dde1b14f-7bc1-4036-b253-4cc86ce32701)


As you can see, unitary tests of each module and e2e tests are executed before pushing the docker images and deploying them. Using this approach we avoid deploying versions that do not pass the tests.

The deploy action is the following:

```yml
deploy:
  name: Deploy over SSH
  runs-on: ubuntu-latest
  needs: [docker-push-userservice,docker-push-authservice,docker-push-llmservice,docker-push-statisticservice,docker-push-questionservice,docker-push-gatewayservice,docker-push-webapp]
  steps:
  - name: Deploy over SSH
    uses: fifsky/ssh-action@master
    with:
      host: ${{ secrets.DEPLOY_HOST }}
      user: ${{ secrets.DEPLOY_USER }}
      key: ${{ secrets.DEPLOY_KEY }}
      command: |
        wget https://raw.githubusercontent.com/arquisoft/wichat_en1b/master/docker-compose.yml -O docker-compose.yml
        docker compose --profile prod down
        docker compose --profile prod up -d --pull always
```

This action uses three secrets that must be configured in the repository:
- `DEPLOY_HOST`: IP of the remote machine.
- `DEPLOY_USER`: user with permission to execute the commands in the remote machine.
- `DEPLOY_KEY`: key to authenticate the user in the remote machine.

Note that this action logs in the remote machine and downloads the docker-compose file from the repository and launches it. Obviously, previous actions have been executed which have uploaded the docker images to the GitHub Packages repository.
