pipeline {
  agent { label 'docker'}
  stages {
    stage('Run') {
      steps {
        withCredentials([file(credentialsId: '54e58df6-0a66-45d2-bc31-21fcab380ff5', variable: 'FILE')]) {
        withCredentials([file(credentialsId: 'docker-compose.release.yml', variable: 'COMPOSE_YML')]) {
          sh 'cp $FILE .env'
          sh 'docker-compose up --force-recreate -d --build -f $COMPOSE_YML --project-directory ./'
        }}
      }
    }
  }
  post { 
    always {
      cleanWs()
    }
  }
}