pipeline {
    agent any

    environment {
        IMAGE_NAME = 'college-event-registration'
        COMPOSE_PROJECT_NAME = 'college-event-jenkins'
    }

    stages {
        stage('Install') {
            steps {
                sh 'docker run --rm -v "$PWD:/app" -w /app node:22-alpine npm install --ignore-scripts'
            }
        }
        stage('Validate') {
            steps {
                sh 'cat server.js | docker run --rm -i node:22-alpine node --check'
                sh 'cat public/app.js | docker run --rm -i node:22-alpine node --check'
                sh 'docker compose config -q'
            }
        }
        stage('Build image') {
            steps {
                sh 'docker build --tag ${IMAGE_NAME}:${BUILD_NUMBER} .'
            }
        }
        stage('Smoke test') {
            steps {
                sh 'docker compose up -d'
                sh 'curl --fail --retry 10 --retry-delay 2 http://localhost:3000/health'
            }
        }
    }

    post {
        always {
            sh 'docker compose down -v || true'
            sh 'docker image rm ${IMAGE_NAME}:${BUILD_NUMBER} || true'
            archiveArtifacts artifacts: 'package-lock.json', allowEmptyArchive: true
        }
    }
}
