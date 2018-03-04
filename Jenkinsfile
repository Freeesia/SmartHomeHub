pipeline {
  agent { label 'docker'}
  stages {
    stage('Run') {
      steps {
        withCredentials([file(credentialsId: '30d01398-ecc9-40dd-9859-88a153668be1', variable: 'FILE')]) {
          sh 'cp $FILE .env'
          sh 'docker-compose up -d --build'
        }
      }
    }
  }
}