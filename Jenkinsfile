pipeline {
    agent any

    environment {
        IMAGE_NAME = 'college_event-app'
        TEST_CONTAINER = 'college-event-test'
        MONGO_CONTAINER = 'college-event-mongo'
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

                // 2. Start MongoDB so the health endpoint can verify its dependency
                sh 'docker run -d --name ${MONGO_CONTAINER} --network ${NETWORK_NAME} mongo:7'

                // 3. Run the application container attached to the network
                sh 'docker run -d --name ${TEST_CONTAINER} --network ${NETWORK_NAME} -e MONGO_URL=mongodb://${MONGO_CONTAINER}:27017 ${IMAGE_NAME}:${BUILD_NUMBER}'

                // 4. Run curl from a throwaway container on the SAME network
                sh 'docker run --rm --network ${NETWORK_NAME} curlimages/curl --fail --retry 10 --retry-delay 2 http://${TEST_CONTAINER}:3000/health'
            }
        }
    }

    post {
        always {
            // Clean up test container, network, and intermediate image
            sh 'docker rm -f ${TEST_CONTAINER} || true'
            sh 'docker rm -f ${MONGO_CONTAINER} || true'
            sh 'docker network rm ${NETWORK_NAME} || true'
            sh 'docker image rm ${IMAGE_NAME}:${BUILD_NUMBER} || true'
            archiveArtifacts artifacts: 'package-lock.json', allowEmptyArchive: true
        }
    }
}