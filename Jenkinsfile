pipeline {
  agent { label 'docker'}
  stages {
    stage('Run') {
      steps {
        withCredentials([file(credentialsId: '54e58df6-0a66-45d2-bc31-21fcab380ff5', variable: 'FILE')]) {
          sh 'cp $FILE .env'
          sh 'docker-compose up -d --build'
        }
      }
    }
  }
  post { 
    always {
      cleanWs()
    }
  }
}