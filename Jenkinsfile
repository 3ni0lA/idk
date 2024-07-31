pipeline {
    agent any
    environment {
        REPO_URL = 'https://github.com/3ni0lA/practice-repo.git'
        BRANCH = 'main'
        DEPLOY_USER = 'nodejs'
        DEPLOY_HOST = '137.184.193.255'
        DEPLOY_DIR = '/home/nodejs/app/practice-repo'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: "${BRANCH}", url: "${REPO_URL}"
            }
        }
        stage('Deploy') {
            steps {
                sshagent(credentials: ['my-ssh-agent']) {
                    sh 'ssh-add -L' // List loaded keys for debugging
                    sh """
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << EOF
                    cd ${DEPLOY_DIR}
                    git pull origin ${BRANCH}
                    npm install
                    pm2 start npm -- start
                    EOF
                    """
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Pipeline succeeded.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
