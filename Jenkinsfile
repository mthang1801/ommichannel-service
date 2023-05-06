def getBranchName(){
    return scm.branches[0].name
}

pipeline {
    agent any

    environment {
        buildUser = ""        
        dockerImageName = "ommichannel-service" 
        buildSuccess = false
    }

    tools { 
        nodejs "nodejs-19.8.1"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

         stage("Environment") {
            environment {
                BRANCH_NAME = getBranchName()
            }
            steps {
                script { 
                sh "git --version"
                echo "branch name: ${BRANCH_NAME}"
                sh "docker --version"
                sh "printenv"
                wrap([$class : "BuildUser"]) {
                    buildUser = env.BUILD_USER_ID + "-" + env.BUILD_USER
                }
                echo "build User is : ${buildUser}"
                }
            }
        }


        stage("Installation"){
            steps {
                sh "node -v"
                sh "npm install -g yarn"
                sh "npm install --force"
            }
        }

        stage("Build And Push Image"){
              environment {
                DOCKER_TAG = "${env.BUILD_NUMBER}"
                DOCKER_IMAGE = dockerImageName 
                BRANCH_NAME = getBranchName()
            }
            steps {                
                script {
                try{
                        echo "Branch name is : ${BRANCH_NAME}"
                        if(BRANCH_NAME == "*/main" || BRANCH_NAME == "*/master") {
                            withCredentials([usernamePassword(credentialsId: "docker-hub", usernameVariable: "DOCKER_USERNAME", passwordVariable: "DOCKER_PASSWORD")]){
                                sh "echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin"
                                sh "docker build -t ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG} ."
                                sh "docker tag ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest"
                                sh "docker images | grep ${DOCKER_IMAGE}"
                                sh "docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                                sh "docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest"
                                sh "docker rmi -f ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                                sh "docker rmi -f ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest"
                            }
                        }
                        buildSuccess = true
                    }catch(error){
                        throw error;
                    }                    
                }
            }
        }
    }

    post {
        success {
            echo "Build Completed."
        }
        failure { 
            echo "Build Failed."
        }
    }
}