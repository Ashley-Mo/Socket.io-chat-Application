const mongo=require('mongodb').MongoClient;
const client =require('socket.io').listen(4000).sockets;

//connect to mongo
mongo.connect('mongodb://127.0.0.1/27017' , function(err, db){
    if(err){
        throw err;
        console.log('Error is due to mongoDB');
    }
    console.log('Mongodb connected...');

    //connect to socket.io
    client.on('connection',function(socket){
        let chat = db.collection('chats');

        //create function to send status
        sendStatus= function(s){
            socket.emit('status',s);
        }

        //get chat from the mongo collection
       chat.find().limit(100).sort({_id:1}).toArray(function(err,res){
            if(err){
                throw error;
                console.log('Data collection not found');
            }

            //emit the result found from the db collections chat after sorting and toArray-ing
            socket.emit('output',res);
        });
       

        //Handle input events
        socket.on('input',function(data){
            let name=data.name;
            let message=data.message;

            //check for name and message
            if(name=='' || message==''){
                //send a status
               sendStatus('Please enter a name and message');
            }
            else{
               // (data)
                //insert the message into the db collections
                chat.insert({name: name, message: message}, function(){
                    //emit the data to the client itself
                    client.emit('output',[data]);

                    //send status object
                    sendStatus({
                        message:'Message sent',
                        clear:true
                    });
                });
            }

        });

        //handle clearing
        socket.on('clear', function(data){
            //remove all chats from the collection
            chat.remove({},function(){
                //emit a message than everything is removed/cleared
                socket.emit('cleared');
            });

        });

    });

});