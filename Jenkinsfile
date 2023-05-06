def imageName = "oms-svc-pipeline"
def getBranchName(){
    return scm.branches[0].name
}

pipeline {
    agent any

    tools { 
        nodejs "nodejs-16.20"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage("Environment"){
            environment {
                BRANCH_NAME = getBranchName()
            }
            
            steps { 
                echo "[GIT VERSION]"
                sh "git --version"
                echo "BRANCH: ${BRANCH_NAME}"
                echo "[DOCKER VERSION]"
                sh "docker --version"
                sh "printenv"
                wrap([$class: "BuildUser"]){
                    buildUser = env.BUILD_USER_ID + "-" + env.BUILD_USER
                }
                echo "build User is : ${buildUser}"
            }
        }
    }
}