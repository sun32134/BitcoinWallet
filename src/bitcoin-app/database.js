var  Datastore= require('nedb');


class Database {
 
    constructor(name) {
        this.db = new Datastore({ filename: `${name}`, autoload: true });
    }

    find(q) {
        return new Promise((res, rej) => {
            this.db.find(q || {}, (err, docs) => {
                if (err) rej(err);
                res(docs);
            });
        });
    }

    insert(obj) {
        return new Promise((res, rej) => {
            this.db.insert(obj, (err) => {
                if (err) rej(err);
                res();
            });
        });
    }

    remove(q) {
        return new Promise((res, rej) => {
            this.db.remove(q, (err) => {
                if (err) rej(err);
                res();
            });
        });
    }

    update(q,obj){
        return new Promise((res,rej)=>{
            this.db.update(q,{
                $set:{
                    'account':obj  
                }
            },(err)=>{
                if(err) rej(err);
                res();
            })
        })
    }
}

module.exports=Database;
