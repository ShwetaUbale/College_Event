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
                sh 'docker network create ${NETWORK_NAME} || true'

                // 1. Start MongoDB and allow initialization
                sh 'docker run -d --name ${MONGO_CONTAINER} --network ${NETWORK_NAME} mongo:7'
                sh 'sleep 4'

                // 2. Run the application container
                sh 'docker run -d --name ${TEST_CONTAINER} --network ${NETWORK_NAME} -e MONGO_URL=mongodb://${MONGO_CONTAINER}:27017/college_event -e MONGODB_URI=mongodb://${MONGO_CONTAINER}:27017/college_event ${IMAGE_NAME}:${BUILD_NUMBER}'
                sh 'sleep 3'

                // 3. Retry connection refused errors while Node finishes booting
                sh 'docker run --rm --network ${NETWORK_NAME} curlimages/curl --fail --retry 15 --retry-delay 2 --retry-connrefused http://${TEST_CONTAINER}:3000/health'
            }
        }
    }

    post {
        always {
            // Print app container logs to console output for debugging
            sh 'docker logs ${TEST_CONTAINER} || true'

            // Clean up
            sh 'docker rm -f ${TEST_CONTAINER} || true'
            sh 'docker rm -f ${MONGO_CONTAINER} || true'
            sh 'docker network rm ${NETWORK_NAME} || true'
            sh 'docker image rm ${IMAGE_NAME}:${BUILD_NUMBER} || true'
            archiveArtifacts artifacts: 'package-lock.json', allowEmptyArchive: true
        }
    }
}