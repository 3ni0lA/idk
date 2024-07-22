pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/3ni0lA/practice-repo.git'
            }
        }
        stage('Deploy') {
            steps {
                sshagent(credentialsId: 'my-ssh-agent') {
                    sh 'ssh nodejs@137.184.193.255 "cd /app/practice-repo; git pull origin main; npm install; npm start pm2"'
                }
            }
        }
    }
}
