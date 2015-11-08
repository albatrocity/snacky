var express       = require('express');
var router        = express.Router();
var http          = require('http');
var fs            = require('fs');
var AWS           = require('aws-sdk');
AWS.config.region = process.env['BUCKET_REGION'];
var s3 = new AWS.S3();

/* GET users listing. */
router.get('/:id', function(req, res, next) {
  var filename = req.params.id;
  var params = {bucket: process.env['BUCKET_NAME'], key: filename};
  var imgStream = s3.getObject({
    Bucket: process.env['BUCKET_NAME'],
    Key: "snacky/" +filename
  }).createReadStream();

  imgStream.pipe(res);
});

module.exports = router;
