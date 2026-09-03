pipeline {
    agent any

    environment {
        IMAGE_NAME = 'college_event-app'
        TEST_CONTAINER = 'college-event-test'
        NETWORK_NAME = 'college-net'
    }

    stages {
        stage('Validate') {
            steps {
                // Pass code via stdin so it reads from Jenkins' local workspace
                sh 'cat server.js | docker run --rm -i node:22-alpine node --check'
                sh 'cat public/app.js | docker run --rm -i node:22-alpine node --check'
            }
        }

        stage('Build image') {
            steps {
                sh 'docker build --tag ${IMAGE_NAME}:${BUILD_NUMBER} .'
            }
        }

        stage('Smoke test') {
            steps {
                // 1. Create a dedicated bridge network
                sh 'docker network create ${NETWORK_NAME} || true'

                // 2. Run the application container attached to the network
                sh 'docker run -d --name ${TEST_CONTAINER} --network ${NETWORK_NAME} ${IMAGE_NAME}:${BUILD_NUMBER}'

                // 3. Run curl from a throwaway container on the SAME network
                sh 'docker run --rm --network ${NETWORK_NAME} curlimages/curl --fail --retry 10 --retry-delay 2 http://${TEST_CONTAINER}:3000/health'
            }
        }
    }

    post {
        always {
            // Clean up test container, network, and intermediate image
            sh 'docker rm -f ${TEST_CONTAINER} || true'
            sh 'docker network rm ${NETWORK_NAME} || true'
            sh 'docker image rm ${IMAGE_NAME}:${BUILD_NUMBER} || true'
            archiveArtifacts artifacts: 'package-lock.json', allowEmptyArchive: true
        }
    }
}