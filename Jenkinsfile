def imageName = "oms-svc-pipeline"
def getBranchName(){
    return scm.branches[0].name
}

pipeline {
    agent any

    environment {
        buildUser = ""
        dockerImage = ""
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