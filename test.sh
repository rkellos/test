if [ ! -f ./testing_rsa ]; then
  aws s3 cp s3://consumer-services/testing_information/middleware/testing_rsa ./
fi

if [ ! -f ./testing_rsa.pem ]; then
  aws s3 cp s3://consumer-services/testing_information/middleware/testing_rsa.pem ./
fi

if [ ! -f ./testing_rsa.pub ]; then
  aws s3 cp s3://consumer-services/testing_information/middleware/testing_rsa.pub ./
fi
mocha --recursive
