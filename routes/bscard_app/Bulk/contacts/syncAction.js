var express = require('express');
var router = express.Router();

// update(id, contactSyncAction, cb) {
//     const data = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['createdAt', 'createdBy', 'fields', 'identifierFieldName', 'isSyncTriggeredOnImport', 'kbUsed', 'name', 'syncActions', 'updatedAt', 'updatedBy', 'uri'], contactSyncAction);
//
//     return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
//         api: 'Bulk',
//         uri: `/contacts/syncActions/${id}`,
//         method: 'put',
//         data: data
//     }, cb);
// }
router.get('/' , function (req,res,next) {
    bscard_eloqua.bulk.contacts.syncActions.get().then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
    });
});

router.get('/one/:id' , function (req,res,next) {
    bscard_eloqua.bulk.contacts.syncActions.get(req.query.id).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
    });
});


router.post('/update/:id' , function (req,res,next) {
    bscard_eloqua.bulk.contacts.syncActions.update(req.params.id , req.body).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
    });
});


// getOne(id, cb) {
//     return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
//         api: 'Bulk',
//         uri: `/contacts/syncActions/${id}`
//     }, cb);
// }
//
// create(contactSyncAction, cb) {
//     const data = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['createdAt', 'createdBy', 'fields', 'identifierFieldName', 'isSyncTriggeredOnImport', 'kbUsed', 'name', 'syncActions', 'updatedAt', 'updatedBy', 'uri'], contactSyncAction);
//
//     return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
//         api: 'Bulk',
//         uri: '/contacts/syncActions',
//         method: 'post',
//         data: data
//     }, cb);
// }
//


module.exports = router;