def imageName = "oms-svc-pipeline"

pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }
        stage("Clone Code") {
            steps {
               git branch: "main", url: "https://gitlab.com/mthang1801/oms-svc.git", credentialsId : "oms-svc-pipeline"
            }			
        }
		
		stage("Build App Image") {
			steps { 
				script { 
					dockerImage = docker.build(imageName + ":$BUILD_NUMBER")
				}				
			}
		}
    }
}