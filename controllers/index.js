var express = require('express') ,
    router = express.Router();
router.use('/api/users', require('./users'));
router.use('/api/address', require('./address'));
router.use('/api/taxi', require('./taxi'));
module.exports = router;